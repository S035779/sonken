import * as R from 'ramda';
import net    from 'Utilities/netutils';
import xhr    from 'Utilities/xhrutils';
import std    from 'Utilities/stdutils';

const api = process.env.API_URL;

export default {
  request(request, options) {
    switch(request) {
      case 'preset/admin':
        return new Promise(resolve => setTimeout(() => resolve(options.admin !== ''), 200));
      case 'prefetch/users':
        return net.promise(api + '/users',  R.merge({ method: 'GET', type: 'NV', accept: 'JSON' }, options));
      case 'prefetch/faqs/posted':
        return net.promise(api + '/posted', R.merge({ method: 'GET', type: 'NV', accept: 'JSON' }, options));
      case 'prefetch/mails':
        return net.promise(api + '/mails',  R.merge({ method: 'GET', type: 'NV', accept: 'JSON' }, options));
      case 'prefetch/faqs':
        return net.promise(api + '/faqs',   R.merge({ method: 'GET', type: 'NV', accept: 'JSON' }, options));
      case 'fetch/users':
        return new Promise((resolve, reject) => xhr.getJSON(    api + '/users',     options, resolve, reject));
      case 'fetch/user':
        return new Promise((resolve, reject) => xhr.getJSON(    api + '/user',      options, resolve, reject));
      case 'create/user':
        return new Promise((resolve, reject) => xhr.putJSON(    api + '/user',      options, resolve, reject));
      case 'update/user':
        return new Promise((resolve, reject) => xhr.postJSON(   api + '/user',      options, resolve, reject));
      case 'delete/user':
        return new Promise((resolve, reject) => xhr.deleteJSON( api + '/user',      options, resolve, reject));
      case 'sendmail/users':
        return new Promise((resolve, reject) => xhr.putJSON(    api + '/users',     options, resolve, reject));
      case 'create/approval':
        return new Promise((resolve, reject) => xhr.postJSON(   api + '/users',     options, resolve, reject));
      case 'delete/approval':
        return new Promise((resolve, reject) => xhr.deleteJSON( api + '/users',     options, resolve, reject));
      case 'fetch/faqs':
        return new Promise((resolve, reject) => xhr.getJSON(    api + '/faqs',      options, resolve, reject));
      case 'fetch/faqs/posted':
        return new Promise((resolve, reject) => xhr.getJSON(    api + '/posted',    options, resolve, reject));
      case 'create/faq':
        return new Promise((resolve, reject) => xhr.putJSON(    api + '/faq',       options, resolve, reject));
      case 'update/faq':
        return new Promise((resolve, reject) => xhr.postJSON(   api + '/faq',       options, resolve, reject));
      case 'delete/faq':
        return new Promise((resolve, reject) => xhr.deleteJSON( api + '/faq',       options, resolve, reject));
      case 'create/posted':
        return new Promise((resolve, reject) => xhr.putJSON(    api + '/posted',    options, resolve, reject));
      case 'delete/posted':
        return new Promise((resolve, reject) => xhr.deleteJSON( api + '/posted',    options, resolve, reject));
      case 'fetch/mails':
        return new Promise((resolve, reject) => xhr.getJSON(    api + '/mails',     options, resolve, reject));
      case 'create/mail':
        return new Promise((resolve, reject) => xhr.putJSON(    api + '/mail',      options, resolve, reject));
      case 'update/mail':
        return new Promise((resolve, reject) => xhr.postJSON(   api + '/mail',      options, resolve, reject));
      case 'delete/mail':
        return new Promise((resolve, reject) => xhr.deleteJSON( api + '/mail',      options, resolve, reject));
      case 'create/selected':
        return new Promise((resolve, reject) => xhr.putJSON(    api + '/selected',  options, resolve, reject));
      case 'delete/selected':
        return new Promise((resolve, reject) => xhr.deleteJSON( api + '/selected',  options, resolve, reject));
      case 'upload/mail':
        return new Promise((resolve, reject) => xhr.putFile(    api + '/mails',     options, resolve, reject));
      case 'upload/faq':
        return new Promise((resolve, reject) => xhr.putFile(    api + '/faqs',      options, resolve, reject));
      case 'pagenation/user':
      case 'pagenation/faq':
      case 'pagenation/mail':
      case 'select/user':
      case 'select/faq':
      case 'select/mail':
        return new Promise(resolve => setTimeout(() => resolve(options), 200));
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
    return this.request('prefetch/faqs/posted', { admin });
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
  createUser(admin, data) {
    return this.request('create/user', { admin, data });
  },
  updateUser(admin, data) {
    const updated = std.getLocalTimeStamp(Date.now());
    return this.request('update/user', { admin, data: Object.assign({}, data, { updated }) });
  },
  pageUser(admin, { maxNumber, number, perPage }) {
    return this.request('pagenation/user', { admin, maxNumber, number, perPage });
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
  fetchPostedFaqs() {
    return this.request('fetch/faqs/posted', {});
  },

  /*
   *  Faq
   */
  createFaq(admin) {
    return this.request('create/faq', { admin });
  },
  updateFaq(admin, id, { title, body }) {
    const updated = std.getLocalTimeStamp(Date.now());
    const data = { title, body, updated };
    return this.request('update/faq', { admin, id, data });
  },
  pageFaq(admin, { maxNumber, number, perPage }) {
    return this.request('pagenation/faq', { admin, maxNumber, number, perPage });
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
  createMail(admin) {
    return this.request('create/mail', { admin });
  },
  updateMail(admin, id, { title, body }) {
    const updated = std.getLocalTimeStamp(Date.now());
    const data = { title, body, updated };
    return this.request('update/mail', { admin, id, data });
  },
  pageMail(admin, { maxNumber, number, perPage }) {
    return this.request('pagenation/mail', { admin, maxNumber, number, perPage });
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
