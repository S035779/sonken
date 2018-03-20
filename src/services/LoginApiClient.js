import net from 'Utilities/netutils';
import xhr from 'Utilities/xhrutils';
import std from 'Utilities/stdutils';

const env = process.env.NODE_ENV || 'development';
const host = process.env.TOP_URL || 'https://localhost:4443';
const api_path = process.env.API_PATH || '/api';
const api = host + api_path;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const displayName = 'LoginApiClient';

export default {
  request(request, options) {
    std.logInfo(displayName, request, options);
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
      case 'preference/fetch':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/preference'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'preference/update':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/preference'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'preference/create':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/preference'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      //case 'preference/delete':
      //  return new Promise((resolve, reject) => {
      //    xhr.deleteJSON(
      //      api + '/preference'
      //    , options
      //    , obj => { resolve(obj); }
      //    , err => { reject(err); }
      //    );
      //  });
      //  break;
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
  authenticate(username, password, isAdmin) {
    let admin, user;
    if(isAdmin) {
      admin = username;
      user = '';
    } else {
      admin = '';
      user = username;
    }
    return this.request('signin/authenticate', { admin, user, password });
  },
  signout(username, isAdmin) {
    let admin, user;
    if(isAdmin) {
      admin = username;
      user = '';
    } else {
      admin = '';
      user = username;
    }
    return this.request('signout/authenticate', { admin, user });
  },

  /*
   * User
   */
  fetchProfile(user) {
    return this.request('fetch/user', { user });
  },
  confirmation(email, phone) {
    return this.request('fetch/user', { email, phone })
    .then(obj => obj.user);
  },
  updateProfile(user, password, data) {
    return this.request('update/user', { user, password, data });
  },
  changePassword(user, password) {
    return this.request('update/user', { user, password });
  },
  registration(user, password, data) {
    return this.request('create/user', { user, password, data });
  },
  deleteUser(user) {
    return this.request('delete/user', { user });
  },

  /*
   * Preference
   */
  fetchPreference(admin) {
    return this.request('preference/fetch', { admin });
  },
  createPreference(admin) {
    return this.request('preference/create', { admin });
  },
  updatePreference(admin, data) {
    return this.request('preference/update', { admin, data});
  }
};
