import AWS              from 'aws-sdk';
import stream           from 'stream';
import log              from 'Utilities/logutils';

class aws {
  constructor({ access_key, secret_key, region }) {
    this.props = {
      config: {
        s3: { 
          apiVersion: '2006-03-01' 
        , accessKeyId: access_key
        , secretAccessKey: secret_key
        , region: region
        }
      , rekognition: {
          apiVersion: '2016-06-27'
        , accessKeyId: access_key
        , secretAccessKey: secret_key
        , region: region
        }
      }
    };
    this.rekognition  = new AWS.Rekognition(this.props.config.rekognition);
    this.s3           = new AWS.S3(this.props.config.s3);
  }

  static of(props) {
    return new aws(props);
  }

  request(operation, options) {
    switch(operation) {
      case 'text':
        return new Promise((resolve, reject) => {
          const { params } = options;
          this.rekognition.detectText(params, (err, data) => {
            if(err) return reject(err);
            log.trace(aws.displayName, 'Text', data);
            resolve(data);
          });
        });
      case 'label':
        return new Promise((resolve, reject) => {
          this.rekognition.detectLabels(options.params, (err, data) => {
            if(err) return reject(err);
            log.trace(aws.displayName, 'Label', data);
            resolve(data);
          });
        });
    }
  }

  getText(params) {
    return this.request('text', { params });
  }

  getLabel(params) {
    return this.request('label', { params });
  }

  putObject(params) {
    return this.request('object', { params });
  }

  fetchText(bucket, filename) {
    const params = { Image: { S3Object: { Bucket: bucket, Name: filename }}, MinConfidence: 0.0 };
    return this.getText(params);
  }

  fetchLabel(bucket, filename) {
    const params = { Image: { S3Object: { Bucket: bucket, Name: filename }}, MaxLabels: 1, MinConfidence: 70 };
    return this.getLabel(params);
  }

  createWriteStream(bucket, filename) {
    const pass = new stream.PassThrough();
    const params = { Bucket: bucket, Key: filename, Body: pass };
    const results = this.s3.upload(params);
    results.promise()
      .then(data => log.trace(aws.displayName, 'Object', data))
      .catch(err => log.error(aws.displayName, err.name, err.message, err.stack));
    results.on('httpUploadProgress', progress => log.info(aws.displayName, 'Progress', progress));
    return pass;
  }
};
aws.displayName = 'aws';
export default aws;
