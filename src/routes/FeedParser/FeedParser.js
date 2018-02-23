import fs from 'fs';
import { parseString } from 'xml2js';
import R from 'ramda';
import Rx from 'rx';
import std from 'Utilities/stdutils';
import net from 'Utilities/netutils';
import { logs as log } from 'Utilities/logutils';
let notes = require('Services/data');
let readed = [ 1,2,3 ];

const pspid = 'FeedParser';

const path = __dirname + '/../xml/'
const files = [
  'data.xml'
];

/**
 * FeedPaser class.
 *
 * @constructor
 */
class FeedParser {
  constructor() {
  }

  static of() {
    return new FeedParser();
  }

  request(request, options) {
    const isUsr = obj =>
      obj.user === options.user;
    const isId =  obj =>
      obj.user === options.user && obj.id === options.id;
    const isRead = obj => 
      obj.user === options.user && R.contains(obj.id, readed);
    const setRead = obj =>
      Object.assign({ readed: R.contains(obj.id, readed) }, obj) 
    const updNote = obj =>
      isId(obj) ? Object.assign({}, obj, options.data) : obj;
    const _isIds = (obj, id) =>
      obj.id === id && obj.user === options.user;
    const isIds = R.curry(_isIds);
    const _ids = obj => R.split(',', obj);
    const delNote = obj => R.none(isIds(obj), _ids(options.ids));
    if(options.ids) console.log(_ids(options.ids));

    switch(request) {
      case 'fetch/readed':
        return new Promise((resolve, reject) => {
          const _objs = R.filter(isRead, notes);
          const objs = R.map(setRead, _objs);
          resolve(objs);
        });
        break;
      case 'fetch/notes':
        return new Promise((resolve, reject) => {
          const _objs = R.filter(isUsr, notes);
          const objs = R.map(setRead, _objs);
          resolve(objs);
        });
        break;
      case 'fetch/note':
        return new Promise((resolve, reject) => {
          const _obj = R.filter(isId, notes);
          const obj = setRead(_obj);
          resolve(obj);
        });
        break;
      case 'create/note':
        return new Promise((resolve, reject) => {
          notes = R.prepend(options.note, notes);
          const obj = R.filter(isId, notes);
          resolve(obj);
        });
        break;
      case 'update/note':
        return new Promise((resolve, reject) => {
          notes = R.map(updNote, notes);
          resolve('OK');
        });
        break;
      case 'delete/note':
        return new Promise((resolve, reject) => {
          notes = R.filter(delNote, notes);
          resolve('OK');
        });
        break;
      case 'fetch/rss':
        return new Promise((resolve, reject) => {
          net.get2(options.url
          , null, (err, head, body) => {
            if(err) reject(err);
            resolve(body);
          });
        });
        break;
      case 'fetch/file':
        return new Promise((resolve, reject) => {
          fs.readFile(path + options.file
          , { encoding: 'utf-8' }
          , (err, data) => {
            if(err) reject(err);
            resolve(data);
          });
        });
        break;
      case 'parse/xml':
        return new Promise((resolve, reject) => {
          parseString(options.xml
          , { trim: true, explicitArray: false }
          , (err, data) => {
            if(err) reject(err);
            resolve(data);
          }); 
        });
        break;
      default:
        return new Promise((resolve, reject) => {
          reject(options);
        });
        break;
    }
  }

  removeNote(user, ids) {
    return this.request('delete/note', { user, ids });
  }

  replaceNote(user, id, data) {
    return this.request('update/note', { user, id, data });
  }

  addNote(user, note) {
    return this.request('create/note', { user, note });
  }

  getNotes(user) {
    return this.request('fetch/notes', { user });
  }

  getReadedNotes(user) {
    return this.request('fetch/readed', { user });
  }

  getNote(user, id) {
    return this.request('fetch/note', { user, id });
  }

  getRss(url) {
    return this.request('fetch/rss', { url });
  }

  getFile(file) {
    return this.request('fetch/file', { file });
  }

  getXml(xml) {
    return this.request('parse/xml', { xml });
  }

  forRss(urls) {
    const promises = R.map(this.getRss.bind(this), urls);
    return Rx.Observable.forkJoin(promises);
  }

  forFile(files) {
    const promises = R.map(this.getFile.bind(this), files);
    return Rx.Observable.forkJoin(promises);
  }

  forXml(xmls) {
    const promises = R.map(this.getXml.bind(this), xmls);
    return Rx.Observable.forkJoin(promises);
  }

  parseXml(obj) {
    return Rx.Observable.fromPromise(this.getXml(obj));
  }

  createNote({ user, url, category }) {
    const setNotes = R.curry(this.setNotes);
    const addNote = obj =>
      Rx.Observable.fromPromise(this.addNote(user, obj));
    return this.forRss([ url ])
      .flatMap(obj => this.forXml(obj))
      .map(setNotes({ user, url, category }))
      .flatMap(objs => addNote(objs[0]))
      //.map(R.tap(this.logTrace.bind(this)));
  }

  fetchNote({ user, id }) {
    return Rx.Observable.fromPromise(this.getNote(user, id));
  }

  fetchReadedNotes({ user }) {
    return Rx.Observable.fromPromise(this.getReadedNotes(user));
  }

  fetchNotes({ user }) {
    return Rx.Observable.fromPromise(this.getNotes(user));
  }

  updateNote({ user, id, data }) {
    return Rx.Observable.fromPromise(this.replaceNote(user, id, data));
  }

  deleteNote({ user, ids }) {
    return Rx.Observable.fromPromise(this.removeNote(user, ids));
  }

  parseFile({ user, file, category }) {
    const setNotes = R.curry(this.setNotes);
    return this.forFile([ file ])
      .flatMap(obj => this.forXml(obj))
      .map(setNotes({ user, url, category }))
      //.map(R.tap(this.logTrace.bind(this)));
  }

  logTrace(message) {
    log.trace(`${pspid}>`, 'Trace:', message);
  }

  setNotes({ user, url, category }, objs) {
    const channel = obj => obj.rss.channel;
    const setNote = obj => ({
      id: std.makeRandInt(9)
    , url: url
    , category: category
    , user: user
    , updated: std.getLocalTimeStamp(channel(obj).lastBuildDate)
    , items: channel(obj).item
    , title: channel(obj).title
    , asin: ''
    , name: ''
    , price: 0
    , bidsprice: 0
    , body: ''
    });
    return R.map(setNote, objs);
  }

};
export default FeedParser;
