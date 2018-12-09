import fs               from 'fs-extra';
import path             from 'path';
import AWS              from 'aws-sdk';
import * as R           from 'ramda';
import archiver         from 'archiver';
import yazl             from 'yazl';
import stream           from 'stream';
import log              from 'Utilities/logutils';

class awsutils {
  constructor({ access_key, secret_key, region }) {
    const s3          = { 
      apiVersion: '2006-03-01' 
    , accessKeyId: access_key
    , secretAccessKey: secret_key
    , region: region
    };
    const rekognition = {
      apiVersion: '2016-06-27'
    , accessKeyId: access_key
    , secretAccessKey: secret_key
    , region: region
    };
    this.props = { config: { s3, rekognition } };
    this.rekognition = new AWS.Rekognition(rekognition);
    this.s3 = new AWS.S3(s3);
  }

  static of(props) {
    return new awsutils(props);
  }

  fetchText(bucket, name) {
    const params = { Image: { S3Object: { Bucket: bucket, Name: name }}, MinConfidence: 0.0 };
    const promise = this.rekognition.detectText(params).promise();
    return promise;
  }

  fetchLabel(bucket, name) {
    const params = { Image: { S3Object: { Bucket: bucket, Name: name }}, MaxLabels: 1, MinConfidence: 70 };
    const promise = this.rekognition.detectLabels(params).promise();
    return promise;
  }

  fetchBucketAcl(bucket) {
    const params = { Bucket: bucket };
    const promise = this.s3.getBucketAcl(params).promise();
    return promise;
  }

  fetchBucketPolicy(bucket) {
    const params = { Bucket: bucket };
    const promise = this.s3.getBucketPolicy(params).promise();
    return promise;
  }

  fetchBucketCors(bucket) {
    const params = { Bucket: bucket };
    const promise = this.s3.getBucketCors(params).promise();
    return promise;
  }

  fetchBucketList() {
    const promise = this.s3.listBuckets().promise();
    return promise;
  }

  fetchBucketWebsite(bucket) {
    const params = { Bucket: bucket };
    const promise = this.s3.getBucketWebsite(params).promise();
    return promise;
  }

  checkObjectExists(bucket, key) {
    const params = { Bucket: bucket, Key: key };
    const promise = this.s3.waitFor('objectExists', params).promise();
    return promise;
  }

  checkObjectNotExists(bucket, key) {
    const params = { Bucket: bucket, Key: key };
    const promise = this.s3.waitFor('objectNotExists', params).promise();
    return promise;
  }

  checkObjectList(bucket, files) {
    const _isFiles  = (objs, file) => R.contains(file.key, objs);
    const isFiles   = R.curry(_isFiles);
    const hasFiles  = objs => R.filter(_file => isFiles(objs, _file), files);
    const setKeys   = obj  => R.map(obj => obj.Key, obj.Contents);
    return this.fetchObjectList(bucket)
      .then(setKeys)
      .then(hasFiles);
  }

  fetchObjectHead(bucket, key) {
    const params = { Bucket: bucket, Key: key };
    const promise = this.s3.headObject(params).promise();
    return promise;
  }

  fetchObjectList(bucket) {
    const params = { Bucket: bucket };
    const promise = this.s3.listObjects(params).promise();
    return promise;
  }

  fetchSignedUrl(bucket, { key, name, file }) {
    const ResponseContentDisposition = 'attachment; filename="' + name + '"';
    const params = { Bucket: bucket, Key: key, Expires: 60 * 60 * 24 * 180, ResponseContentDisposition };
    return new Promise((resolve, reject) => {
      this.s3.getSignedUrl('getObject', params, (err, url) => {
        if(err) return reject(err);
        const result = file ? R.merge(file, { url }) : { url };
        resolve(result);
      });
    });
  }

  fetchSignedUrls(bucket, files) {
    const promises = R.map(file => this.fetchSignedUrl(bucket, file));
    return Promise.all(promises(files));
  }

  fetchObject(bucket, { key, name }) {
    const ResponseContentDisposition = 'attachment; filename="' + name + '"';
    const params = { Bucket: bucket, Key: key, ResponseContentDisposition };
    const setBuffer = obj => ({ name: name, buffer: obj.Body });
    const promise = this.s3.getObject(params).promise();
    return promise.then(setBuffer);
  }

