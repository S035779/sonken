import net from 'Utilities/netutils';
import xhr from 'Utilities/xhrutils';
import std from 'Utilities/stdutils';

const env = process.env.NODE_ENV;
const host = process.env.TOP_URL;
const api_path = process.env.API_PATH;
const api = host + api_path;
const local_api = 'http://localhost:8080/api';

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
      case 'prefetch/users':
        return new Promise((resolve, reject) => {
          net.getJSON(
            local_api + '/users'
          , options
          , (err, head, obj) => {
            if(err) reject(err);
            resolve(obj);
          });
        });
      case 'fetch/users':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/users'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'fetch/user':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/user'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'create/user':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/user'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'update/user':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/user'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/user':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/user'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'sendmail/users':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/users'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'create/approval':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/users'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/approval':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/users'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'prefetch/faqs':
        return new Promise((resolve, reject) => {
          net.getJSON2(
            api + '/faqs'
          , options
          , (err, head, obj) => {
            if(err) reject(err);
            resolve(obj);
          });
        });
      case 'fetch/faqs':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/faqs'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'prefetch/faqs/posted':
        return new Promise((resolve, reject) => {
          net.getJSON2(
            api + '/posted'
          , options
          , (err, head, obj) => {
            if(err) reject(err);
            resolve(obj);
          });
        });
      case 'fetch/faqs/posted':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/posted'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      //case 'fetch/faq':
      //  return new Promise((resolve, reject) => {
      //    xhr.getJSON(
      //      api + '/faq'
      //    , options
      //    , obj => { resolve(obj); }
      //    , err => { reject(err); }
      //    );
      //  });
      case 'create/faq':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/faq'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'update/faq':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/faq'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/faq':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/faq'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'create/posted':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/posted'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/posted':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/posted'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'prefetch/mails':
        return new Promise((resolve, reject) => {
          net.getJSON2(
            api + '/mails'
          , options
          , (err, head, obj) => {
            if(err) reject(err);
            resolve(obj);
          });
        });
      case 'fetch/mails':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/mails'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      //case 'fetch/mail':
      //  return new Promise((resolve, reject) => {
      //    xhr.getJSON(
      //      api + '/mail'
      //    , options
      //    , obj => { resolve(obj); }
      //    , err => { reject(err); }
      //    );
      //  });
      case 'create/mail':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/mail'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'update/mail':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/mail'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/mail':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/mail'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'create/selected':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/selected'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/selected':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/selected'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'upload/mail':
        return new Promise((resolve, reject) => {
          xhr.putFile(
            api + '/mails'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'upload/faq':
        return new Promise((resolve, reject) => {
          xhr.putFile(
            api + '/faqs'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'pagenation/user':
      case 'select/user':
      case 'pagenation/faq':
      case 'select/faq':
      case 'pagenation/mail':
      case 'select/mail':
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
        });
        break;
      default:
        return new Promise((resolve, reject) => {
          reject(options);
        });
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
  prefetchFaqs(admin) {
    return this.request('prefetch/faqs', { admin });
  },
  prefetchPostedFaqs(admin) {
    return this.request('prefetch/faqs/posted', {});
  },
  prefetchMails(admin) {
    return this.request('prefetch/mails', { admin });
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
    return this.request('pagenation/user'
      , { admin, maxNumber, number, perPage });
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
  createApproval(admin, ids) {
    return this.request('create/approval', { admin, ids });
  },
  deleteApproval(admin, ids) {
    return this.request('delete/approval', { admin, ids });
  },

  /*
   * Faqs
   */
  fetchFaqs(admin) {
    return this.request('fetch/faqs', { admin });
  },
  fetchPostedFaqs(admin) {
    return this.request('fetch/faqs/posted', {});
  },

  /*
   *  Faq
   */
  //fetchFaq(admin, id) {
  //  return this.request('fetch/faq', { admin, id });
  //},
  createFaq(admin) {
    return this.request('create/faq', { admin });
  },
  updateFaq(admin, id, { title, body }) {
    const updated = std.getLocalTimeStamp(Date.now());
    const data = { title, body, updated };
    return this.request('update/faq', { admin, id, data });
  },
  pageFaq(admin, { maxNumber, number, perPage }) {
    return this.request('pagenation/faq'
      , { admin, maxNumber, number, perPage });
  },
  selectFaq(admin, ids) {
    return this.request('select/faq', { admin, ids });
  },
  deleteFaq(admin, ids) {
    return this.request('delete/faq', { admin, ids });
  },
  createPost(admin, ids) {
    return this.request('create/posted', { admin, ids });
  },
  deletePost(admin, ids) {
    return this.request('delete/posted', { admin, ids });
  },
  uploadFaq(admin, id, file) {
    const filename = admin + '_' + id;
    const filedata = file;
    return this.request('upload/faq', { filename, filedata })
  },

  /*
   * Mails
   */
  fetchMails(admin) {
    return this.request('fetch/mails', { admin });
  },

  /*
   *  Mail
   */
  //fetchMail(admin, id) {
  //  return this.request('fetch/mail', { admin, id });
  //},
  createMail(admin) {
    return this.request('create/mail', { admin });
  },
  updateMail(admin, id, { title, body }) {
    const updated = std.getLocalTimeStamp(Date.now());
    const data = { title, body, updated };
    return this.request('update/mail', { admin, id, data });
  },
  pageMail(admin, { maxNumber, number, perPage }) {
    return this.request('pagenation/mail'
      , { admin, maxNumber, number, perPage });
  },
  selectMail(admin, ids) {
    return this.request('select/mail', { admin, ids });
  },
  deleteMail(admin, ids) {
    return this.request('delete/mail', { admin, ids });
  },
  createSelect(admin, ids) {
    return this.request('create/selected', { admin, ids });
  },
  deleteSelect(admin, ids) {
    return this.request('delete/selected', { admin, ids });
  },
  uploadMail(admin, id, file) {
    const filename = admin + '_' + id;
    const filedata = file;
    return this.request('upload/mail', { filename, filedata })
  }
};
