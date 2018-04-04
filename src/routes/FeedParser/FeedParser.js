import dotenv           from 'dotenv';
import R                from 'ramda';
import Rx               from 'rxjs/Rx';
import mongoose         from 'mongoose';
import { Note, Readed, Traded, Bided, Starred, Listed }
                        from 'Models/feed';
import std              from 'Utilities/stdutils';
import Amazon           from 'Utilities/Amazon';
import Yahoo            from 'Utilities/Yahoo';
import { logs as log }  from 'Utilities/logutils';

dotenv.config();
const keyset = {
  access_key: process.env.ACCESS_KEY
, secret_key: process.env.SECRET_KEY
, associ_tag: process.env.ASSOCI_TAG
};

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
    switch(request) {
      case 'fetch/notes':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Note.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'fetch/readed':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Readed.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'fetch/traded':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Traded.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'fetch/bided':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Bided.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'fetch/starred':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Starred.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'fetch/listed':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Listed.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
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
        });
      case 'fetch/items':
        return new Promise((resolve, reject) => {
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
        });
      case 'update/note':
        return new Promise((resolve, reject) => {
          const isItems = !!options.data.items;
          const isAsin = options.data.asin !== '';
          const conditions = {
            _id:  options.id
          , user: options.user
          };
          const update = isItems
            ? {
              items:      options.data.items
            , updated:    options.data.updated
            }
            : isAsin
              ? {
                title:      options.data.title
              , asin:       options.data.asin
              , price:      options.data.price
              , bidsprice:  options.data.bidsprice
              , body:       options.data.body
              , name:       options.data.name
              , AmazonUrl:  options.data.AmazonUrl
              , AmazonImg:  options.data.AmazonImg
              , updated:    Date.now()
              }
              : {
                title:      options.data.title
              , asin:       options.data.asin
              , price:      options.data.price
              , bidsprice:  options.data.bidsprice
              , body:       options.data.body
              , updated:    Date.now()
              };
          //log.debug(update.items, conditions);
          Note.update(conditions, update, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'delete/note':
        return new Promise((resolve, reject) => {
          const conditions = {
            _id: options.id
          , user: options.user
          };
          Note.remove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'create/readed':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const conditions = {
            readed: options.id
          , user:   options.user
          };
          const update = {
            readed: options.id
          , user:   options.user
          };
          Readed.update(conditions, update, { upsert: true }
          , (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'delete/readed':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const conditions = {
            readed: options.id
          , user:   options.user
          };
          Readed.remove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'create/traded':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const conditions = {
            traded: options.id
          , user:   options.user
          };
          const update = {
            traded: options.id
          , user:   options.user
          };
          Traded.update(conditions, update, { upsert: true }
          , (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'delete/traded':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const conditions = {
            traded: options.id
          , user:   options.user
          };
          Traded.remove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'create/bided':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const conditions = {
            bided:  options.id
          , user:   options.user
          };
          const update = {
            bided:  options.id
          , user:   options.user
          };
          Bided.update(conditions, update, { upsert: true }
          , (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'delete/bided':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const conditions = {
            bided: options.id
          , user: options.user
          };
          Bided.remove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'create/starred':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const conditions = {
            starred:  options.id
          , user:     options.user
          };
          const update = {
            starred:  options.id
          , user:     options.user
          };
          Starred.update(conditions, update, { upsert: true }
          , (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'delete/starred':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const conditions = {
            starred:  options.id
          , user:     options.user
          };
          Starred.remove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'create/listed':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const conditions = {
            listed: options.id
          , user:   options.user
          };
          const update = {
            listed: options.id
          , user:   options.user
          };
          Listed.update(conditions, update, { upsert: true }
          , (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'delete/listed':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const conditions = {
            listed: options.id
          , user:   options.user
          };
          Listed.remove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      default:
        return new Promise((resolve, reject) => {
          reject({ name: 'error', message: 'request: ' + request });
        });
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

  createNote({ user, url, category }) {
    const addNote =
      obj => Rx.Observable.fromPromise(this.addNote(user, obj));
    return Yahoo.of().fetchRss({ url })
      .map(obj => this.setNote({ user, url, category }, obj))
      .flatMap(addNote);
  }

  fetchNote({ user, id }) {
    const observables = Rx.Observable.forkJoin([
      this.getStarred(user)
    , this.getListed(user)
    , this.getReaded(user)
    , this.getNote(user, id)
    ]);
    const setAttribute = objs => R.compose(
      this.setReaded(objs[2])
    , this.setListed(objs[1])
    , this.setStarred(objs[0])
    , this.toObject
    )([objs[3]]);
    return observables
      .map(setAttribute)
      .map(R.head);
  }

  fetchItems({ user, items }) {
    return Rx.Observable.fromPromise(this.getItems(user, items));
  }

  fetchAllNotes({ users }) {
    const observables = R.map(user => this.getNotes(user));
    return Rx.Observable.forkJoin(observables(users));
  }

  fetchNotes({ user }) {
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
    //log.trace(user,id,data);
    const isAsin = data.asin !== '';
    const getAmazonData = obj => R.merge(data, {
          name:       obj.ItemAttributes.Title
        , AmazonUrl:  obj.DetailPageURL
        , AmazonImg:  obj.MediumImage.URL
    });
    return isAsin
      ? Amazon.of(keyset).fetchItemLookup(data.asin, 'ASIN')
        .map(getAmazonData)
        .flatMap(obj => this._updateNote({ user, id, data: obj }))
        .flatMap(() => this.fetchNote({ user, id }))
      : this._updateNote({ user, id, data })
        .flatMap(() => this.fetchNote({ user, id }))
    ;
  }

  updateHtml({ user, id, html }) {
    const data = {
      updated:  html.updated
    , items:    html.items  
    };
    return this._updateNote({ user, id, data });
  }

  updateRss({ user, id, rss }) {
    const data = {
      updated:  rss.updated
    , items:    rss.items  
    };
    return this._updateNote({ user, id, data });
  }

  _updateNote({ user, id, data }) {
    return Rx.Observable.fromPromise(this.replaceNote(user, id, data));
  }
  
  deleteNote({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeNote(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
  }

  //deleteItem({ user, ids }) {
  //  const _ids = R.split(',', ids);
  //  const promises = R.map(id => this.removeItem(user, id));
  //  return Rx.Observable.forkJoin(promises(_ids));
  //}

  createRead({ user, ids }) {
    const promises = R.map(id => this.getNote(user, id));
    const observables = Rx.Observable.forkJoin(promises(ids));
    return observables
      .map(R.map(obj => obj.items))
      .map(R.flatten)
      .map(R.map(obj => obj.guid._))
      .flatMap(objs => this._createRead({ user, ids: objs }))
      //.map(R.tap(log.trace.bind(this)))
    ;
  }

  _createRead({ user, ids }) {
    //log.debug(user, ids);
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
        DIV: { A: { attr: { HREF: arr[2] }, IMG: { attr: {
        SRC: arr[3], BORDER: arr[4], WIDTH: arr[5], HEIGHT: arr[6]
        , ALT: arr[7] }}}}}
    , pubDate: arr[8]
    , guid: { _: arr[9], attr: { isPermaLink: arr[10] } }
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

  setNote({ user, url, category }, obj) {
    return ({
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
  }
};