  fetchObjects(bucket, files) {
    const promises = R.map(obj => this.fetchObject(bucket, { key: obj.key, name: obj.name }));
    return Promise.all(promises(files));
  }

  fetchTorrent(bucket, { key, name }) {
    const params = { Bucket: bucket, Key: key };
    const setTorrent = obj => ({ name: name + '.torrent', buffer: obj.Body });
    const promise = this.s3.getObjectTorrent(params).promise();
    return promise.then(setTorrent);
  }

  fetchTorrents(bucket, files) {
    const promises = R.map(obj => this.fetchTorrent(bucket, { key: obj.key, name: obj.name }));
    return Promise.all(promises(files));
  }

  createWriteStream(bucket, key) {
    const passStream = new stream.PassThrough();
    const params = { Bucket: bucket, Key: key, Expires: 60 * 60 * 24 * 180, Body: passStream };
    const manager = this.s3.upload(params, (err, data) => {
      if(err) {
        log.error(awsutils.displayName, err.name, err.message, err.stack);
        passStream.destroy(err);
      }
      log.trace(awsutils.displayName, '[UPLOAD]', data);
    });
    manager.on('httpUploadProgress', obj => log.trace(awsutils.displayName, 'aws:progress:', obj));
    return passStream;
  }

  createReadStream(bucket, key) {
    const params = { Bucket: bucket, Key: key };
    return this.s3.getObject(params).createReadStream();
  }

  createObject(bucket, { key, body }) {
    const params = { Bucket: bucket, Key: key, Body: body };
    const promise = this.s3.upload(params).promise();
    return promise;
  }

  deleteObject(bucket, { key, file }) {
    const params = { Bucket: bucket, Key: key };
    const promise = this.s3.deleteObject(params).promise();
    const setFile = obj => R.merge(file, { status: obj });
    return promise.then(setFile);
  }

  createS3Archives(bucket, cache, params) {
    return new Promise((resolve, reject) => {
      const { key, files } = params;
      if(files.length === 0) return reject({ name: 'NotFound', message: 'File not found.' });
      const tmpfile = path.resolve(__dirname, '../', cache, `cachefile_${Date.now()}.tmp`);
      const dst = fs.createWriteStream(tmpfile);
      const arc = archiver('zip', { zlib: { level: 9 } });
      dst.on('error', reject);
      dst.on('finish', () => {
        log.trace(awsutils.displayName, 'dst:finish:', tmpfile);
        const _src = fs.createReadStream(tmpfile);
        const _dst = this.createWriteStream(bucket, key);
        _dst.on('error',  reject);
        //_dst.on('pipe',   ()  => log.debug(awsutils.displayName, '_dst:pipe',   'it is pipe.'))
        //_dst.on('unpipe', ()  => log.debug(awsutils.displayName, '_dst:unpipe', 'it is unpipe.'))
        //_dst.on('drain',  ()  => log.debug(awsutils.displayName, '_dst:drain',  'it is drain.'))
        //_dst.on('close',  ()  => log.debug(awsutils.displayName, '_dst:close',  'it is close.'))
        //_dst.on('end',    ()  => log.debug(awsutils.displayName, '_dst:end',    'it is end.'))
        _dst.on('finish', ()  => {
          log.info(awsutils.displayName, '_dst:finish', key);
          fs.unlink(tmpfile, err => { 
            if(err) return reject(err);
            resolve(params);
          });
        })
        _src.on('error', reject);
        //_src.on('pipe',   ()  => log.debug(awsutils.displayName, '_src:pipe',   'it is pipe.'))
        //_src.on('unpipe', ()  => log.debug(awsutils.displayName, '_src:unpipe', 'it is unpipe.'))
        //_src.on('drain',  ()  => log.debug(awsutils.displayName, '_src:drain',  'it is drain.'))
        //_src.on('close',  ()  => log.info(awsutils.displayName,  '_src:close',  'it is close.'));
        //_src.on('finish', ()  => log.info(awsutils.displayName,  '_src:finish', 'it is finish.'));
        //_src.on('end',    ()  => log.debug(awsutils.displayName, '_src:end',    tmpfile));
        _src.pipe(_dst)
      });
      arc.on('warning', err => err.code !== 'ENOENT' ? reject(err) : null);
      arc.on('error', reject);
      arc.pipe(dst);
      R.map(obj => arc.append(this.createReadStream(bucket, obj.key), { name: obj.name }), files);
      arc.finalize();
    });
  }

