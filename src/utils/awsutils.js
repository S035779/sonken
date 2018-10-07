import AWS              from 'aws-sdk';
import * as R           from 'ramda';
import archiver         from 'archiver';
import bufferStream     from 'stream-buffers';
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

  fetchText(bucket, filename) {
    const params = { Image: { S3Object: { Bucket: bucket, Name: filename }}, MinConfidence: 0.0 };
    const promise = this.rekognition.detectText(params).promise();
    return promise;
  }

  fetchLabel(bucket, filename) {
    const params = { Image: { S3Object: { Bucket: bucket, Name: filename }}, MaxLabels: 1, MinConfidence: 70 };
    const promise = this.rekognition.detectLabels(params).promise();
    return promise;
  }

  createWriteStream(bucket, filename) {
    const passStream = new stream.PassThrough();
    const params = { Bucket: bucket, Key: filename, Body: passStream };
    const promise = this.s3.upload(params).promise();
    promise
      //.then(data => log.trace(awsutils.displayName, '[UPLOAD]', data))
      .catch(err => log.error(awsutils.displayName, err.name, err.message, err.stack));
    return passStream;
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

  fetchBucketWebsite(bucket) {
    const params = { Bucket: bucket };
    const promise = this.s3.getBucketWebsite(params).promise();
    return promise;
  }

  fetchSignedUrl(bucket, { key, name }) {
    const ResponseContentDisposition = 'attachment; filename="' + name + '"';
    const params = { Bucket: bucket, Key: key, Expires: 60, ResponseContentDisposition };
    const promise = this.s3.getSignedUrl('getObject', params).promise();
    return promise;
  }

  fetchObjects(bucket, files) {
    const promises = R.map(obj => this.fetchObject(bucket, { key: obj.key, name: obj.name }));
    return Promise.all(promises(files))
      .then(this.createArchive);
  }

  fetchTorrents(bucket, files) {
    const promises = R.map(obj => this.fetchTorrent(bucket, { key: obj.key, name: obj.name }));
    return Promise.all(promises(files))
      .then(this.createArchive);
  }

  createArchive(files) {
    return new Promise((resolve, reject) => {
      if(files.length === 0) return reject({ name: 'awsutils', message: 'File not found.' });
      const output = new bufferStream.WritableStreamBuffer();
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('finish', () => resolve(output.getContents()));
      archive.on('warning', err => err.code !== 'ENOENT' ? reject(err) : null);
      archive.on('error', err => reject(err));
      archive.pipe(output);
      R.map(obj => archive.append(obj.buffer , { name: obj.name }), files);
      archive.finalize();
    });
  }

  fetchObject(bucket, { key, name }) {
    const ResponseContentDisposition = 'attachment; filename="' + name + '"';
    const params = { Bucket: bucket, Key: key, ResponseContentDisposition };
    const promise = this.s3.getObject(params).promise();
    return promise
      .then(obj => ({ name, buffer: obj.Body }));
  }

  fetchTorrent(bucket, { key, name }) {
    const ResponseContentDisposition = 'attachement; filename="' + name + '"';
    const params = { Bucket: bucket, Key: key, ResponseContentDisposition };
    const promise = this.s3.getObjectTorrent(params).promise();
    return promise
      .then(obj => ({ name, buffer: obj.Body }));
  }
}
awsutils.displayName = 'awsutils';
export default awsutils;
