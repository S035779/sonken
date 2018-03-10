import net from 'Utilities/netutils';
import xhr from 'Utilities/xhrutils';
import std from 'Utilities/stdutils';

const env = process.env.NODE_ENV || 'development';
const host = process.env.TOP_URL || 'https://localhost:4443';
const api_path = process.env.API_PATH || '/api';
const api = host + api_path;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const displayName = 'UserApiClient';

export default {
  request(request, options) {
    std.logInfo(displayName, request, options);
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
      case 'sendmail/users':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/users'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'approval/users':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/users'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
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
  updateUser(admin, data) {
    const updated = std.getLocalTimeStamp(Date.now());
    return this.request('update/user'
      , { admin, data: Object.assign({}, data, { updated }) });
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

  /*
   * Mail & Approval
   */
  sendmail(admin, ids) {
    return this.request('sendmail/users', { admin, ids });
  },
  approval(admin, ids) {
    return this.request('approval/users', { admin, ids });
  }
};