  _createArchives(bucket, cache, params) {
    return new Promise((resolve, reject) => {
      const { key, files, subpath } = params;
      if(files.length === 0) return reject({ name: 'NotFound', message: 'File not found.' });
      const tmpfile = path.resolve(__dirname, '../', cache, `cachefile_${Date.now()}.tmp`);
      const srcdir  = path.resolve(__dirname, '../', cache, subpath);
      const dst = fs.createWriteStream(tmpfile);
      const arc = archiver('zip', { zlib: { level: 9 } });
      dst.on('error', reject);
      dst.on('finish', () => {
        log.trace(awsutils.displayName, 'dst:finish:', tmpfile);
        const _src = fs.createReadStream(tmpfile);
        const _dst = this.createWriteStream(bucket, key);
        _dst.on('error', reject);
        //_dst.on('pipe',   ()  => log.debug(awsutils.displayName, '_dst:pipe',   'it is pipe.'))
        //_dst.on('unpipe', ()  => log.debug(awsutils.displayName, '_dst:unpipe', 'it is unpipe.'))
        //_dst.on('drain',  ()  => log.debug(awsutils.displayName, '_dst:drain',  'it is drain.'))
        //_dst.on('close',  ()  => log.info(awsutils.displayName,  '_dst:close',  'it is close.'))
        //_dst.on('end',    ()  => log.debug(awsutils.displayName, '_dst:end',    'it is end.'))
        _dst.on('finish', ()  => {
          log.info(awsutils.displayName, '_dst:finish', key);
          fs.remove(srcdir, err => {
            if(err) return reject(err);
            fs.unlink(tmpfile, err => {
              if(err) return reject(err);
              resolve(params);
            });
          });
        })
        _src.on('error',  reject);
        //_src.on('pipe',   src => log.debug(awsutils.displayName, '_src:pipe',   'it is pipe.'))
        //_src.on('unpipe', src => log.debug(awsutils.displayName, '_src:unpipe', 'it is unpipe.'))
        //_src.on('drain',  ()  => log.debug(awsutils.displayName, '_src:drain',  'it is drain.'))
        //_src.on('close',  ()  => log.info(awsutils.displayName,  '_src:close',  'it is close.'));
        //_src.on('finish', ()  => log.info(awsutils.displayName,  '_src:finish', 'it is finish.'));
        //_src.on('end',    ()  => log.debug(awsutils.displayName, '_src:end',    srcfile));
        _src.pipe(_dst)
      });
      arc.on('warning', err => err.code !== 'ENOENT' ? reject(err) : null);
      arc.on('error', reject);
      arc.pipe(dst);
      R.map(obj => arc.append(fs.createReadStream(path.resolve(srcdir, obj.name)), { name: obj.name }), files);
      arc.finalize();
    });
  }

