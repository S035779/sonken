import xhr from 'Utilities/xhrutils';
import std from 'Utilities/stdutils';
let user = 'MyUserName';

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
      case 'pagenation/notes':
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
        });
        break;
      case 'select/notes':
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
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
      case 'filter/item':
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
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
      case 'prefetch/notes':
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
        });
        break;
      case 'prefetch/traded':
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
        });
        break;
      case 'prefetch/bided':
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
  prefetchNotes() {
    const notes = [];
    return this.request('prefetch/notes', notes);
  },
  prefetchTradedNotes() {
    const notes = [];
    return this.request('prefetch/traded', notes);
  },
  prefetchBidedNotes() {
    const notes = [];
    return this.request('prefetch/bided', notes);
  },
  fetchNotes() {
    return this.request('fetch/notes', { user });
  },
  fetchTradedNotes() {
    return this.request('fetch/traded', { user });
  },
  fetchBidedNotes() {
    return this.request('fetch/bided', { user });
  },
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
  pagenation({ maxNumber, number, perPage }) {
    return this.request('pagenation/notes', {
      user, maxNumber, number, perPage
    });
  },
  selectNotes(ids) {
    return this.request('select/notes', { user, ids });
  },
  deleteNotes(ids) {
    return this.request('delete/note', { user, ids });
  },
  createRead(ids) {
    return this.request('create/readed', { user, ids });
  },
  deleteRead(ids) {
    return this.request('delete/readed', { user, ids });
  },
  deleteItem(ids) {
    return this.request('delete/item', { user, ids });
  },
  filterItem({
    endBidding, allBidding, inBidding, bidStartTime, bidStopTime
  }) {
    const filter = {
      endBidding, allBidding, inBidding, bidStartTime, bidStopTime
    };
    return this.request('filter/item', { user, filter });
  },
  createTrade(ids) {
    return this.request('create/traded', { user, ids });
  },
  deleteTrade(ids) {
    return this.request('delete/traded', { user, ids });
  },
  createBids(ids) {
    return this.request('create/bided', { user, ids });
  },
  deleteBids(ids) {
    return this.request('delete/bided', { user, ids });
  },
  createStar(ids) {
    return this.request('create/starred', { user, ids });
  },
  deleteStar(ids) {
    return this.request('delete/starred', { user, ids });
  },
  uploadNotes(filename) {
    return this.request('upload/note', { user, filename });
  },
  downloadNotes(fileName) {
    return this.request('download/note', { user, filename });
  },
  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  },
  logWarn(name, info) {
    console.warn('<<< Warn:', name, info);
  }
};
