import AWS              from 'aws-sdk';
import stream           from 'stream';
import log              from 'Utilities/logutils';

class aws {
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
    this.s3          = new AWS.S3(s3);
  }

  static of(props) {
    return new aws(props);
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
    const pass = new stream.PassThrough();
    const params = { Bucket: bucket, Key: filename, Body: pass };
    const promise = this.s3.upload(params).promise();
    promise
      .then(data => log.info(aws.displayName, '[UPLOAD]', data))
      .catch(err => log.error(aws.displayName, err.name, err.message, err.stack));
    return pass;
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
};
aws.displayName = 'aws';
export default aws;