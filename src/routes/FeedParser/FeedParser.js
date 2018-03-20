import dotenv           from 'dotenv';
import R                from 'ramda';
import Rx               from 'rx';
//import csv              from 'ya-csv';
import { parseString }  from 'xml2js';
import mongoose         from 'mongoose';
import { Note, Readed, Traded, Bided, Starred, Listed }
                        from 'Models/feed';
import std              from 'Utilities/stdutils';
import net              from 'Utilities/netutils';
import Amazon           from 'Utilities/Amazon';
import { logs as log }  from 'Utilities/logutils';

dotenv.config();
const keyset = {
  access_key: process.env.ACCESS_KEY
, secret_key: process.env.SECRET_KEY
, associ_tag: process.env.ASSOCI_TAG
};

//import fs from 'fs';
//let notes   = []; //require('Services/data');
//let readed  = [
//  {user: 'MyUserName',    ids: []}
//, {user: 'AdminUserName', ids: []}
//];
//let traded  = [
//  {user: 'MyUserName',    ids: []}
//, {user: 'AdminUserName', ids: []}
//];
//let bided   = [
//  {user: 'MyUserName',    ids: []}
//, {user: 'AdminUserName', ids: []}
//];
//let starred = [
//  {user: 'MyUserName',    ids: []}
//, {user: 'AdminUserName', ids: []}
//];
//let listed = [
//  {user: 'MyUserName',    ids: []}
//, {user: 'AdminUserName', ids: []}
//];

//const path = __dirname + '/../xml/'
//const files = [
//  'data.xml'
//];

/**
 * FeedPaser class.
 *
 * @constructor
 */
