import fs from 'fs';
import { parseString } from 'xml2js';
import R from 'ramda';
import Rx from 'rx';
import std from 'Utilities/stdutils';
import net from 'Utilities/netutils';
import { logs as log } from 'Utilities/logutils';
let notes   = require('Services/data');
let readed  = [{ user: 'MyUserName', ids: [] }];
let traded  = [{ user: 'MyUserName', ids: [] }];
let bided   = [{ user: 'MyUserName', ids: [] }];
let starred = [{ user: 'MyUserName', ids: [] }];
let listed = [{ user: 'MyUserName', ids: [] }];

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
    //this.logTrace(request, options);
    //this.logTrace('readed:', readed);
    //this.logTrace('traded:', traded);
    //this.logTrace('bided:', bided);
    //this.logTrace('listed:', listed);
    //this.logTrace('starred:', starred);
    const setNotes   = objs => { return notes   = objs };
    const setReaded  = objs => { return readed  = objs };
    const setTraded  = objs => { return traded  = objs };
    const setBided   = objs => { return bided   = objs };
    const setStarred = objs => { return starred = objs };
    const setListed  = objs => { return listed = objs };
    const splitNumIds = R.compose(R.map(Number), R.split(','));
    const splitStrIds = R.split(',');
    const isUsr   = obj => obj.user === options.user;
    const isId    = obj => obj.id === options.id;
    const _setIds = (ids, obj) => isUsr(obj) ? Object.assign({}, obj
    , { ids }) : obj;
    const setIds = R.curry(_setIds);
    const getIds = R.compose(obj => obj.ids, R.head, R.filter(isUsr));
    const updIds = ids =>
      R.compose(R.concat(ids), R.difference(options.ids))(ids);
    const delIds = ids =>
      R.symmetricDifference(splitStrIds(options.ids), ids);
    const getNote = id => R.find(obj => obj.id === id, notes);
    const getItems = obj => obj.items;
    const getItemId = obj => obj.guid._;
    const getItemIds = R.compose(
      R.map(getItemId), R.flatten, R.map(getItems)
      , R.filter(getItems), R.map(getNote));
    const updReadIds = ids => R.compose(
      R.concat(ids), R.difference(getItemIds(options.ids)))(ids);
    const delReadIds = ids => R.symmetricDifference(
      getItemIds(splitStrIds(options.ids)), ids);
    const isRead  = obj => R.contains(obj.guid._, getIds(readed)  );
    const isTrade = obj => R.contains(obj.guid._, getIds(traded)  );
    const isBids  = obj => R.contains(obj.guid._, getIds(bided)   );
    const isStar  = obj => R.contains(obj.guid._, getIds(starred) );
    const isList  = obj => R.contains(obj.guid._, getIds(listed)  );
    const setRead   = obj => Object.assign({}, obj
    , { readed:   isRead(obj)   }); 
    const setTrade  = obj => Object.assign({}, obj
    , { traded:   isTrade(obj)  }); 
    const setBids   = obj => Object.assign({}, obj
    , { bided:    isBids(obj)   }); 
    const setStar   = obj => Object.assign({}, obj
    , { starred:  isStar(obj)   }); 
    const setList   = obj => Object.assign({}, obj
    , { listed:   isList(obj)   }); 
    const _setReadItems   = obj => R.map(setRead,   obj.items);
    const _setTradeItems  = obj => R.map(setTrade,  obj.items);
    const _setBidsItems   = obj => R.map(setBids,   obj.items);
    const _setStarItems   = obj => R.map(setStar,   obj.items);
    const _setListItems   = obj => R.map(setList,   obj.items);
    const setReadItems    = obj => obj.items ? Object.assign({}, obj
    , { items: _setReadItems(obj)  }) : obj;
    const setTradeItems   = obj => obj.items ? Object.assign({}, obj
    , { items: _setTradeItems(obj) }) : obj;
    const setBidsItems    = obj => obj.items ? Object.assign({}, obj
    , { items: _setBidsItems(obj)  }) : obj;
    const setStarItems    = obj => obj.items ? Object.assign({}, obj
    , { items: _setStarItems(obj)  }) : obj;
    const setListItems    = obj => obj.items ? Object.assign({}, obj
    , { items: _setListItems(obj)  }) : obj;
    const updReaded   = ids => R.map(setIds(ids), readed  );
    const updTraded   = ids => R.map(setIds(ids), traded  );
    const updBided    = ids => R.map(setIds(ids), bided   );
    const updStarred  = ids => R.map(setIds(ids), starred );
    const updListed   = ids => R.map(setIds(ids), listed  );
    const _updNote  = obj => Object.assign({}, obj, options.data);
    const updNote   = obj => isId(obj) ? _updNote(obj) : obj;
    const _isNoteIds = (obj, ids) => R.any(id => obj.id === id, ids);
    const _isItemIds = (obj, ids) => R.any(id => obj.guid._ === id, ids);
    const delNote = obj => !_isNoteIds(obj, splitNumIds(options.ids));
    const delItem = obj => !_isItemIds(obj, splitStrIds(options.ids));
    const _delItems = obj => R.filter(delItem, obj.items);
    const delItems  = obj => obj.items ? Object.assign({}, obj
    , { items: _delItems(obj)}) : obj;
    const price = R.compose(
      R.join(''), R.map(R.last), R.map(R.split(':'))
    , R.match(/現在価格:[0-9,]+/g));
    const bids  = R.compose(
      R.join(''), R.map(R.last), R.map(R.split(':'))
    , R.match(/入札数:[0-9-]+/g));
    const bidStopTime = R.compose(
      R.join(''), R.map(R.join(':')), R.map(R.tail), R.map(R.split(':'))
    , R.match(/終了日時:\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/g));
    const _setItem = (obj, str) => Object.assign({}, options.xml
    , { description: obj, price: price(str), bids: bids(str)
      , bidStopTime: bidStopTime(str) });
    const setItem = R.curry(_setItem);
    const newItem = obj => R.compose( setItem(obj), R.last, R.split('>') );
    switch(request) {
      case 'fetch/notes':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            R.map(setStarItems)
          , R.map(setListItems)
          , R.map(setReadItems)
          , R.filter(isUsr)
          );
          resolve(response(notes));
        });
        break;
      case 'fetch/readed':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            R.map(setReadItems)
          , R.filter(isUsr)
          );
         resolve(response(notes));
        });
        break;
      case 'fetch/traded':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            R.map(setTradeItems)
          , R.map(setBidsItems)
          , R.filter(isUsr)
          );
          resolve(response(notes));
        });
        break;
      case 'fetch/bided':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            R.map(setBidsItems)
          , R.map(setListItems)
          , R.filter(isUsr)
          );
          resolve(response(notes));
        });
        break;
      case 'fetch/starred':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            R.map(setStarItems)
          , R.filter(isUsr)
          );
          resolve(response(notes));
        });
        break;
      case 'fetch/listed':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            R.map(setListItems)
          , R.filter(isUsr)
          );
          resolve(response(notes));
        });
        break;
      case 'fetch/note':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            setStarItems
          , setListItems
          , setReadItems
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
      case 'delete/item':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => 'OK'
          , setNotes
          , R.map(delItems)
          );
          resolve(response(notes));
        });
        break;
      case 'create/readed':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => 'OK'
          , setReaded
          , updReaded
          , updReadIds
          , getIds
          );
          resolve(response(readed));
        });
        break;
      case 'delete/readed':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => 'OK'
          , setReaded
          , updReaded
          , delReadIds
          , getIds
          );
          resolve(response(readed));
        });
        break;
      case 'create/traded':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => 'OK'
          , setTraded
          , updTraded
          , updIds
          , getIds
          );
          resolve(response(traded));
        });
        break;
      case 'delete/traded':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => 'OK'
          , setTraded
          , updTraded
          , delIds
          , getIds
          );
          resolve(response(traded));
        });
        break;
      case 'create/bided':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => 'OK'
          , setBided
          , updBided
          , updIds
          , getIds
          );
          resolve(response(bided));
        });
        break;
      case 'delete/bided':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => 'OK'
          , setBided
          , updBided
          , delIds
          , getIds
          );
          resolve(response(bided));
        });
        break;
      case 'create/starred':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => 'OK'
          , setStarred
          , updStarred
          , updIds
          , getIds
          );
          resolve(response(starred));
        });
        break;
      case 'delete/starred':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => 'OK'
          , setStarred
          , updStarred
          , delIds
          , getIds
          );
          resolve(response(starred));
        });
        break;
      case 'create/listed':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => 'OK'
          , setListed
          , updListed
          , updIds
          , getIds
          );
          resolve(response(listed));
        });
        break;
      case 'delete/listed':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => 'OK'
          , setListed
          , updListed
          , delIds
          , getIds
          );
          resolve(response(listed));
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
          parseString(options.xml
          , { trim: true, explicitArray: false }
          , (err, data) => {
            if(err) reject(err);
            resolve(data);
          }); 
        });
        break;
      case 'parse/xml/item':
        return new Promise((resolve, reject) => {
          parseString(options.xml.description
            , { trim: true, explicitArray: false, strict: false }
            , (err, data) => {
              if(err) reject(err);
              resolve(newItem(data)(options.xml.description));
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

  addList(user, ids) {
    return this.request('create/listed', { user, ids });
  }

  removeList(user, ids) {
    return this.request('delete/listed', { user, ids });
  }

  addStar(user, ids) {
    return this.request('create/starred', { user, ids });
  }

  removeStar(user, ids) {
    return this.request('delete/starred', { user, ids });
  }

  addBids(user, ids) {
    return this.request('create/bided', { user, ids });
  }

  removeBids(user, ids) {
    return this.request('delete/bided', { user, ids });
  }

  addTrade(user, ids) {
    return this.request('create/traded', { user, ids });
  }

  removeTrade(user, ids) {
    return this.request('delete/traded', { user, ids });
  }

  addRead(user, ids) {
    return this.request('create/readed', { user, ids });
  }

  removeRead(user, ids) {
    return this.request('delete/readed', { user, ids });
  }

  removeItem(user, ids) {
    return this.request('delete/item', { user, ids });
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

  getListedNotes(user) {
    return this.request('fetch/listed', { user });
  }

  getStarredNotes(user) {
    return this.request('fetch/starred', { user });
  }

  getBidedNotes(user) {
    return this.request('fetch/bided', { user });
  }

  getTradedNotes(user) {
    return this.request('fetch/traded', { user });
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

  getXmlNote(xml) {
    return this.request('parse/xml/note', { xml });
  }

  getXmlItem(xml) {
    return this.request('parse/xml/item', { xml });
  }

  parseNote(xml) {
    return Rx.Observable.fromPromise(this.getXmlNote(xml));
  }

  forRss(urls) {
    const promises = R.map(this.getRss.bind(this), urls);
    return Rx.Observable.forkJoin(promises);
  }

  forFile(files) {
    const promises = R.map(this.getFile.bind(this), files);
    return Rx.Observable.forkJoin(promises);
  }

  forXmlNote(xmls) {
    const promises = R.map(this.getXmlNote.bind(this), xmls);
    return Rx.Observable.forkJoin(promises);
  }

  forXmlItem(xmls) {
    const _promises = R.map(this.getXmlItem.bind(this));
    const promises = R.map(xml => _promises(xml.rss.channel.item), xmls);
    return Rx.Observable.forkJoin(R.flatten(promises));
  }

  createNote({ user, url, category }) {
    const setNotes = R.curry(this.setNotes);
    const addNote = obj =>
      Rx.Observable.fromPromise(this.addNote(user, obj));
    let _notes = [];
    return this.forRss([ url ])
      .flatMap(objs => this.forXmlNote(objs))
      .flatMap(objs => {
        _notes = objs;
        return this.forXmlItem(_notes);
      })
      .map(item => 
        R.map(_note => Object.assign({}, _note.rss.channel, { item })
      , _notes)
      )
      .map(setNotes({ user, url, category }))
      .flatMap(objs => addNote(objs[0]))
      //.map(R.tap(this.logTrace.bind(this)))
  }

  fetchNote({ user, id }) {
    return Rx.Observable.fromPromise(this.getNote(user, id));
  }

  fetchReadedNotes({ user }) {
    return Rx.Observable.fromPromise(this.getReadedNotes(user));
  }

  fetchTradedNotes({ user }) {
    return Rx.Observable.fromPromise(this.getTradedNotes(user));
  }

  fetchBidedNotes({ user }) {
    return Rx.Observable.fromPromise(this.getBidedNotes(user));
  }

  fetchStarredNotes({ user }) {
    return Rx.Observable.fromPromise(this.getStarredNotes(user));
  }

  fetchListedNotes({ user }) {
    return Rx.Observable.fromPromise(this.getListedNotes(user));
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

  deleteItem({ user, ids }) {
    return Rx.Observable.fromPromise(this.removeItem(user, ids));
  }

  createRead({ user, ids }) {
    return Rx.Observable.fromPromise(this.addRead(user, ids));
  }

  deleteRead({ user, ids }) {
    return Rx.Observable.fromPromise(this.removeRead(user, ids));
  }

  createTrade({ user, ids }) {
    return Rx.Observable.fromPromise(this.addTrade(user, ids));
  }

  deleteTrade({ user, ids }) {
    return Rx.Observable.fromPromise(this.removeTrade(user, ids));
  }

  createBids({ user, ids }) {
    return Rx.Observable.fromPromise(this.addBids(user, ids));
  }

  deleteBids({ user, ids }) {
    return Rx.Observable.fromPromise(this.removeBids(user, ids));
  }

  createStar({ user, ids }) {
    return Rx.Observable.fromPromise(this.addStar(user, ids));
  }

  deleteStar({ user, ids }) {
    return Rx.Observable.fromPromise(this.removeStar(user, ids));
  }

  createList({ user, ids }) {
    return Rx.Observable.fromPromise(this.addList(user, ids));
  }

  deleteList({ user, ids }) {
    return Rx.Observable.fromPromise(this.removeList(user, ids));
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
    const setNote = obj => ({
      id: std.makeRandInt(9)
    , url: url
    , category: category
    , user: user
    , updated:
      std.formatDate(new Date(obj.lastBuildDate), 'YYYY/MM/DD hh:mm:ss')
    , items: obj.item
    , title: obj.title
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
