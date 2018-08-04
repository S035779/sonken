import AWS    from 'aws-sdk';
import stream from 'stream';
import log    from 'Utilities/logutils';

class aws {
  constructor({ access_key, secret_key }) {
    this.props = {
      config: {
        s3: { 
          apiVersion: '2006-03-01' 
        , accessKeyId: access_key
        , secretAccessKey: secret_key
        , region: 'ap-northeast-1'
        }
      , rekognition: {
          apiVersion: '2016-06-27'
        , accessKeyId: access_key
        , secretAccessKey: secret_key
        , region: 'ap-northeast-1'
        }
      }
    };
    this.rekognition  = new AWS.Rekognition(this.props.config.rekognition);
    this.s3           = new AWS.S3(this.props.config.s3);
    this.stream       = new stream.PassThrough();
  }

  static of(props) {
    //log.info(aws.displayName, 'Props', props);
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
            resolve(JSON.stringify(data));
          });
        });
      case 'label':
        return new Promise((resolve, reject) => {
          this.rekognition.detectLabels(options.params, (err, data) => {
            if(err) return reject(err);
            log.trace(aws.displayName, 'Label', data);
            resolve(JSON.stringify(data));
          });
        });
      case 'object':
        const { params } = options;
        this.s3.upload(params, (err, data) => {
          if(err) log.error(aws.displayName, err.name, err.message);
          log.trace(aws.displayName, 'Object', data);
        });
        return params.Body;
    }
  }

  getText(bucket, filename) {
    const Image = { S3Object: { Bucket: bucket, Name: filename }};
    const params = { Image, MinConfidence: 0.0 };
    return this.request('text', { params });
  }

  getLabel(bucket, filename) {
    const Image = { S3Object: { Bucket: bucket, Name: filename }};
    const params = { Image, MaxLabels: 1, MinConfidence: 70 };
    return this.request('label', { params });
  }

  putObject(bucket, filename) {
    const params = { Bucket: bucket, key: filename, Body: this.stream };
    return this.request('object', { params });
  }
  
  fetchText(bucket, filename) {
    return this.getText(bucket, filename);
  }

  fetchLabel(bucket, filename) {
    return this.getLabel(bucket, filename);
  }

  createWriteStream(bucket, filename) {
    return this.putObject(bucket, filename);
  }
};
aws.displayName = 'aws';
export default aws;
