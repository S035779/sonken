import dotenv             from 'dotenv';
import R                  from 'ramda';
import { from, forkJoin } from 'rxjs';
import nodemailer         from 'nodemailer';
import nodemailerSmtp     from 'nodemailer-smtp-transport'

dotenv.config();
const node_env    = process.env.NODE_ENV;

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
    const options = Object.assign({}, { host, secure, port, auth }, { tls: { rejectUnauthorized: false } });
    const _options = node_env === 'production' ? nodemailerSmtp(options) : options;
    this.transporter = nodemailer.createTransport(_options);
  }

  static of({ host, secure, port, auth }) {
    return new Sendmail(host, secure, port, auth);
  }

  request(operation, data) {
    switch(operation) {
      case '/message':
        return new Promise((resolve, reject) => {
          this.transporter.sendMail(data, (err, info) => {
            if(err) return reject(err);
            resolve(info);
          });
        });
      default:
        return new Promise((resolve, reject) => {
          reject({ name: 'Unknown request:', message: `Request did ${operation}.` });
        });
    }
  }

  putMessage(message) {
    return this.request('/message', message);
  }

  postMessage(message) {
    return from(this.putMessage(message));
  }

  forMessage(messages) {
    const promises = R.map(this.postMessage.bind(this), messages);
    return forkJoin(promises);
  }

  createMessage(message) {
    return this.postMessage(message);
  }

  createMessages(messages) {
    return this.forMessage(messages);
  }
}
Sendmail.displayName = 'Sendmail';
export default Sendmail;