export default class FeedParser {
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
    //const setNotes   = objs => { return notes   = objs };
    //const setReaded  = objs => { return readed  = objs };
    //const setTraded  = objs => { return traded  = objs };
    //const setBided   = objs => { return bided   = objs };
    //const setStarred = objs => { return starred = objs };
    //const setListed  = objs => { return listed = objs };
    //const splitNumIds = R.compose(R.map(Number), R.split(','));
    //const splitStrIds = R.split(',');
    //const isUsr   = obj => obj.user === options.user;
    //const isId    = obj => obj.id === Number(options.id);
    //const _setIds = (ids, obj) => isUsr(obj) ? Object.assign({}, obj
    //, { ids }) : obj;
    //const setIds = R.curry(_setIds);
    //const getIds = R.compose(obj => obj.ids, R.head, R.filter(isUsr));
    //const updIds = ids =>
    //  R.compose(R.concat(ids), R.difference(options.ids))(ids);
    //const delIds = ids =>
    //  R.symmetricDifference(splitStrIds(options.ids), ids);
    //const getNote = id => R.find(obj => obj.id === id, notes);
    //const getItems = obj => obj.items;
    //const getItemId = obj => obj.guid._;
    //const getItemIds = R.compose(
    //  R.map(getItemId), R.flatten, R.map(getItems)
    //  , R.filter(getItems), R.map(getNote));
    //const updReadIds = ids => R.compose(
    //  R.concat(ids), R.difference(getItemIds(options.ids)))(ids);
    //const delReadIds = ids => R.symmetricDifference(
    //  getItemIds(splitStrIds(options.ids)), ids);
    //const isRead  = obj => R.contains(obj.guid._, getIds(readed)  );
    //const isTrade = obj => R.contains(obj.guid._, getIds(traded)  );
    //const isBids  = obj => R.contains(obj.guid._, getIds(bided)   );
    //const isStar  = obj => R.contains(obj.guid._, getIds(starred) );
    //const isList  = obj => R.contains(obj.guid._, getIds(listed)  );
    //const setRead   = obj => Object.assign({}, obj
    //, { readed:   isRead(obj)   }); 
    //const setTrade  = obj => Object.assign({}, obj
    //, { traded:   isTrade(obj)  }); 
    //const setBids   = obj => Object.assign({}, obj
    //, { bided:    isBids(obj)   }); 
    //const setStar   = obj => Object.assign({}, obj
    //, { starred:  isStar(obj)   }); 
    //const setList   = obj => Object.assign({}, obj
    //, { listed:   isList(obj)   }); 
    //const _setReadItems   = obj => R.map(setRead,   obj.items);
    //const _setTradeItems  = obj => R.map(setTrade,  obj.items);
    //const _setBidsItems   = obj => R.map(setBids,   obj.items);
    //const _setStarItems   = obj => R.map(setStar,   obj.items);
    //const _setListItems   = obj => R.map(setList,   obj.items);
    //const setReadItems    = obj => obj.items ? Object.assign({}, obj
    //, { items: _setReadItems(obj)  }) : obj;
    //const setTradeItems   = obj => obj.items ? Object.assign({}, obj
    //, { items: _setTradeItems(obj) }) : obj;
    //const setBidsItems    = obj => obj.items ? Object.assign({}, obj
    //, { items: _setBidsItems(obj)  }) : obj;
    //const setStarItems    = obj => obj.items ? Object.assign({}, obj
    //, { items: _setStarItems(obj)  }) : obj;
    //const setListItems    = obj => obj.items ? Object.assign({}, obj
    //, { items: _setListItems(obj)  }) : obj;
    //const updReaded   = ids => R.map(setIds(ids), readed  );
    //const updTraded   = ids => R.map(setIds(ids), traded  );
    //const updBided    = ids => R.map(setIds(ids), bided   );
    //const updStarred  = ids => R.map(setIds(ids), starred );
    //const updListed   = ids => R.map(setIds(ids), listed  );
    //const _updNote  = obj => Object.assign({}, obj, options.data);
    //const updNote   = obj => isId(obj) ? _updNote(obj) : obj;
    //const _isNoteIds = (obj, ids) => R.any(id => obj.id === id, ids);
    //const _isItemIds = (obj, ids) => R.any(id => obj.guid._ === id, ids);
    //const delNote = obj => !_isNoteIds(obj, splitNumIds(options.ids));
    //const delItem = obj => !_isItemIds(obj, splitStrIds(options.ids));
    //const _delItems = obj => R.filter(delItem, obj.items);
    //const delItems  = obj => obj.items ? Object.assign({}, obj
    //, { items: _delItems(obj)}) : obj;
    switch(request) {
      case 'fetch/notes':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Note.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  R.map(setStarItems)
          //, R.map(setListItems)
          //, R.map(setReadItems)
          //, R.filter(isUsr)
          //);
          //resolve(response(notes));
        });
      case 'fetch/readed':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Readed.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  R.map(setReadItems)
          //, R.filter(isUsr)
          //);
          //resolve(response(notes));
        });
      case 'fetch/traded':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Traded.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  R.map(setTradeItems)
          //, R.map(setBidsItems)
          //, R.filter(isUsr)
          //);
          //resolve(response(notes));
        });
      case 'fetch/bided':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Bided.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  R.map(setBidsItems)
          //, R.map(setListItems)
          //, R.filter(isUsr)
          //);
          //resolve(response(notes));
        });
      case 'fetch/starred':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Starred.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  R.map(setStarItems)
          //, R.filter(isUsr)
          //);
          //resolve(response(notes));
        });
      case 'fetch/listed':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Listed.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  R.map(setListItems)
          //, R.filter(isUsr)
          //);
          //resolve(response(notes));
        });
      case 'fetch/note':
        return new Promise((resolve, reject) => {
          const conditions = {
            _id:  options.id
          , user: options.user
          };
          Note.findOne(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  setStarItems
          //, setListItems
          //, setReadItems
          //, R.head
          //, R.filter(isId)
          //, R.filter(isUsr)
          //);
          //resolve(response(notes));
        });
      case 'fetch/items':
        return new Promise((resolve, reject) => {
          //const conditions = {
          //  _id:  options.id
          //, user: options.user
          //};
          //Note.findOne(conditions, (err, obj) => {
          //  if(err) return reject(err);
          //  log.trace(request, obj);
          //  resolve(obj);
          //});
          resolve(options.items);
        });
      case 'create/note':
        return new Promise((resolve, reject) => {
          const note = new Note({
            user:       options.user
          , url:        options.data.url
          , category:   options.data.category
          , title:      options.data.title
          , asin:       options.data.asin
          , name:       options.data.name
          , price:      options.data.price
          , bidsprice:  options.data.bidsprice
          , body:       options.data.body
          , items:      options.data.items
          });
          note.save((err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  () => options.note
          //, setNotes
          //, R.prepend(options.note)
          //);
          //resolve(response(notes));
        });
      case 'update/note':
        return new Promise((resolve, reject) => {
          const conditions = {
            _id:  options.id
          , user: options.user
          };
          const update = {
          //  url:        options.data.url
          //, category:   options.data.category
            title:      options.data.title
          , asin:       options.data.asin
          , name:       options.data.name
          , price:      options.data.price
          , bidsprice:  options.data.bidsprice
          , body:       options.data.body
          //, items:      options.data.items
          , updated:    Date.now()
          };
          Note.findOneAndUpdate(conditions, update, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  () => options.data
          //, setNotes
          //, R.map(updNote)
          //);
          //resolve(response(notes));
        });
      case 'delete/note':
        return new Promise((resolve, reject) => {
          const conditions = {
            _id: options.id
          , user: options.user
          };
          Note.findOneAndRemove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  () => 'OK'
          //, setNotes
          //, R.filter(delNote)
          //);
          //resolve(response(notes));
        });
      case 'delete/item':
        return new Promise((resolve, reject) => {
          const conditions = {
            _id:  options.id
          , user: options.user
          };
          const update = {
            items:      options.data.items
          , updated:    Date.now()
          };
          Note.findOneAndUpdate(conditions, update, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  () => 'OK'
          //, setNotes
          //, R.map(delItems)
          //);
          //resolve(response(notes));
        });
      case 'create/readed':
        return new Promise((resolve, reject) => {
          const readed = new Readed({
            readed: options.id
          , user:   options.user
          });
          readed.save((err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  () => 'OK'
          //, setReaded
          //, updReaded
          //, R.tap(console.log)
          //, updReadIds
          //, getIds
          //);
          //resolve(response(readed));
        });
      case 'delete/readed':
        return new Promise((resolve, reject) => {
          const conditions = {
            readed: options.id
          , user:   options.user
          };
          Readed.findOneAndRemove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  () => 'OK'
          //, setReaded
          //, updReaded
          //, delReadIds
          //, getIds
          //);
          //resolve(response(readed));
        });
      case 'create/traded':
        return new Promise((resolve, reject) => {
          const traded = new Traded({
            traded: options.id
          , user:   options.user
          });
          traded.save((err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  () => 'OK'
          //, setTraded
          //, updTraded
          //, updIds
          //, getIds
          //);
          //resolve(response(traded));
        });
      case 'delete/traded':
        return new Promise((resolve, reject) => {
          const conditions = {
            traded: options.id
          , user: options.user
          };
          Traded.findOneAndRemove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  () => 'OK'
          //, setTraded
          //, updTraded
          //, delIds
          //, getIds
          //);
          //resolve(response(traded));
        });
      case 'create/bided':
        return new Promise((resolve, reject) => {
          const bided = new Bided({
            bided: options.id
          , user: options.user
          });
          bided.save((err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  () => 'OK'
          //, setBided
          //, updBided
          //, updIds
          //, getIds
          //);
          //resolve(response(bided));
        });
      case 'delete/bided':
        return new Promise((resolve, reject) => {
          const conditions = {
            bided: options.id
          , user: options.user
          };
          Bided.findOneAndRemove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  () => 'OK'
          //, setBided
          //, updBided
          //, delIds
          //, getIds
          //);
          //resolve(response(bided));
        });
      case 'create/starred':
        return new Promise((resolve, reject) => {
          const starred = new Starred({
            starred:  options.id
          , user:     options.user
          });
          starred.save((err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  () => 'OK'
          //, setStarred
          //, updStarred
          //, updIds
          //, getIds
          //);
          //resolve(response(starred));
        });
      case 'delete/starred':
        return new Promise((resolve, reject) => {
          const conditions = {
            starred:  options.id
          , user:     options.user
          };
          Starred.findOneAndRemove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  () => 'OK'
          //, setStarred
          //, updStarred
          //, delIds
          //, getIds
          //);
          //resolve(response(starred));
        });
      case 'create/listed':
        return new Promise((resolve, reject) => {
          const listed = new Listed({
            listed: options.id
          , user:   options.user
          });
          listed.save((err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  () => 'OK'
          //, setListed
          //, updListed
          //, updIds
          //, getIds
          //);
          //resolve(response(listed));
        });
      case 'delete/listed':
        return new Promise((resolve, reject) => {
          const conditions = {
            listed: options.id
          , user:   options.user
          };
          Listed.findOneAndRemove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
          //const response = R.compose(
          //  () => 'OK'
          //, setListed
          //, updListed
          //, delIds
          //, getIds
          //);
          //resolve(response(listed));
        });
      case 'fetch/rss':
        return new Promise((resolve, reject) => {
          net.get2(options.url
          , null, (err, head, body) => {
            if(err) reject(err);
            resolve(body);
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
          const price = R.compose(
            R.join(''), R.map(R.last), R.map(R.split(':'))
            , R.match(/現在価格:[0-9,]+/g));
          const bids  = R.compose(
            R.join(''), R.map(R.last), R.map(R.split(':'))
            , R.match(/入札数:[0-9-]+/g));
          const bidStopTime = R.compose(
            R.join(''), R.map(R.join(':')), R.map(R.tail)
            , R.map(R.split(':'))
            , R.match(/終了日時:\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/g));
          const _setItem = (obj, str) => Object.assign({}, options.xml
            , { description: obj, price: price(str), bids: bids(str)
              , bidStopTime: bidStopTime(str) });
          const setItem = R.curry(_setItem);
          const newItem = obj =>
            R.compose( setItem(obj), R.last, R.split('>') );
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

  addList(user, id) {
    return this.request('create/listed', { user, id });
  }

  removeList(user, id) {
    return this.request('delete/listed', { user, id });
  }

  addStar(user, id) {
    return this.request('create/starred', { user, id });
  }

  removeStar(user, id) {
    return this.request('delete/starred', { user, id });
  }

  addBids(user, id) {
    return this.request('create/bided', { user, id });
  }

  removeBids(user, id) {
    return this.request('delete/bided', { user, id });
  }

  addTrade(user, id) {
    return this.request('create/traded', { user, id });
  }

  removeTrade(user, id) {
    return this.request('delete/traded', { user, id });
  }

  addRead(user, id) {
    return this.request('create/readed', { user, id });
  }

  removeRead(user, id) {
    return this.request('delete/readed', { user, id });
  }

  removeItem(user, id) {
    return this.request('delete/item', { user, id });
  }

  removeNote(user, id) {
    return this.request('delete/note', { user, id });
  }

  replaceNote(user, id, data) {
    return this.request('update/note', { user, id, data });
  }

  addNote(user, data) {
    return this.request('create/note', { user, data });
  }

  getNotes(user) {
    return this.request('fetch/notes', { user });
  }

  getListed(user) {
    return this.request('fetch/listed', { user });
  }

  getStarred(user) {
    return this.request('fetch/starred', { user });
  }

  getBided(user) {
    return this.request('fetch/bided', { user });
  }

  getTraded(user) {
    return this.request('fetch/traded', { user });
  }

  getReaded(user) {
    return this.request('fetch/readed', { user });
  }

  getNote(user, id) {
    return this.request('fetch/note', { user, id });
  }

  getItems(user, items) {
    return this.request('fetch/items', { user, items });
  }

  getRss(url) {
    return this.request('fetch/rss', { url });
  }

  //getFile(file) {
  //  return this.request('fetch/file', { file });
  //}

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

  //forFile(files) {
  //  const promises = R.map(this.getFile.bind(this), files);
  //  return Rx.Observable.forkJoin(promises);
  //}

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

  fetchItems({ user, items }) {
    return Rx.Observable.fromPromise(this.getItems(user, items));
  }

  fetchReadedNotes({ user }) {
    const observables = Rx.Observable.forkJoin([
      this.getReaded(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setReaded(objs[0])
    , this.toObject
    )(objs[1]);
    return observables.map(setAttribute);
  }

  fetchTradedNotes({ user }) {
    const observables = Rx.Observable.forkJoin([
      this.getTraded(user)
    , this.getBided(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setBided(objs[1])
    , this.setTraded(objs[0])
    , this.toObject
    )(objs[2]);
    return observables.map(setAttribute);
  }

  fetchBidedNotes({ user }) {
    const observables = Rx.Observable.forkJoin([
      this.getBided(user)
    , this.getListed(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setListed(objs[1])
    , this.setBided(objs[0])
    , this.toObject
    )(objs[2]);
    return observables.map(setAttribute);
  }

  fetchStarredNotes({ user }) {
    const observables = Rx.Observable.forkJoin([
      this.getStarred(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setStarred(objs[0])
    , this.toObject
    )(objs[1]);
    return observables.map(setAttribute);
  }

  fetchListedNotes({ user }) {
    const observables = Rx.Observable.forkJoin([
      this.getListed(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setListed(objs[0])
    , this.toObject
    )(objs[1]);
    return observables.map(setAttribute);
  }

  fetchNotes({ user }) {
    const pbservable =  Rx.Observable.fromPromise(this.getNotes(user));
    const observables = Rx.Observable.forkJoin([
      this.getStarred(user)
    , this.getListed(user)
    , this.getReaded(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setReaded(objs[2])
    , this.setListed(objs[1])
    , this.setStarred(objs[0])
    , this.toObject
    )(objs[3]);
    return observables.map(setAttribute);
  }

  toObject(objs) {
    return R.isNil(objs) ? [] : R.map(obj => obj.toObject() , objs);
  }

  setReaded(readed) {
    //log.trace('setReaded', readed);
    const ids =           objs => R.isNil(objs)
      ? [] : R.map(obj => obj.readed, objs);
    const isId =          obj => R.contains(obj.guid._, ids(readed));
    const setRead =       obj => R.merge(obj, { readed: isId(obj) });
    const _setReadItems = obj => R.map(setRead, obj.items);
    const setReadItems  = obj => R.isNil(obj.items) 
      ? obj : R.merge(obj, { items: _setReadItems(obj) }); 
    const results =       objs => R.isNil(objs)
      ? [] : R.map(setReadItems, objs);
    return results;
  }

  setListed(listed) {
    //log.trace('setListed', listed);
    const ids =           objs => R.isNil(objs)
      ? [] : R.map(obj => obj.listed, objs);
    const isId =          obj => R.contains(obj.guid._, ids(listed));
    const setList =       obj => R.merge(obj, { listed: isId(obj) });
    const _setListItems = obj => R.map(setList, obj.items);
    const setListItems =  obj => R.isNil(obj.items) 
      ? obj : R.merge(obj, { items: _setListItems(obj) });
    const results =       objs => R.isNil(objs)
      ? [] : R.map(setListItems, objs);
    return results;
  }

  setStarred(starred) {
    //log.trace('setStarred', starred);
    const ids =           objs => R.isNil(objs)
      ? [] : R.map(obj => obj.starred, objs);
    const isId =          obj => R.contains(obj.guid._, ids(starred));
    const setStar =       obj => R.merge(obj, { starred: isId(obj) });
    const _setStarItems = obj => R.map(setStar, obj.items);
    const setStarItems =  obj => R.isNil(obj.items)
      ? obj : R.merge(obj, { items: _setStarItems(obj) });
    const results =       objs => R.isNil(objs)
      ? [] : R.map(setStarItems, objs);
    return results;
  }

  setTraded(traded) {
    //log.trace('setTraded', traded);
    const ids =           objs => R.isNil(objs)
      ? [] : R.map(obj => obj.traded, objs);
    const isId =          obj => R.contains(obj.guid._, ids(traded));
    const setTrade =      obj => R.merge(obj, { traded: isId(obj) });
    const _setTradeItems= obj => R.map(setTrade, obj.items);
    const setTradeItems = obj => R.isNil(obj.items)
      ? obj : R.merge(obj, { items: _setTradeItems(obj) });
    const results =       objs => R.isNil(objs)
      ? [] : R.map(setTradeItems, objs);
    return results;
  }

  setBided(bided) {
    //log.trace('setBided', bided);
    const ids =           objs => R.isNil(objs)
      ? [] : R.map(obj => obj.bided, objs);
    const isId =          obj => R.contains(obj.guid._, ids(bided));
    const setBids =       obj => R.merge(obj, { bided: isId(obj) });
    const _setBidsItems = obj => R.map(setBids, obj.items);
    const setBidsItems  = obj => R.isNil(obj.items)
      ? obj : R.merge(obj, { items: _setBidsItems(obj) });
    const results =       objs => R.isNil(objs)
      ? [] : R.map(setBidsItems, objs);
    return results;
  }

  updateNote({ user, id, data }) {
    console.log(user, id, data);
    return data.asin === ''
      ? this._updateNote({ user, id, data })
      : this.fetchItemLookup(data.asin)
        .map(obj => Object.assign({}, data, {
          name:       obj.ItemAttributes.Title
        , AmazonUrl:  obj.DetailPageURL
        , AmazonImg:  obj.MediumImage.URL }))
        .flatMap(obj => this._updateNote({ user, id, data: obj }));
  }

  _updateNote({ user, id, data }) {
    return Rx.Observable.fromPromise(this.replaceNote(user, id, data));
  }
  
  fetchItemLookup(asin) {
    const item_id = asin;
    const id_type = 'ASIN';
    return Amazon.of(keyset).fetchItemLookup(item_id, id_type);
  }

  deleteNote({ user, ids }) {
    const _ids = R.split(',', ids);
    const promisess = R.map(id => this.removeNote(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
  }

  //_deleteNote({ user, id }) {
  //  return Rx.Observable.fromPromise(this.removeNote(user, id));
  //}

  deleteItem({ user, ids }) {
    const _ids = R.split(',', ids);
    const promisess = R.map(id => this.removeItem(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
  }

  //_deleteItem({ user, id }) {
  //  return Rx.Observable.fromPromise(this.removeItem(user, id));
  //}

  createRead({ user, ids }) {
    const promises = R.map(id => this.getNote(user, id));
    const observables = Rx.Observable.forkJoin(promises(ids));
    return observables
      .map(R.map(obj => obj.items))
      .map(R.flatten)
      .map(R.map(obj => obj.guid._))
      .flatMap(objs => this._createRead({ user, ids: objs }))
      //.map(R.tap(console.log))
  }

  _createRead({ user, ids }) {
    const promises = R.map(id => this.addRead(user, id));
    return Rx.Observable.forkJoin(promises(ids));
  }

  deleteRead({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeRead(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
  }

  //_deleteRead({ user, id }) {
  //  return Rx.Observable.fromPromise(this.removeRead(user, id));
  //}

  createTrade({ user, ids }) {
    const promises = R.map(id => this.addTrade(user, id));
    return Rx.Observable.forkJoin(promises(ids));
  }

  //_createTrade({ user, id }) {
  //  return Rx.Observable.fromPromise(this.addTrade(user, id));
  //}

  deleteTrade({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeTrade(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
  }

  //_deleteTrade({ user, id }) {
  //  return Rx.Observable.fromPromise(this.removeTrade(user, id));
  //}

  createBids({ user, ids }) {
    const promises = R.map(id => this.addBids(user, id));
    return Rx.Observable.forkJoin(promises(ids));
  }

  //_createBids({ user, id }) {
  //  return Rx.Observable.fromPromise(this.addBids(user, id));
  //}

  deleteBids({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeBids(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
  }

  //_deleteBids({ user, id }) {
  //  return Rx.Observable.fromPromise(this.removeBids(user, id));
  //}

  createStar({ user, ids }) {
    const promises = R.map(id => this.addStar(user, id));
    return Rx.Observable.forkJoin(promises(ids));
  }

  //_createStar({ user, id }) {
  //  return Rx.Observable.fromPromise(this.addStar(user, id));
  //}

  deleteStar({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeStar(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
  }

  //_deleteStar({ user, id }) {
  //  return Rx.Observable.fromPromise(this.removeStar(user, id));
  //}

  createList({ user, ids }) {
    const promises = R.map(id => this.addList(user, id));
    return Rx.Observable.forkJoin(promises(ids));
  }

  //_createList({ user, id }) {
  //  return Rx.Observable.fromPromise(this.addList(user, id));
  //}

  deleteList({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeList(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
  }

  //_deleteList({ user, id }) {
  //  return Rx.Observable.fromPromise(this.removeList(user, id));
  //}

  uploadNote({ user, category, file }) {
    const csv = file.toString();
    const _toArr = R.map(R.slice(1, Infinity));
    const toArr = R.split('",');
    const setItem = arr => ({
      title:  arr[0]
    , link: arr[1]
    , description: {
        DIV: { A: { $: { HREF: arr[2] }, IMG: { $: {
        SRC: arr[3], BORDER: arr[4], WIDTH: arr[5], HEIGHT: arr[6]
        , ALT: arr[7] }}}}}
    , pubDate: arr[8]
    , guid: { _: arr[9], $: { isPermaLink: arr[10] } }
    , price: arr[11]
    , bids: arr[12]
    , bidStopTime: arr[13]
    , readed: arr[14].substring(0,5) === 'false' ? false : true
    , listed: arr[15].substring(0,5) === 'false' ? false : true
    , starred: arr[16].substring(0,5) === 'false' ? false : true
    });
    const setItems = R.compose(
      R.map(setItem)
    //, R.tap(console.log)
    , R.map(_toArr)
    , R.map(toArr)
    , R.split('\r\n')
    );
    const setNote = {
      id: std.makeRandInt(9)
    , url: ''
    , category: category
    , user: user
    , updated: std.formatDate(new Date(), 'YYYY/MM/DD hh:mm:ss')
    , items: setItems(csv)
    , title: 'Untitled'
    , asin: ''
    , name: ''
    , price: 0
    , bidsprice: 0
    , body: ''
    , AmazonUrl: ''
    , AmazonImg: ''
    };
    return Rx.Observable.fromPromise(this.addNote(user, setNote));
      //.map(R.tap(console.log));
  }

  //_downloadNote({ user, id }) {
  //  return Rx.Observable.fromPromise(this.downNote({ user, id }));
  //}

  downloadNote({ user, id }) {
    return this.fetchNote({user, id})
      .map(obj => obj.items ? this.toCSV(obj.items) : null)
      .map(obj => new Buffer(obj));
  }
  
  downloadItems({ user, items }) {
    return this.fetchItems({ user, items })
      .map(objs => this.toCSV(objs))
      .map(obj => new Buffer(obj));
  }
  
  toCSV(objs) {
    const __toCSV =
      arr => R.map(str => '"' + str + '"', arr);
    const _toCSV =
      arr => R.map(val => R.is(Object, val) ? R.values(val) : val, arr);
    return R.compose(
      R.join('\r\n')
    , R.map(__toCSV)
    , R.map(R.flatten)
    , R.map(_toCSV)
    , R.map(R.flatten)
    , R.map(_toCSV)
    , R.map(R.flatten)
    , R.map(_toCSV)
    , R.map(R.flatten)
    , R.map(_toCSV)
    , R.map(R.flatten)
    , R.map(_toCSV)
    , R.map(R.flatten)
    , R.map(_toCSV)
    , R.map(R.values)
    )(objs);
  }

  //parseFile({ user, file, category }) {
  //  const setNotes = R.curry(this.setNotes);
  //  return this.forFile([ file ])
  //    .flatMap(objs => this.forXmlNote(objs))
  //    .map(setNotes({ user, url, category }))
      //.map(R.tap(this.logTrace.bind(this)));
  //}

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
    , AmazonUrl: ''
    , AmazonImg: ''
    });
    return R.map(setNote, objs);
  }
};
