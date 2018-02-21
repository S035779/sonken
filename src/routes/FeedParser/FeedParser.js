import fs from 'fs';
import { parseString } from 'xml2js';
import R from 'ramda';
import Rx from 'rx';
import std from 'Utilities/stdutils';
import net from 'Utilities/netutils';
import { logs as log } from 'Utilities/logutils';
let notes = require('Services/data');
let starred = [ 1,2,3 ];

const pspid = 'FeedParser';

const path = __dirname + '/../xml/'
const files = [
  'data.xml'
];

/**
 * FeedPaser class.
 *
 * @constructor
 * @param {string} length - Length of shippment.
 * @param {string} height - Weight of shippment.
 * @param {string} from - Shipping source.
 */
class FeedParser {
  constructor() {
  }

  static of() {
    return new FeedParser();
  }

  request(request, options) {
    switch(request) {
      case 'fetch/notes':
        return new Promise((resolve, reject) => {
          const isEven = obj => obj.user === options.user;
          const objs = R.filter(isEven, notes);
          resolve(objs);
        });
        break;
      case 'fetch/note':
        return new Promise((resolve, reject) => {
          const isEven = obj =>
            obj.user === options.user && obj.id === options.id;
          const obj = R.filter(isEven, notes);
          resolve(Object.assign({
            starred: starred.includes(obj.id)
          }, obj));
        });
        break;
      case 'create/note':
        return new Promise((resolve, reject) => {
          notes = R.prepend(options.note, notes);
          resolve(options.note);
        });
        break;
      case 'update/note':
        return new Promise((resolve, reject) => {
          const isEven = obj =>
            obj.user === options.user && obj.id === options.id; 
          const setNote = obj =>
            isEven(obj) ? Object.assign({}, obj, options.data) : obj;
          notes = R.map(setNote, notes);
          resolve('OK');
        });
        break;
      case 'delete/note':
        return new Promise((resolve, reject) => {
          const isNotEven = obj =>
            obj.user === options.user && obj.id !== options.id; 
          notes = R.filter(isNotEven, notes);
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

  removeNote(user, id) {
    return this.request('delete/note', { user, id });
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

  fetchNotes({ user }) {
    return Rx.Observable.fromPromise(this.getNotes(user));
  }

  updateNote({ user, id, data }) {
    return Rx.Observable.fromPromise(this.replaceNote(user, id, data));
  }

  deleteNote({ user, id }) {
    return Rx.Observable.fromPromise(this.removeNote(user, id));
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
