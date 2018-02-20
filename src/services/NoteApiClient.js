import xhr from 'Utilities/xhrutils';
let notes = require('Services/data');
let starred = [1, 2, 3];
let user = 'MyUserName';

const env = process.env.NODE_ENV || 'development';
const host = process.env.TOP_URL;
const api_path = process.env.API_PATH;
const api = host + api_path;
const pspid = 'NoteApiClient';

export default {
  request(request, options) {
    const uri = api + request;
    switch(request) {
      case '/create/note':
        this.logInfo('create/note', request, options);
        return new Promise((resolve, reject) => {
          xhr.postJSON(uri, options
          , obj => { resolve(obj); }, err => { reject(err); }
          );
        });
        break;
      case '/update/note':
        this.logInfo('update/note', request, options);
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
        });
        break;
      case '/delete/note':
        this.logInfo('delete/note', request, options);
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
        });
        break;
      case '/create/starred':
        this.logInfo('create/starred', request, options);
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
        });
        break;
      case '/delete/starred':
        this.logInfo('delete/starred', request, options);
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
        });
        break;
      case '/fetch/notes':
        this.logInfo('fetch/notes', request, options);
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
        });
        break;
      case '/fetch/note':
        this.logInfo('fetch/note', request, options);
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
        });
        break;
      case '/fetch/starred':
        this.logInfo('fetch/starred', request, options);
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(options), 200);
        });
        break;
      default:
        this.logWarn('unknown request', request, options);
        return new Promise((resolve, reject) => {
          reject(options);
        });
        break;
    }
  },
  fetchMyNotes() {
    return this.request('/fetch/notes', this.myNotes());
  },
  fetchStarredNotes() {
    return this.request('/fetch/starred', notes.filter(note => starred.includes(note.id)));
  },
  fetchNote(id) {
    const note = notes.find(note => note.id === id);
    return this.request('/fetch/note',
      Object.assign({ starred: starred.includes(note.id) }, note)
    );
  },
  createNote({ url, category }) {
    if(!url)
      return this.request('/not/url', { message: 'Not Url Registory.' });
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
    return this.request('/create/note', { url, category });
  },
  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  },
  logWarn(name, info) {
    console.warn('<<< Warn:', name, info);
  },
  updateNote(id, { title, body }) {
    notes = notes.map(note => note.id === id
      ? Object.assign({}, note
        , { title, body, updated: this.getUpdated() })
      : note
    );
    return this.request('/update/note', null);
  },
  deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    return this.request('/delete/note', null);
  },
  createStar(id) {
    starred.push(id);
    return this.request('/create/starred', null);
  },
  deleteStar(id) {
    starred = starred.filter(noteId => noteId !== id);
    return this.request('/delete/starred', null);
  },
  myNotes() {
    return notes.filter(note => note.user === 'MyUserName');
  },
  getUpdated() {
    const day = new Date();
    return `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()} ${day.toTimeString().split(' ')[0]}`;
  }
};
