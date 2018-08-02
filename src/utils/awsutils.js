import AWS from 'aws-sdk';

class aws {
  constructor(props) {
    this.props = ;
    const config = new AWS.Config({ 
      apiVersion: { rekognition: '2016-06-27', s3: '2006-03-01' } 
    , accessKeyId: ''
    , secretAccessKey: ''
    , region: 'ap-northeast-1'
    , logger: console
    });
  }

  static of(props) {
    return new AWS(props);
  }

  request(operation, options) {
    const { config } = this.props;
    const rekognition = new aws.Rekognition(config);
    switch(operation) {
      case 'text':
        return new Promise((resolve, reject) => {
          rekognition.detectText(options.params, (err, obj) => {
            if(err) return console.error(err);
            console.log(JSON.stringify(obj, null, 2));
          });
        });
      case 'label':
        return new Promise((resolve, reject) => {
          rekognition.detectLabels(options.params, (err, obj) => {
            if(err) return console.error(err);
            console.log(JSON.stringify(obj, null, 2));
          });
        });
    }
  }

  getText(name) {
    const params = { 
      Image: { S3Object: Bucket: 'bucket', Name: name, Version: 'version' }
    , MinConfidence: 0.0
    };
    return this.request('text', { params });
  }

  getLabel(name) {
    const params = { 
      Image: { S3Object: Bucket: 'bucket', Name: name, Version: 'version' }
    , MaxLabels: 1
    , MinConfidence: 70
    };
    return this.request('label', { params });
  }
  
  fetchText({ name }) {
    return this.getText(name);
  }

  fetchLabel({ name }) {
    return this.getLabel(name);
  }

  uploadStream() {
    const pass = new stream.PassThrough();
    const params = {  }
  }
};
export default aws;
