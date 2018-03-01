import xhr from 'Utilities/xhrutils';
import std from 'Utilities/stdutils';

let user = '';

const env = process.env.NODE_ENV || 'development';
const host = process.env.TOP_URL;
const api_path = process.env.API_PATH;
const api = host + api_path;
const pspid = 'NoteApiClient';

export default {
  request(request, options) {
    this.logInfo(request, options);
    switch(request) {
      case 'fetch/notes':
        return new Promise((resolve, reject) => {
          if(!user) return resolve(options.init.notes);
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
          if(!user) return resolve(options.init.notes);
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
          if(!user) return resolve(options.init.notes);
          xhr.getJSON(
            api + '/bided'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'fetch/note':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/note'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
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
      //case 'prefetch/notes':
      //case 'prefetch/traded':
      //case 'prefetch/bided':
      //  return new Promise((resolve, reject) => {
      //    const notes = options.notes;
      //    setTimeout(() => resolve(notes), 200);
      //  });
      //  break;
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
   * Notes
   */
  //prefetchNotes(data) {
  //  user = data.user;
  //  this.logInfo('User:', user);
  //  return this.request('prefetch/notes', { notes: data.notes });
  //},
  //prefetchTradedNotes(data) {
  //  user = data.user;
  //  return this.request('prefetch/traded', { notes: data.notes });
  //},
  //prefetchBidedNotes(data) {
  //  user = data.user;
  //  return this.request('prefetch/bided', { notes: data.notes });
  //},

  fetchNotes(init) {
    return this.request('fetch/notes', init ? { init } : { user });
  },
  fetchTradedNotes(init) {
    return this.request('fetch/traded', init ? { init } : { user });
  },
  fetchBidedNotes(init) {
    return this.request('fetch/bided', init ? { init } : { user });
  },

  /*
   * Note
   */
  fetchNote(id) {
    return this.request('fetch/note', { user, id });
  },
  createNote({ url, category }) {
    if(!url)
      return this.request('not/url'
        , { name: 'Warning', message: 'Not Url Registory.' });
    return this.request('create/note', { user, url, category });
  },
  updateNote({ id, title, asin, name, price, bidsprice, body }) {
    const updated = std.getLocalTimeStamp(Date.now());
    const data = { title, asin, name, price, bidsprice, body, updated };
    return this.request('update/note', { user, id, data });
  },
  pageNote({ maxNumber, number, perPage }) {
    return this.request('pagenation/note', {
      user, maxNumber, number, perPage
    });
  },
  selectNote(ids) {
    return this.request('select/note', { user, ids });
  },
  deleteNote(ids) {
    return this.request('delete/note', { user, ids });
  },
  deleteItem(ids) {
    return this.request('delete/item', { user, ids });
  },
  uploadNotes(filename) {
    return this.request('upload/note', { user, filename });
  },
  downloadNotes(fileName) {
    return this.request('download/note', { user, filename });
  },


  /*
   *  Trade
   */
  createTrade(ids) {
    return this.request('create/traded', { user, ids });
  },
  deleteTrade(ids) {
    return this.request('delete/traded', { user, ids });
  },
  pageTrade({ maxNumber, number, perPage }) {
    return this.request('pagenation/traded', {
      user, maxNumber, number, perPage
    });
  },
  selectTrade(ids) {
    return this.request('select/traded', { user, ids });
  },
  filterTrade({
    endBidding, allBidding, inBidding, bidStartTime, bidStopTime}) {
    const filter = {
      endBidding, allBidding, inBidding, bidStartTime, bidStopTime
    };
    return this.request('filter/traded', { user, filter });
  },

  /*
   *  Bids
   */
  createBids(ids) {
    return this.request('create/bided', { user, ids });
  },
  deleteBids(ids) {
    return this.request('delete/bided', { user, ids });
  },
  pageBids({ maxNumber, number, perPage }) {
    return this.request('pagenation/bided', {
      user, maxNumber, number, perPage
    });
  },
  selectBids(ids) {
    return this.request('select/bided', { user, ids });
  },
  filterBids({
    endBidding, allBidding, inBidding, bidStartTime, bidStopTime}) {
    const filter = {
      endBidding, allBidding, inBidding, bidStartTime, bidStopTime
    };
    return this.request('filter/bided', { user, filter });
  },

  /*
   *  Read
   */
  createRead(ids) {
    return this.request('create/readed', { user, ids });
  },
  deleteRead(ids) {
    return this.request('delete/readed', { user, ids });
  },

  /*
   *  Star
   */
  createStar(ids) {
    return this.request('create/starred', { user, ids });
  },
  deleteStar(ids) {
    return this.request('delete/starred', { user, ids });
  },

  /*
   *  List
   */
  createList(ids) {
    return this.request('create/listed', { user, ids });
  },
  deleteList(ids) {
    return this.request('delete/listed', { user, ids });
  },

  /*
   * Log
   */
  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  },
  logWarn(name, info) {
    console.warn('<<< Warn:', name, info);
  }
};
