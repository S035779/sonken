import dotenv           from 'dotenv';
import fs               from 'fs-extra';
import path             from 'path';
import AWS              from 'aws-sdk';
import * as R           from 'ramda';
import archiver         from 'archiver';
import stream           from 'stream';
import log              from 'Utilities/logutils';

const config = dotenv.config();
if(config.error) throw config.error;

const CACHE = process.env.CACHE;

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

  fetchObjectList(bucket) {
    const params = { Bucket: bucket };
    const promise = this.s3.listObjects(params).promise();
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

  fetchBucketWebsite(bucket) {
    const params = { Bucket: bucket };
    const promise = this.s3.getBucketWebsite(params).promise();
    return promise;
  }

  fetchSignedUrl(bucket, { key, name }) {
    const ResponseContentDisposition = 'attachment; filename="' + name + '"';
    const params = { Bucket: bucket, Key: key, Expires: 60, ResponseContentDisposition };
    return new Promise((resolve, reject) => {
      this.s3.getSignedUrl('getObject', params, (err, url) => {
        if(err) return reject(err);
        resolve(url);
      });
    });
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
    return Promise.all(promises(files)).then(this.createArchive);
  }

  fetchTorrent(bucket, { key, name }) {
    const params = { Bucket: bucket, Key: key };
    const setTorrent = obj => ({ name: name + '.torrent', buffer: obj.Body });
    const promise = this.s3.getObjectTorrent(params).promise();
    return promise.then(setTorrent);
  }

  fetchTorrents(bucket, files) {
    const promises = R.map(obj => this.fetchTorrent(bucket, { key: obj.key, name: obj.name }));
    return Promise.all(promises(files)).then(this.createArchive);
  }

  createWriteStream(bucket, key) {
    const passStream = new stream.PassThrough();
    const params = { Bucket: bucket, Key: key, Body: passStream };
    this.s3.upload(params, (err, data) => {
      if(err) log.error(awsutils.displayName, err.name, err.message, err.stack);
      log.trace(awsutils.displayName, '[UPLOAD]', data);
    });
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

  createArchiveFromS3(bucket, { key, files }) {
    return new Promise((resolve, reject) => {
      if(files.length === 0) return reject({ name: 'Warning:', message: 'File not found.' });
      const archive = archiver('zip', { zlib: { level: 9 } });
      const cachefile = path.resolve(__dirname, '../', CACHE, `cachefile_${Date.now()}.tmp`);
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
      archive.on('warning', err => err.code !== 'ENOENT' ? reject(err) : null);
      archive.on('error', err => reject(err));
      archive.pipe(dst);
      R.map(obj => archive.append(this.createReadStream(bucket, obj.key), { name: obj.name }), files);
      archive.finalize();
    });
  }

  createArchiveFromFS(bucket, { key, files, subpath }) {
    return new Promise((resolve, reject) => {
      if(files.length === 0) return reject({ name: 'Warning:', message: 'File not found.' });
      const archive = archiver('zip', { zlib: { level: 9 } });
      const cachefile = path.resolve(__dirname, '../', CACHE, `cachefile_${Date.now()}.tmp`);
      const subdir    = path.resolve(__dirname, '../', CACHE, subpath);
      const dst = fs.createWriteStream(cachefile);
      dst.on('finish', () => {
        log.trace(awsutils.displayName, 'finish:', cachefile);
        const src = fs.createReadStream(cachefile);
        src.pipe(this.createWriteStream(bucket, key));
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
      archive.on('warning', err => err.code !== 'ENOENT' ? reject(err) : null);
      archive.on('error', err => reject(err));
      archive.pipe(dst);
      R.map(obj => archive.append(fs.createReadStream(path.resolve(subdir, obj.name)), { name: obj.name }), files);
      archive.finalize();
    });
  }
}
awsutils.displayName = 'awsutils';
export default awsutils;
