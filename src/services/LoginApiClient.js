import net from 'Utilities/netutils';
import xhr from 'Utilities/xhrutils';
import std from 'Utilities/stdutils';

const env = process.env.NODE_ENV || 'development';
const host = process.env.TOP_URL || 'https://localhost:4443';
const api_path = process.env.API_PATH || '/api';
const api = host + api_path;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pspid = 'LoginApiClient';

export default {
  request(request, options) {
    std.logInfo(request, options);
    switch(request) {
      case 'signin/authenticate':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/authenticate'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'signout/authenticate':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/authenticate'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'fetch/user':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/login'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'update/user':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/login'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'create/user':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/login'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'delete/user':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/login'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      default:
        return new Promise((resolve, reject) => {
          reject(options);
        });
        break;
    }
  },

  /*
   * Authenticate
   */
  authenticate(user, password) {
    return this.request('signin/authenticate', { user, password });
  },
  signout(user) {
    return this.request('signout/authenticate', { user });
  },

  /*
   * User
   */
  confirmation(email, phone) {
    return this.request('fetch/user', { email, phone });
  },
  changePassword(user, password) {
    return this.request('update/user', { user, password });
  },
  registration(user, password, data) {
    return this.request('create/user', { user, password, data });
  },
  deleteUser(user) {
    return this.request('delete/user', { user });
  }
};
