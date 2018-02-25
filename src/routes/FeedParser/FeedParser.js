import fs from 'fs';
import { parseString } from 'xml2js';
import R from 'ramda';
import Rx from 'rx';
import std from 'Utilities/stdutils';
import net from 'Utilities/netutils';
import { logs as log } from 'Utilities/logutils';
let notes = require('Services/data');
let readed = [];

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
    const isUsr = obj => obj.user === options.user;
    const isId =  obj => obj.id === options.id;
    const isRead = obj => R.contains(obj.id, readed);
    const setRead = obj => Object.assign({}, obj, {readed: isRead(obj)}); 
    const _updNote = obj => Object.assign({}, obj, options.data);
    const updNote = obj => isId(obj) ? _updNote(obj) : obj;
    const setNotes = objs => { return notes = objs };
    const setReaded = objs => { return readed = objs };
    const noteIds = R.compose(R.map(Number), R.split(','));
    const itemIds = obj => R.split(',', obj);
    const _isNoteIds = (obj, ids) => R.any(id => obj.id === id, ids);
    const _isItemIds = (obj, ids) => R.any(id => obj.guid._ === id, ids);
    const delNote  = obj => !_isNoteIds(obj, noteIds(options.ids));
    const _delItem = obj => !_isItemIds(obj, itemIds(options.ids));
    const delItem = obj => obj.items
      ? Object.assign({}, obj, { items: R.filter(_delItem, obj.items )})
      : obj;

    this.logTrace(request, options);

    switch(request) {
      case 'fetch/notes':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            R.map(setRead)
          , R.filter(isUsr)
          );
          resolve(response(notes));
        });
        break;
      case 'fetch/readed':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            R.map(setRead)
          , R.filter(isRead)
          , R.filter(isUser)
          );
          resolve(response(notes));
        });
        break;
      case 'fetch/note':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            setRead
          , R.filter(isId)
          , R.filter(isUsr)
          );
          resolve(response(notes));
        });
        break;
      case 'create/note':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => options.note
          , setNotes
          , R.prepend(options.note)
          );
          resolve(response(notes));
        });
        break;
      case 'update/note':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => 'OK'
          , setNotes
          , R.map(updNote)
          );
          resolve(response(notes));
        });
        break;
      case 'delete/note':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => 'OK'
          , setNotes
          , R.filter(delNote)
          );
          resolve(response(notes));
        });
        break;
      case 'create/readed':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => 'OK'
          , setReaded
          , R.concat(readed)
          , R.difference(options.ids)
          );
          resolve(response(readed));
        });
        break;
      case 'delete/readed':
          const response = R.compose(
            () => 'OK'
          , setReaded
          , R.difference(options.ids)
          );
          resolve(response(readed));
        break;
      case 'delete/item':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => 'OK'
          , setNotes
          , R.map(delItem)
          );
          resolve(response(notes));
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
      case 'parse/xml/note':
        return new Promise((resolve, reject) => {
          parseString(options.note
          , { trim: true, explicitArray: false }
          , (err, data) => {
            if(err) reject(err);
            resolve(data);
          }); 
        });
        break;
      case 'parse/xml/item':
        return new Promise((resolve, reject) => {
          parseString(options.item.description
          , { trim: true, explicitArray: false, strict: false }
          , (err, data) => {
            if(err) reject(err);
            const _data = options.item.description;
            const setItem = objs => Object.assign({}, options.item, {
              description:  data
            , price:        objs[objs.length - 3]
            , bids:         objs[objs.length - 2]
            , bidEndTime:   objs[objs.length - 1]
            });
            const bidEndTime =
              R.match(/終了日時:\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/g
              , '現在価格:10,000 円,入札数:1,終了日時:2018/02/25 22:46');
            const price =
              R.match(/現在価格:[0-9,]+/g
            , '現在価格:10,000 円,入札数:1,終了日時:2018/02/25 22:46');
            const bids =
              R.match(/入札数:[0-9]+/g
            , '現在価格:10,000 円,入札数:1,終了日時:2018/02/25 22:46');
            const response = R.compose(
              setItem
            , R.last
            , R.split('>')
            );
            resolve(response(_data));
          }); 
        });
        break;
      default:
        return new Promise((resolve, reject) => {
          reject({ name: 'error', message: 'request: ' + request });
        });
        break;
    }
  }

  removeItem(user, ids) {
    return this.request('delete/item', { user, ids });
  }

  removeRead(user, ids) {
    return this.request('delete/readed', { user, ids });
  }

  addRead(user, ids) {
    return this.request('create/readed', { user, ids });
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

  getXmlNote(note) {
    return this.request('parse/xml/note', { note });
  }

  getXmlItem(item) {
    return this.request('parse/xml/item', { item });
  }

  forRss(urls) {
    const promises = R.map(this.getRss.bind(this), urls);
    return Rx.Observable.forkJoin(promises);
  }

  forFile(files) {
    const promises = R.map(this.getFile.bind(this), files);
    return Rx.Observable.forkJoin(promises);
  }

  forXmlNote(objs) {
    const promises = R.map(this.getXmlNote.bind(this), objs);
    return Rx.Observable.forkJoin(promises);
  }

  forXmlItem(obj) {
    const _promises = objs => R.map(this.getXmlItem.bind(this), objs);
    const promises = obj.items ? _promises(obj.items) : [];
    this.logTrace('forXmlItem', promises);
    return Rx.Observable.forkJoin(promises);
  }

  parseXml(obj) {
    return Rx.Observable.fromPromise(this.getXmlNote(obj));
  }

  createNote({ user, url, category }) {
    const setNotes = R.curry(this.setNotes);
    const addNote = obj =>
      Rx.Observable.fromPromise(this.addNote(user, obj));
    return this.forRss([ url ])
      .flatMap(objs => this.forXmlNote(objs))
      .map(setNotes({ user, url, category }))
      .flatMap(objs => addNote(objs[0]))
      .flatMap(obj => this.forXmlItem(obj))
      .map(R.tap(this.logTrace.bind(this)));
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

  deleteRead({ user, ids }) {
    return Rx.Observable.fromPromise(this.removeRead(user, ids));
  }

  createRead({ user, ids }) {
    return Rx.Observable.fromPromise(this.addRead(user, ids));
  }

  deleteItem({ user, ids }) {
    return Rx.Observable.fromPromise(this.removeItem(user, ids));
  }

  parseFile({ user, file, category }) {
    const setNotes = R.curry(this.setNotes);
    return this.forFile([ file ])
      .flatMap(objs => this.forXmlNote(objs))
      .map(setNotes({ user, url, category }))
      //.map(R.tap(this.logTrace.bind(this)));
  }

  logTrace(name, message) {
    log.trace('Trace:', name, message);
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
