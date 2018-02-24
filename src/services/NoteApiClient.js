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
      case 'fetch/readed':
        return new Promise((resolve, reject) => {
          xhr.getJSON(
            api + '/readed'
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
          xhr.getJSON(
            api + '/notes'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'select/notes/all':
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
      case 'prefetch/notes':
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
  fetchNotes() {
    const notes = [];
    return this.request('prefetch/notes', notes);
  },
  fetchMyNotes() {
    return this.request('fetch/notes', { user });
  },
  fetchReadedNotes() {
    return this.request('fetch/readed', { user });
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
