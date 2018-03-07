import net from 'Utilities/netutils';
import xhr from 'Utilities/xhrutils';
import std from 'Utilities/stdutils';

const env = process.env.NODE_ENV || 'development';
const host = process.env.TOP_URL || 'https://localhost:4443';
const api_path = process.env.API_PATH || '/api';
const api = host + api_path;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pspid = 'UserApiClient';

export default {
  request(request, options) {
    std.logInfo(request, options);
    switch(request) {
      case 'preset/admin':
        return new Promise((resolve, reject) => {
          const isAuthenticated = options.admin !== '';
          setTimeout(() => resolve(isAuthenticated), 200);
        });
        break;
      case 'prefetch/users':
        return new Promise((resolve, reject) => {
          net.getJSON2(
            api + '/users'
          , options
          , (err, head, obj) => {
            if(err) reject(err);
            resolve(obj);
          });
        });
        break;
      case 'fetch/users':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/users'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'fetch/user':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/user'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'create/user':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/user'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'update/user':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/user'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'delete/user':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/user'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'signin/authenticate':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/management'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'signout/management':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/authenticate'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'fetch/admin':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/admin'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'update/admin':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/admin'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'create/admin':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/admin'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'delete/admin':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/admin'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'pagenation/user':
      case 'select/user':
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
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
   * Preset & Prefetch
   */
  presetAdmin(admin) {
    return this.request('preset/admin', { admin });
  },
  prefetchUsers(admin) {
    return this.request('prefetch/users', { admin });
  },

  /*
   * Users
   */
  fetchUsers(admin) {
    return this.request('fetch/users', { admin });
  },

  /*
   * User
   */
  fetchUser(admin, id) {
    return this.request('fetch/user', { admin, id });
  },
  createUser(user, data) {
    if(!data) return this.request('not/data'
        , { name: 'Warning', message: 'Not Data Registory.' });
    return this.request('create/user', { admin, data });
  },
  updateUser(admin, { id, data }) {
    const updated = std.getLocalTimeStamp(Date.now());
    const _data = Object.assign({}, data, { updated });
    return this.request('update/user', { admin, id, _data });
  },
  pageUser(admin, { maxNumber, number, perPage }) {
    return this.request('pagenation/user', {
      admin, maxNumber, number, perPage
    });
  },
  selectUser(admin, ids) {
    return this.request('select/user', { admin, ids });
  },
  deleteUser(admin, ids) {
    return this.request('delete/user', { admin, ids });
  },
  uploadNotes(admin, filename) {
    return this.request('upload/note', { admin, filename });
  },
  downloadNotes(admin, filename) {
    return this.request('download/note', { admin, filename });
  },


  /*
   *  Trade
   */
  downloadTrade(admin, filename) {
    return this.request('download/traded', { admin, filename });
  },

  /*
   *  Bids
   */
  downloadBids(admin, filename) {
    return this.request('download/bided', { admin, filename });
  },

  /*
   * Authenticate
   */
  authenticate(admin, password) {
    return this.request('signin/management', { admin, password });
  },
  signout(user) {
    return this.request('signout/management', { admin });
  },

  /*
   * Admin
   */
  confirmation(email, phone) {
    return this.request('fetch/admin', { email, phone });
  },
  changePassword(user, password) {
    return this.request('update/admin', { user, password });
  },
  registration(user, password, data) {
    return this.request('create/admin', { user, password, data });
  },
  deleteUser(user) {
    return this.request('delete/admin', { user });
  }
};
