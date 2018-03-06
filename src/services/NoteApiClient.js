import net from 'Utilities/netutils';
import xhr from 'Utilities/xhrutils';
import std from 'Utilities/stdutils';

const env = process.env.NODE_ENV || 'development';
const host = process.env.TOP_URL || 'https://localhost:4443';
const api_path = process.env.API_PATH || '/api';
const api = host + api_path;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pspid = 'NoteApiClient';

export default {
  request(request, options) {
    this.logInfo(request, options);
    switch(request) {
      case 'preset/user':
        return new Promise((resolve, reject) => {
          const isAuthenticated = options.user !== '';
          setTimeout(() => resolve(isAuthenticated), 200);
        });
        break;
      case 'prefetch/notes':
        return new Promise((resolve, reject) => {
          net.getJSON2(
            api + '/notes'
          , options
          , (err, head, obj) => {
            if(err) reject(err);
            resolve(obj);
          });
        });
        break;
      case 'prefetch/traded':
        return new Promise((resolve, reject) => {
          net.getJSON2(
            api + '/traded'
          , options
          , (err, head, obj) => {
            if(err) reject(err);
            resolve(obj);
          });
        });
        break;
      case 'prefetch/bided':
        return new Promise((resolve, reject) => {
          net.getJSON2(
            api + '/bided'
          , options
          , (err, head, obj) => {
            if(err) reject(err);
            resolve(obj);
          });
        });
        break;
      case 'fetch/notes':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/notes'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'fetch/traded':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/traded'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'fetch/bided':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/bided'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      //case 'fetch/note':
      //  return new Promise((resolve, reject) => {
      //    xhr.getJSON(
      //      api + '/note'
      //    , options
      //    , obj => { resolve(obj); }
      //    , err => { reject(err); }
      //    );
      //  });
      //  break;
      case 'create/note':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/note'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'update/note':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/note'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'delete/note':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/note'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'delete/item':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/item'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'create/readed':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/readed'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'delete/readed':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/readed'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'create/traded':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/traded'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'delete/traded':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/traded'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'create/bided':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/bided'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'delete/bided':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/bided'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'create/starred':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/starred'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'delete/starred':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/starred'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'create/listed':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/listed'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'delete/listed':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/listed'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'signin/user':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/authenticate'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'signout/user':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(
            api + '/authenticate'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'confirm/user':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/authenticate'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'update/password':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/password'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'create/user':
        return new Promise((resolve, reject) => {
          xhr.putJSON(
            api + '/authenticate'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'pagenation/note':
      case 'pagenation/traded':
      case 'pagenation/bided':
      case 'select/note':
      case 'select/traded':
      case 'select/bided':
      case 'filter/traded':
      case 'filter/bided':
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
  presetUser(user) {
    return this.request('preset/user', { user });
  },
  prefetchNotes(user) {
    return this.request('prefetch/notes', { user });
  },
  prefetchTradedNotes(user) {
    return this.request('prefetch/traded', { user });
  },
  prefetchBidedNotes(user) {
    return this.request('prefetch/bided', { user });
  },

  /*
   * Notes
   */
  fetchNotes(user) {
    return this.request('fetch/notes', { user });
  },
  fetchTradedNotes(user) {
    return this.request('fetch/traded', { user });
  },
  fetchBidedNotes(user) {
    return this.request('fetch/bided', { user });
  },

  /*
   * Note
   */
  //fetchNote(user, id) {
  //  return this.request('fetch/note', { user, id });
  //},
  createNote(user, { url, category }) {
    if(!url) return this.request('not/url'
        , { name: 'Warning', message: 'Not Url Registory.' });
    return this.request('create/note', { user, url, category });
  },
  updateNote(user, { id, title, asin, name, price, bidsprice, body }) {
    const updated = std.getLocalTimeStamp(Date.now());
    const data = { title, asin, name, price, bidsprice, body, updated };
    return this.request('update/note', { user, id, data });
  },
  pageNote(user, { maxNumber, number, perPage }) {
    return this.request('pagenation/note', {
      user, maxNumber, number, perPage
    });
  },
  selectNote(user, ids) {
    return this.request('select/note', { user, ids });
  },
  deleteNote(user, ids) {
    return this.request('delete/note', { user, ids });
  },
  deleteItem(user, ids) {
    return this.request('delete/item', { user, ids });
  },
  uploadNotes(user, filename) {
    return this.request('upload/note', { user, filename });
  },
  downloadNotes(user, filename) {
    return this.request('download/note', { user, filename });
  },


  /*
   *  Trade
   */
  createTrade(user, ids) {
    return this.request('create/traded', { user, ids });
  },
  deleteTrade(user, ids) {
    return this.request('delete/traded', { user, ids });
  },
  pageTrade(user, { maxNumber, number, perPage }) {
    return this.request('pagenation/traded', {
      user, maxNumber, number, perPage
    });
  },
  selectTrade(user, ids) {
    return this.request('select/traded', { user, ids });
  },
  filterTrade(user, {
    endBidding, allBidding, inBidding, bidStartTime, bidStopTime}) {
    const filter = {
      endBidding, allBidding, inBidding, bidStartTime, bidStopTime
    };
    return this.request('filter/traded', { user, filter });
  },
  downloadTrade(user, filename) {
    return this.request('download/traded', { user, filename });
  },

  /*
   *  Bids
   */
  createBids(user, ids) {
    return this.request('create/bided', { user, ids });
  },
  deleteBids(user, ids) {
    return this.request('delete/bided', { user, ids });
  },
  pageBids(user, { maxNumber, number, perPage }) {
    return this.request('pagenation/bided', {
      user, maxNumber, number, perPage
    });
  },
  selectBids(user, ids) {
    return this.request('select/bided', { user, ids });
  },
  filterBids(user, {
    endBidding, allBidding, inBidding, bidStartTime, bidStopTime}) {
    const filter = {
      endBidding, allBidding, inBidding, bidStartTime, bidStopTime
    };
    return this.request('filter/bided', { user, filter });
  },
  downloadBids(user, filename) {
    return this.request('download/bided', { user, filename });
  },

  /*
   *  Read
   */
  createRead(user, ids) {
    return this.request('create/readed', { user, ids });
  },
  deleteRead(user, ids) {
    return this.request('delete/readed', { user, ids });
  },

  /*
   *  Star
   */
  createStar(user, ids) {
    return this.request('create/starred', { user, ids });
  },
  deleteStar(user, ids) {
    return this.request('delete/starred', { user, ids });
  },

  /*
   *  List
   */
  createList(user, ids) {
    return this.request('create/listed', { user, ids });
  },
  deleteList(user, ids) {
    return this.request('delete/listed', { user, ids });
  },

  /*
   * Login
   */
  authenticate(user, password) {
    return this.request('signin/user', { user, password });
  },
  signout(user) {
    return this.request('signout/user', { user });
  },
  confirmation(email, phone) {
    return this.request('confirm/user', { email, phone });
  },
  changePassword(user, password) {
    return this.request('update/password', { user, password });
  },
  registration(user, password, data) {
    return this.request('create/user', { user, password, data });
  },

  /*
   * Log
   */
  logTrace(name, message) {
    console.trace('[TRACE]', name, message);
  },
  logInfo(name, message) {
    console.info('[INFO]', name, message);
  },
  logWarn(name, message) {
    console.warn('[WARN]', name, message);
  }
};
