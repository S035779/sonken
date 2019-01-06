import xhr    from 'Utilities/xhrutils';

const API_URL = process.env.API_URL;

export default {
  request(request, options) {
    switch(request) {
      case 'signin/authenticate':
        return new Promise((resolve, reject) => xhr.postJSON(  API_URL+'/authenticate', options, resolve, reject));
      case 'auto/authenticate':
        return new Promise((resolve, reject) => xhr.getJSON(   API_URL+'/authenticate', options, resolve, reject));
      case 'signout/authenticate':
        return new Promise((resolve, reject) => xhr.deleteJSON(API_URL+'/authenticate', options, resolve, reject));
      case 'preference/fetch':
        return new Promise((resolve, reject) => xhr.getJSON(   API_URL+'/preference',   options, resolve, reject));
      case 'preference/update':
        return new Promise((resolve, reject) => xhr.postJSON(  API_URL+'/preference',   options, resolve, reject));
      case 'preference/create':
        return new Promise((resolve, reject) => xhr.putJSON(   API_URL+'/preference',   options, resolve, reject));
      case 'fetch/user':
        return new Promise((resolve, reject) => xhr.getJSON(   API_URL+'/login',        options, resolve, reject));
      case 'update/user':
        return new Promise((resolve, reject) => xhr.postJSON(  API_URL+'/login',        options, resolve, reject));
      case 'create/user':
        return new Promise((resolve, reject) => xhr.putJSON(   API_URL+'/login',        options, resolve, reject));
      case 'delete/user':
        return new Promise((resolve, reject) => xhr.deleteJSON(API_URL+'/login',        options, resolve, reject));
      case 'inquiry/create':
        return new Promise((resolve, reject) => xhr.putJSON(   API_URL+'/inquiry',      options, resolve, reject));
    }
  },

  /*
   * Authenticate
   */
  authenticate(username, password, isAdmin, auto) {
    const admin = isAdmin ? username : '';
    const user = isAdmin ? '' : username;
    return this.request('signin/authenticate', { admin, user, password, auto });
  },
  autologin() {
    return this.request('auto/authenticate', {});
  },
  signout(username, isAdmin) {
    const admin = isAdmin ? username : '';
    const user = isAdmin ? '' : username;
    return this.request('signout/authenticate', { admin, user });
  },

  /*
   * User
   */
  fetchProfile(user) {
    return this.request('fetch/user', { user });
  },
  confirmation(email, phone) {
    return this.request('fetch/user', { email, phone }).then(obj => obj.user);
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
    return this.request('preference/fetch', {});
  },
  createPreference(admin) {
    return this.request('preference/create', { admin });
  },
  updatePreference(admin, data) {
    return this.request('preference/update', { admin, data });
  },

  /*
   * Inquiry
   */
  inquiry(user, data) {
    return this.request('inquiry/create', { user, data });
  }
};
