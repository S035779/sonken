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
    this.zip = new yazl.ZipFile();
    this.archive = archiver('zip', { zlib: { level: 9 } });
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
    //passStream.on('error',  err => log.error(awsutils.displayName, err.name, err.message, err.stack));
    //passStream.on('drain',  () => log.debug(awsutils.displayName, 'Drain:', 'it is drain.'));
    //passStream.on('close',  () => log.debug(awsutils.displayName, 'Close:', 'it is close.'));
    //passStream.on('finish', () => log.debug(awsutils.displayName, 'Finish:', 'it is finish.'));
    //passStream.on('pipe',   src => log.debug(awsutils.displayName, 'Pipe:', src));
    //passStream.on('unpipe', src => log.debug(awsutils.displayName, 'Unpipe:', src));
    manager.on('httpUploadProgress', obj => log.trace(awsutils.displayName, 'Progress:', obj));
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
    const setFile = obj => R.merge(file, { response: obj });
    return promise.then(setFile);
  }

  createS3Archive(bucket, cache, { key, files }) {
    return new Promise((resolve, reject) => {
      if(files.length === 0) return reject({ name: 'Warning:', message: 'File not found.' });
      const cachefile = path.resolve(__dirname, '../', cache, `cachefile_${Date.now()}.tmp`);
      const dst = fs.createWriteStream(cachefile);
      dst.on('finish', () => {
        log.trace(awsutils.displayName, 'finish:', cachefile);
        const src = fs.createReadStream(cachefile);
        src.pipe(this.createWriteStream(bucket, key));
        src.on('end', () => log.trace(awsutils.displayName, 'end', key));
        src.on('close', () => {
          log.trace(awsutils.displayName, 'close', key);
          fs.unlink(cachefile, err => reject(err));
          resolve({ Bucket: bucket, Key: key });
        });
      });
      this.archive.on('warning', err => err.code !== 'ENOENT' ? reject(err) : null);
      this.archive.on('error', err => reject(err));
      this.archive.pipe(dst);
      R.map(obj => this.archive.append(this.createReadStream(bucket, obj.key), { name: obj.name }), files);
      this.archive.finalize();
    });
  }

  createArchive(bucket, cache, { key, files, subpath }) {
    return new Promise((resolve, reject) => {
      if(files.length === 0) return reject({ name: 'Warning:', message: 'File not found.' });
      const cachefile = path.resolve(__dirname, '../', cache, `cachefile_${Date.now()}.tmp`);
      const subdir    = path.resolve(__dirname, '../', cache, subpath);
      const dst = fs.createWriteStream(cachefile);
      dst.on('finish', () => {
        log.trace(awsutils.displayName, 'finish:', cachefile);
        const src = fs.createReadStream(cachefile);
        src.pipe(this.createWriteStream(bucket, key)).on('error', reject);
        src.on('end', () => log.trace(awsutils.displayName, 'end', key));
        src.on('close', () => {
          log.trace(awsutils.displayName, 'close', key);
          fs.remove(subdir, err => {
            if(err) return reject(err);
            fs.unlink(cachefile, reject);
            resolve({ Bucket: bucket, Key: key });
          });
        });
      });
      this.archive.on('warning', err => err.code !== 'ENOENT' ? reject(err) : null);
      this.archive.on('error', reject);
      this.archive.pipe(dst);
      R.map(obj => this.archive.append(fs.createReadStream(path.resolve(subdir, obj.name)), { name: obj.name }), files);
      this.archive.finalize();
    });
  }

  createZipArchive(bucket, cache, { key, files, subpath }) {
    return new Promise((resolve, reject) => {
      if(files.length === 0) return reject({ name: 'Warning:', message: 'File not found.' });
      const cachefile = path.resolve(__dirname, '../', cache, `cachefile_${Date.now()}.tmp`);
      const subdir    = path.resolve(__dirname, '../', cache, subpath);
      const dst = fs.createWriteStream(cachefile);
      dst.on('close', () => {
        log.trace(awsutils.displayName, 'close:', cachefile);
        const src = fs.createReadStream(cachefile);
        src.pipe(this.createWriteStream(bucket, key)).on('error', reject);
        src.on('end', () => log.trace(awsutils.displayName, 'end', key));
        src.on('close', () => {
          log.trace(awsutils.displayName, 'close', key);
          fs.remove(subdir, err => {
            if(err) return reject(err);
            fs.unlink(cachefile, reject);
            resolve({ Bucket: bucket, Key: key });
          });
        });
      });
      this.zip.outputStream.pipe(dst);
      R.map(obj => this.zip.addReadStream(fs.createReadStream(path.resolve(subdir, obj.name)), obj.name), files);
      this.zip.end();
    });
  }

}
awsutils.displayName = 'awsutils';
export default awsutils;
