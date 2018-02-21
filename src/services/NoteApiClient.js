import xhr from 'Utilities/xhrutils';
import std from 'Utilities/stdutils';
//let notes = require('Services/data');
//let starred = [1, 2, 3];
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
          xhr.postJSON(
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
            api + '/note/update'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'delete/note':
        return new Promise((resolve, reject) => {
          xhr.postJSON(
            api + '/note/delete'
          , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
        break;
      case 'create/starred':
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
        });
        break;
      case 'delete/starred':
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
        });
        break;
      case 'fetch/starred':
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
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
    return this.request('prefetch/notes', []);
  },
  fetchMyNotes() {
    return this.request('fetch/notes', { user });
  },
  fetchStarredNotes() {
    return this.request('fetch/starred', notes.filter(note => starred.includes(note.id)));
  },
  fetchNote(id) {
    //const note = notes.find(note => note.id === id);
    //return this.request('fetch/note',
    //  Object.assign({ starred: starred.includes(note.id) }, note)
    //);
    return this.request('fetch/note', { user, id });
  },
  createNote({ url, category }) {
    if(!url)
      return this.request('not/url'
        , { name: 'Warning', message: 'Not Url Registory.' });
    //const id = notes.length + 1;
    //const note = {
    //  id
    //, url
    //, category
    //, title: 'Untitled'
    //, body: ''
    //, user
    //, updated: this.getUpdated()
    //};
    //notes.unshift(note);
    return this.request('create/note', { user, url, category });
  },
  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  },
  logWarn(name, info) {
    console.warn('<<< Warn:', name, info);
  },
  updateNote(id, { title, asin, name, price, bidsprice, body }) {
    //notes = notes.map(note => note.id === id
    //  ? Object.assign({}, note
    //    , { title, body, updated: this.getUpdated() })
    //  : note
    //);
    const updated = std.getLocalTimeStamp(Date.now());
    const data = { title, asin, name, price, bidsprice, body, updated };
    return this.request('update/note', { user, id, data });
  },
  deleteNotes(ids) {
    //notes = notes.filter(note => note.id !== id);
    return this.request('delete/note', { user, ids });
  },
  readNotes(ids) {
    return this.request('read/note', { user, ids });
  },
  selectNotes(ids) {
    return this.request('select/note', { user, ids });
  },
  uploadNotes(filename) {
    return this.request('upload/note', { user, filename });
  },
  downloadNotes(fileName) {
    return this.request('download/note', { user, filename });
  },
  pagenation(pages, page) {
    return this.request('pagenation/note', { user, pages, page });
  },
  createStar(id) {
    starred.push(id);
    return this.request('create/starred', null);
  },
  deleteStar(id) {
    starred = starred.filter(noteId => noteId !== id);
    return this.request('delete/starred', null);
  }
  //myNotes() {
  //  return notes.filter(note => note.user === 'MyUserName');
  //},
  //getUpdated() {
  //  const day = new Date();
  //  return `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()} ${day.toTimeString().split(' ')[0]}`;
  //}
};