  createArchive(bucket, cache, params) {
    return new Promise((resolve, reject) => {
      const { key, files } = params
      const file = R.head(files);
      if(files.length === 0) return reject({ name: 'NotFound', message: 'File not found.' });
      const tmpfile = path.resolve(__dirname, '../', cache, `cachefile_${Date.now()}.tmp`);
      const srcfile = path.resolve(__dirname, '../', cache, file.name);
      const dst = fs.createWriteStream(tmpfile);
      const src = fs.createReadStream(srcfile)
      const zip = new yazl.ZipFile();
      dst.on('error', reject);
      dst.on('close', () => {
        log.trace(awsutils.displayName, 'dst:close:', tmpfile);
        const _src = fs.createReadStream(tmpfile);
        const _dst = this.createWriteStream(bucket, key);
        _dst.on('error', reject);
        //_dst.on('pipe',   ()  => log.debug(awsutils.displayName, '_dst:pipe',   'it is pipe.'));
        //_dst.on('unpipe', ()  => log.debug(awsutils.displayName, '_dst:unpipe', 'it is unpipe.'));
        //_dst.on('drain',  ()  => log.debug(awsutils.displayName, '_dst:drain',  'it is drain.'));
        //_dst.on('close',  ()  => log.info(awsutils.displayName,  '_dst:close',  'it is close.'));
        //_dst.on('end',    ()  => log.debug(awsutils.displayName, '_dst:end',    'it is end.'));
        _dst.on('finish', ()  => {
          log.info(awsutils.displayName, '_dst:finish', key);
          fs.unlink(srcfile, err => {
            if(err) return reject(err);
            fs.unlink(tmpfile, err => {
              if(err) return reject(err);
              resolve(params);
            });
          });
        });
        _src.on('error',  reject);
        //_src.on('pipe',   ()  => log.debug(awsutils.displayName, '_src:pipe',   'it is pipe.'));
        //_src.on('unpipe', ()  => log.debug(awsutils.displayName, '_src:unpipe', 'it is unpipe.'));
        //_src.on('drain',  ()  => log.debug(awsutils.displayName, '_src:drain',  'it is drain.'));
        //_src.on('close',  ()  => log.info(awsutils.displayName,  '_src:close',  'it is close.'));
        //_src.on('finish', ()  => log.info(awsutils.displayName,  '_src:finish', 'it is finish.'));
        //_src.on('end',    ()  => log.debug(awsutils.displayName, '_src:end', srcfile));
        _src.pipe(_dst);
      });
      zip.outputStream.pipe(dst);
      zip.addReadStream(src, file.name);
      zip.end();
    });
  }

  createArchives(bucket, cache, params) {
    return new Promise((resolve, reject) => {
      const { key, files, subpath } = params
      if(files.length === 0) return reject({ name: 'NotFound', message: 'File not found.' });
      const tmpfile = path.resolve(__dirname, '../', cache, `cachefile_${Date.now()}.tmp`);
      const srcdir  = path.resolve(__dirname, '../', cache, subpath);
      const dst = fs.createWriteStream(tmpfile);
      const zip = new yazl.ZipFile();
      dst.on('error', reject);
      dst.on('close', () => {
        log.trace(awsutils.displayName, 'dst:close:', tmpfile);
        const _src = fs.createReadStream(tmpfile);
        const _dst = this.createWriteStream(bucket, key);
        _dst.on('error', reject);
        //_dst.on('pipe',   src => log.debug(awsutils.displayName, '_dst:pipe',    'it is pipe.'))
        //_dst.on('unpipe', src => log.debug(awsutils.displayName, '_dst:unpipe',  'it is unpipe.'))
        //_dst.on('drain',  ()  => log.debug(awsutils.displayName, '_dst:drain',   'it is drain.'))
        //_dst.on('close',  ()  => log.info(awsutils.displayName,  '_dst:close',   'it is close.'))
        //_dst.on('end',    ()  => log.debug(awsutils.displayName, '_dst:end',     'it is end.'))
        _dst.on('finish', ()  => {
          log.info(awsutils.displayName, '_dst:finish', key);
          fs.remove(srcdir, err => {
            if(err) return reject(err);
            fs.unlink(tmpfile, err => {
              if(err) return reject(err);
              resolve(params);
            });
          });
        })
        _src.on('error', reject);
        //_src.on('pipe',   ()  => log.debug(awsutils.displayName, '_src:pipe',   'it is pipe.'));
        //_src.on('unpipe', ()  => log.debug(awsutils.displayName, '_src:unpipe', 'it is unpipe.'));
        //_src.on('drain',  ()  => log.debug(awsutils.displayName, '_src:drain',  'it is drain.'));
        //_src.on('close',  ()  => log.info(awsutils.displayName,  '_src:close',  'it is close.'));
        //_src.on('finish', ()  => log.info(awsutils.displayName,  '_src:finish', 'it is finish.'));
        //_src.on('end',    ()  => log.debug(awsutils.displayName, '_src:end:',   srcfile));
        _src.pipe(_dst)
      });
      zip.outputStream.pipe(dst);
      R.map(obj => zip.addReadStream(fs.createReadStream(path.resolve(srcdir, obj.name)), obj.name), files);
      zip.end();
    });
  }

}
awsutils.displayName = 'awsutils';
export default awsutils;
