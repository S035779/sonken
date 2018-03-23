import R from 'ramda';
import Rx from 'rx';
import nodemailer from 'nodemailer';
import { logs as log } from 'Utilities/logutils';

const displayName = 'Sendmail';

/**
 * Sendmail class.
 *
 * @constructor
 * @param {string} host - Host of the messaging service.
 * @param {string} secureConnection - Specification of use
 *  of SSL connection.
 * @param {string} port - Port of the messaging service..
 * @param {object} auth - authentication user and password of 
 *  the messaging service.
 */
class Sendmail {
  constructor(host, secure, port, auth) {
    const options = Object.assign({}, { host, secure, port, auth }
      , { tls: { rejectUnauthorized: false } });
    this.transporter = nodemailer.createTransport(options);
  }

  static of({ host, secure, port, auth }) {
    return new Sendmail(host, secure, port, auth);
  }

  request(operation, data) {
    switch(operation) {
      case '/message':
        return new Promise((resolve, reject) => {
          this.transporter.sendMail(data, (err, info) => {
            if(err) reject(err);
            resolve(info);
          });
        });
      default:
        return new Promise((resolve, reject) => {
          reject(new Error('UNKNOWN'));
        });
    }
  }

  putMessage(message) {
    return this.request('/message', message);
  }

  postMessage(message) {
    return Rx.Observable.fromPromise(this.putMessage(message));
  }

  forMessage(messages) {
    const promises = R.map(this.postMessage.bind(this), messages);
    return Rx.Observable.forkJoin(promises);
  }

  createMessage(message) {
    log.trace(message);
    return this.postMessage(message);
  }

  createMessages(messages) {
    log.trace(messages);
    return this.forMessage(messages);
  }
};
export default Sendmail;
