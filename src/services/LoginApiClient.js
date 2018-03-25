import net from 'Utilities/netutils';
import xhr from 'Utilities/xhrutils';
import std from 'Utilities/stdutils';

const api = process.env.API_URL;

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
      case 'signout/authenticate':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/authenticate'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'preference/fetch':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/preference'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'preference/update':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/preference'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'preference/create':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/preference'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      //case 'preference/delete':
      //  return new Promise((resolve, reject) => {
      //    xhr.deleteJSON(
      //      api + '/preference'
      //    , options
      //    , obj => { resolve(obj); }
      //    , err => { reject(err); }
      //    );
      //  });
      case 'fetch/user':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/login'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'update/user':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/login'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'create/user':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/login'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/user':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/login'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'inquiry/create':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/inquiry'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      default:
        return new Promise((resolve, reject) => {
          reject(options);
        });
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
  fetchPreference() {
    return this.request('preference/fetch', {  });
  },
  createPreference(admin) {
    return this.request('preference/create', { admin });
  },
  updatePreference(admin, data) {
    return this.request('preference/update', { admin, data});
  },

  /*
   * Inquiry
   */
  inquiry(user, data) {
    return this.request('inquiry/create', { user, data });
  }
};
