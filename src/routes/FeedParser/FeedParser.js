import dotenv           from 'dotenv';
import R                from 'ramda';
import Rx               from 'rxjs/Rx';
import { parseString }  from 'xml2js';
import mongoose         from 'mongoose';
import encoding         from 'encoding-japanese';
import { Iconv }        from 'iconv';
import { Note, Category, Added, Deleted, Readed, Traded, Bided, Starred
  , Listed }
                        from 'Models/feed';
import std              from 'Utilities/stdutils';
import Amazon           from 'Utilities/Amazon';
import Yahoo            from 'Utilities/Yahoo';
import { logs as log }  from 'Utilities/logutils';
import js2Csv           from 'Utilities/js2Csv';

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
      case 'fetch/categorys':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Category.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          })
        });
      case 'fetch/added':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Added.find(conditions, (err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'fetch/deleted':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Deleted.find(conditions, (err, obj) => {
            if(err) return reject(err);
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
      case 'fetch/category':
        return new Promise((resolve, reject) => {
          const conditions = {
            _id:  options.id
          , user: options.user
          };
          Category.findOne(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'create/note':
        return new Promise((resolve, reject) => {
          const note = new Note({
            user:         options.user
          , url:          options.data.url
          , category:     options.data.category
          , categoryIds:  options.data.categoryIds
          , title:        options.data.title
          , asin:         options.data.asin
          , name:         options.data.name
          , price:        options.data.price
          , bidsprice:    options.data.bidsprice
          , body:         options.data.body
          , items:        options.data.items
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
                title:        options.data.title
              , asin:         options.data.asin
              , price:        options.data.price
              , bidsprice:    options.data.bidsprice
              , body:         options.data.body
              , name:         options.data.name
              , AmazonUrl:    options.data.AmazonUrl
              , AmazonImg:    options.data.AmazonImg
              , categoryIds:  options.data.categoryIds
              , updated:      new Date
              }
              : {
                title:        options.data.title
              , asin:         options.data.asin
              , price:        options.data.price
              , bidsprice:    options.data.bidsprice
              , body:         options.data.body
              , categoryIds:  options.data.categoryIds
              , updated:      new Date
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
      case 'create/category':
        return new Promise((resolve, reject) => {
          const category = new Category({
            user:           options.user
          , category:       options.data.category
          , subcategory:    options.data.subcategory
          , subcategoryId:  new mongoose.Types.ObjectId
          });
          category.save((err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'update/category':
        return new Promise((resolve, reject) => {
          const conditions = {
            _id:  options.id
          , user: options.user
          };
          const update = {
            category:       options.data.category
          , subcategory:    options.data.subcategory
          , subcategoryId:  new mongoose.Types
                              .ObjectId(options.data.subcategoryId)
          };
          Category.update(conditions, update, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'delete/category':
        return new Promise((resolve, reject) => {
          const conditions = {
            _id: options.id
          , user: options.user
          };
          Category.remove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'create/added':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const conditions = {
            added: options.id
          , user:   options.user
          };
          const update = {
            added: options.id
          , user:   options.user
          };
          Added.update(conditions, update, { upsert: true }
          , (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'delete/added':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const conditions = {
            added: options.id
          , user:   options.user
          };
          Added.remove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'create/deleted':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const conditions = {
            deleted: options.id
          , user:   options.user
          };
          const update = {
            deleted: options.id
          , user:   options.user
          };
          Deleted.update(conditions, update, { upsert: true }
          , (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'delete/deleted':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const conditions = {
            deleted: options.id
          , user:   options.user
          };
          Deleted.remove(conditions, (err, obj) => {
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

  addAdd(user, id) {
    return this.request('create/added', { user, id });
  };

  removeAdd(user, id) {
    return this.request('delete/added', { user, id });
  };

  addDelete(user, id) {
    return this.request('create/deleted', { user, id });
  };

  removeDelete(user, id) {
    return this.request('delete/deleted', { user, id });
  };

  removeNote(user, id) {
    return this.request('delete/note', { user, id });
  }

  removeCategory(user, id) {
    return this.request('delete/category', { user, id });
  }

  replaceNote(user, id, data) {
    return this.request('update/note', { user, id, data });
  }

  replaceCategory(user, id, data) {
    return this.request('update/category', { user, id, data });
  }

  addNote(user, data) {
    return this.request('create/note', { user, data });
  }
  
  addCategory(user, data) {
    return this
      .request('create/category', { user, data });
  }

  getNotes(user) {
    return this.request('fetch/notes', { user });
  }

  getCategorys(user) {
    return this.request('fetch/categorys', { user });
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

  getAdded(user) {
    return this.request('fetch/added', { user });
  };

  getDeleted(user) {
    return this.request('fetch/deleted', { user });
  };

  getNote(user, id) {
    return this.request('fetch/note', { user, id });
  }

  getCategory(user, id) {
    return this.request('fetch/category', { user, id });
  }

  fetchCategorys({ user }) {
    const observables = Rx.Observable.forkJoin([
      this.getReaded(user)
    , this.getStarred(user)
    , this.getCategorys(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setCategorys(objs[2])
    , this.setStarred(objs[1])
    , this.setReaded(objs[0])
    , this.toObject
    //, R.tap(log.console)
    )(objs[3]);
    return observables.map(setAttribute);
  }

  setCategorys(categorys) {
    const _categorys = this.toObject(categorys);
    const _hasCategorys = R.curry(this.hasCategorys)(_categorys);
    const _hasNotCategorys = this.hasNotCategorys;
    const _hasFavorites = this.hasFavorites;
    const __categorys = objs => 
      R.concat(_hasCategorys(objs), _hasNotCategorys(objs));
    return objs => R.isNil(objs)
      ? _categorys
      : R.concat(__categorys(objs), _hasFavorites(objs))
    ;
  }

  hasCategorys(categorys, notes) {
    // 1. Match of the same categoryId.
    const _isNote
      = (categoryId, obj) =>
      obj.categoryIds ? R.contains(categoryId, obj.categoryIds) : false;
    const isNote = R.curry(_isNote);
    const isNotes
      = (objs, categoryId) => R.filter(isNote(categoryId), objs);
    // 2. Get not readed item.
    const isNotRead = R.filter(obj => !obj.readed);
    const isNotReads
      = R.map(obj => obj.items ? R.length(isNotRead(obj.items)) : 0);
    // 3. Return.
    const countNew = R.countBy(R.lt(0)); 
    return R.map(obj =>
      R.merge(obj, {
        newRelease: countNew(
          isNotReads(
            isNotes(notes, obj._id)))
      })
    , categorys);
  }

  hasNotCategorys(notes) {
    // 1. Match of the not have categoryId.
    const _isNotNote = (category, obj) =>
      (obj.category === category && R.isNil(obj.categoryIds));
    const isNotNote = R.curry(_isNotNote);
    const isNotNotes
      = (objs, category) => R.filter(isNotNote(category), objs);
    // 2. Get not readed item.
    const isNotRead = R.filter(obj => !obj.readed);
    const isNotReads
      = R.map(obj => obj.items ? R.length(isNotRead(obj.items)) : 0);
    // 3. Return.
    const countNew = R.countBy(R.lt(0)); 
    return R.map(obj =>
      R.merge(obj, {
        newRelease: countNew(
          isNotReads(
            isNotNotes(notes, obj.category)))
      }), [
        { _id: '9999', category: 'marchant', subcategory: '未分類' }
      , { _id: '9999', category: 'sellers',  subcategory: '未分類' }
      ]);
  }

  hasFavorites(notes) {
    // 1. Match of the starred items.
    const isStarred = R.filter(obj => obj.starred);
    const isStarreds
      = obj => obj.items ? R.length(isStarred(obj.items)) > 0 : false;
    const _isStarredNote
      = (category, obj) =>
        obj.category === category && isStarreds(obj);
    const isStarredNote = R.curry(_isStarredNote);
    const isStarredNotes
      = (objs, category) => R.filter(isStarredNote(category), objs);
    // 2. Get not readed item.
    const isNotRead = R.filter(obj => !obj.readed);
    const isNotReads
      = R.map(obj => obj.items ? R.length(isNotRead(obj.items)) : 0);
    // 3. Return.
    const countNew = R.countBy(R.lt(0)); 
    return R.map(obj =>
      R.merge(obj, {
        newRelease: countNew(
          isNotReads(
            isStarredNotes(notes, obj.category)))
      }), [
        { _id: '9998', category: 'marchant', subcategory: 'お気に入り登録' }
      , { _id: '9998', category: 'sellers',  subcategory: 'お気に入り登録' }
      ]);
  }

  fetchNotes({ user }) {
    const observables = Rx.Observable.forkJoin([
      this.getStarred(user)
    , this.getListed(user)
    , this.getReaded(user)
    , this.getDeleted(user)
    , this.getAdded(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setAdded(objs[4])
    , this.setDeleted(objs[3])
    , this.setReaded(objs[2])
    , this.setListed(objs[1])
    , this.setStarred(objs[0])
    , this.toObject
    )(objs[5]);
    return observables.map(setAttribute);
  }

  fetchAllNotes({ users }) {
    const observables = R.map(user => this.getNotes(user));
    return Rx.Observable.forkJoin(observables(users));
  }

  fetchAddedNotes({ user }) {
    const observables = Rx.Observable.forkJoin([
      this.getAdded(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setAdded(objs[0])
    , this.toObject
    )(objs[1]);
    return observables.map(setAttribute);
  }

  fetchDeletedNotes({ user }) {
    const observables = Rx.Observable.forkJoin([
      this.getDeleted(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setDeleted(objs[0])
    , this.toObject
    )(objs[1]);
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

  fetchNote({ user, id }) {
    const observables = Rx.Observable.forkJoin([
      this.getStarred(user)
    , this.getListed(user)
    , this.getReaded(user)
    , this.getDeleted(user)
    , this.getAdded(user)
    , this.getNote(user, id)
    ]);
    const setAttribute = objs => R.compose(
      this.setAdded(objs[4])
    , this.setDeleted(objs[3])
    , this.setReaded(objs[2])
    , this.setListed(objs[1])
    , this.setStarred(objs[0])
    , this.toObject
    )([objs[5]]);
    return observables
      .map(setAttribute)
      .map(R.head);
  }

  fetchCategory({ user, id }) {
    return Rx.Observable.fromPromise(this.getCategory(user, id));
  }

  toObject(objs) {
    return R.isNil(objs) ? [] : R.map(obj => obj.toObject() , objs);
  }

  setAdded(added) {
    //log.trace('setAdded', added);
    const ids =           objs => R.isNil(objs)
      ? [] : R.map(obj => obj.added, objs);
    const isId =          obj => R.contains(obj.guid._, ids(added));
    const setAdd =        obj => R.merge(obj, { added: isId(obj) });
    const _setAddItems =  obj => R.map(setAdd, obj.items);
    const setAddItems  =  obj => R.isNil(obj.items) 
      ? obj : R.merge(obj, { items: _setAddItems(obj) }); 
    const results =       objs => R.isNil(objs)
      ? [] : R.map(setAddItems, objs);
    return results;
  }

  setDeleted(deleted) {
    //log.trace('setDeleted', deleted);
    const ids =             objs => R.isNil(objs)
      ? [] : R.map(obj =>   obj.deleted, objs);
    const isId =            obj => R.contains(obj.guid._, ids(deleted));
    const setDelete =       obj => R.merge(obj, { deleted: isId(obj) });
    const _setDeleteItems = obj => R.map(setDelete, obj.items);
    const setDeleteItems  = obj => R.isNil(obj.items) 
      ? obj : R.merge(obj, { items: _setDeleteItems(obj) }); 
    const results =         objs => R.isNil(objs)
      ? [] : R.map(setDeleteItems, objs);
    return results;
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

  //createNote({ user, url, category }) {
  //  const addNote =
  //    obj => Rx.Observable.fromPromise(this.addNote(user, obj));
  //  return Yahoo.of().fetchRss({ url })
  //    .map(obj => this.setNote({ user, url, category }, obj))
  //    .flatMap(addNote);
  //}

  createNote({ user, url, category, categoryIds, title }) {
    const addNote =
      obj => Rx.Observable.fromPromise(this.addNote(user, obj));
    return Yahoo.of().fetchHtml({ url })
      //.map(R.tap(log.trace.bind(this)))
      .map(obj =>
        this.setNote({ user, url, category, categoryIds, title }, obj))
      .flatMap(addNote);
  }

  updateNote({ user, id, data }) {
    //log.trace(user,id,data);
    const isAsin = data.asin !== '';
    const setAmazonData = obj => obj
      ? R.merge(data, {
          name:       obj.ItemAttributes.Title
        , AmazonUrl:  obj.DetailPageURL
        , AmazonImg:  obj.MediumImage ? obj.MediumImage.URL : ''
      })
      : R.merge(data, { name: '', AmazonUrl: '', AmazonImg: '' });
    return isAsin
      ? Amazon.of(keyset).fetchItemLookup(data.asin, 'ASIN')
        //.map(R.tap(log.trace.bind(this)))
        .map(setAmazonData)
        .flatMap(obj => this._updateNote({ user, id, data: obj }))
        .flatMap(() => this.fetchNote({ user, id }))
      : this._updateNote({ user, id, data })
        .flatMap(() => this.fetchNote({ user, id }))
    ;
  }

  _updateNote({ user, id, data }) {
    return Rx.Observable.fromPromise(this.replaceNote(user, id, data));
  }
  
  deleteNote({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeNote(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
  }

  createCategory({ user, category, subcategory }) {
    //log.debug(user,category,subcategory);
    return Rx.Observable
      .fromPromise(this.addCategory(user, { category, subcategory }));
  }

  updateCategory({ user, id, data }) {
    return this._updateCategory({ user, id, data })
      .flatMap(() => this.fetchCategory({ user, id }))
    ;
  }

  _updateCategory({ user, id, data }) {
    return Rx.Observable
      .fromPromise(this.replaceCategory(user, id, data));
  }

  deleteCategory({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeCategory(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
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

  createAdd({ user, ids }) {
    const promises = R.map(id => this.addAdd(user, id));
    return Rx.Observable.forkJoin(promises(ids));
  }

  deleteAdd({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeAdd(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
  }

  createDelete({ user, ids }) {
    const promises = R.map(id => this.addDelete(user, id));
    return Rx.Observable.forkJoin(promises(ids));
  }

  deleteDelete({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeDelete(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
  }

  createRead({ user, ids }) {
    const promises = R.map(id => this.getNote(user, id));
    const observables = Rx.Observable.forkJoin(promises(ids));
    return observables
      //.map(R.tap(log.trace.bind(this)))
      .map(R.map(obj => obj.items))
      .map(R.flatten)
      .map(R.map(obj => obj.guid._))
      .flatMap(objs => this._createRead({ user, ids: objs }))
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

  createTrade({ user, ids }) {
    const promises = R.map(id => this.addTrade(user, id));
    return Rx.Observable.forkJoin(promises(ids));
  }

  deleteTrade({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeTrade(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
  }

  createBids({ user, ids }) {
    const promises = R.map(id => this.addBids(user, id));
    return Rx.Observable.forkJoin(promises(ids));
  }

  deleteBids({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeBids(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
  }

  createStar({ user, ids }) {
    const promises = R.map(id => this.addStar(user, id));
    return Rx.Observable.forkJoin(promises(ids));
  }

  deleteStar({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeStar(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
  }

  createList({ user, ids }) {
    const promises = R.map(id => this.addList(user, id));
    return Rx.Observable.forkJoin(promises(ids));
  }

  deleteList({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeList(user, id));
    return Rx.Observable.forkJoin(promises(_ids));
  }

  uploadNotes({ user, category, file }) {
    return this.setContent(user, category, file)
      .flatMap(objs => this.createNotes({ user, category, notes: objs}))
      .flatMap(() => this.fetchNotes({ user }));
  }
  
  setContent(user, category, file) {
    switch(file.type) {
      case 'application/vnd.ms-excel':
      case 'text/csv':
      case 'csv':
        return Rx.Observable.fromPromise(this.setNotesObj(user, category, file.content));
      case 'opml':
        return Rx.Observable.fromPromise(this.setOpmlsObj(user, category, file.content));
      default:
        log.error(FeedParser.displayName, 'setContent', `Unknown File Type: ${file.type}`);
        return null;
    }
  }

  createNotes({ user, category, notes }) {
    const isNote = obj => R.find(note => note.url === obj.url, notes);
    const setNotes = R.map(obj => this.setNote({
        user, url: obj.url, category
    }, obj));
    const setDatas = R.map(obj => setData(isNote(obj), obj));
    const setData = (note, obj)  => R.merge(obj, {
        title:      note.title
      , asin:       note.asin
      , price:      note.price
      , bidsprice:  note.bidsprice
      , body:       note.body
      });
    const observable
      = R.map(obj => Yahoo.of().fetchHtml({ url: obj.url }));
    return Rx.Observable.forkJoin(observable(notes))
      //.map(R.tap(log.trace.bind(this)))
      .map(objs => setNotes(objs))
      .map(objs => setDatas(objs))
      .flatMap(objs => this._createNotes(user, objs))
    ;
  }

  _createNotes(user, notes) {
    const promises = R.map(obj => this.addNote(user, obj));
    return Rx.Observable.forkJoin(promises(notes));
  }

  setOpmlsObj(user, category, file) {
    return new Promise((resolve, reject) => {
      parseString(file.toString()
      , { trim: true, explicitArray: true, attrkey: 'attr', charkey: '_' }
      , (err, res) => {
        if(err) reject(err);
        const logDatas = obj =>
          console.dir(obj, {showHidden: false, depth: 10, colors: true});
        const outlines = res.opml.body[0].outline;
        const getDatas = R.map(obj => obj.outline);
        const setDatas = R.map(obj => ({ title: obj.attr.title, url: obj.attr.htmlUrl }));
        const setNotes = R.map(obj => ({
          user
        , url:          obj.url
        , category
        , title:        obj.title
        , asin:         ''
        , price:        0
        , bidsprice:    0
        , body:         ''
        , updated:      std.formatDate(new Date(), 'YYYY/MM/DD hh:mm:ss')
        }));
        resolve(R.compose(
          setNotes
        , setDatas
        , R.flatten
        , getDatas
        )(outlines));
      });
    });
  }
  
  setNotesObj(user, category, file) {
    return new Promise((resolve, reject) => {
      const encode   = _str => encoding.detect(_str);
      const isUtf    = _str => encode(_str) === 'UNICODE' || encode(_str) === 'ASCII';
      const iconv    = new Iconv('CP932', 'UTF-8//TRANSLIT//IGNORE');
      const iconvBuf = _str => Buffer.from(_str);
      const iconvCnv = _buf => iconv.convert(_buf);
      const iconvUtf = _str => iconvCnv(iconvBuf(_str)).toString('utf-8');
      const convChar = str => str !== '' ? iconvUtf(str) : '';
      const toMBConv = R.map(R.map(c => isUtf(c) ? c : convChar(c)));
      const toRcords = R.split('\n');
      const toTailes = R.tail;
      const toColumn = R.map(R.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/));
      const toCutDbl = c => R.match(/^\s*"(.*?)"\s*$/, c)[1];
      const toNonCut = c => R.match(/^\s*(?!")(.*?)\s*$/, c)[1];
      const mergeCsv = (csv1, csv2) => R.isNil(csv1) ? csv2 : csv1;
      const forkJoin = R.map(R.map(std.fork(mergeCsv,toCutDbl,toNonCut)));
      const toCutRec = R.filter(objs => R.length(objs) > 1);
      const setNotes = R.map(arr => ({
        user
      , url:          arr[1]
      , category
      , title:        arr[0]
      , asin:         arr[2]
      , price:        arr[3]
      , bidsprice:    arr[4]
      , body:         arr[5]
      , updated:      std.formatDate(new Date(), 'YYYY/MM/DD hh:mm:ss')
      }));
      resolve(R.compose(
        setNotes
      , toCutRec
      , toMBConv
      , forkJoin
      , toColumn
      , toTailes
      , toRcords
      )(file.toString())
      );
    });
  }

  //setItemsObj({ user, category, file }) {
  //  const toRcords = R.split('"\n');
  //  const toTailes = R.tail;
  //  const toColumn = R.map(R.split('",'));
  //  const toCutHed = R.map(R.map(R.slice(1, Infinity)));
  //  const toCutLst = R.map(R.map(R.replace(/"/g, '')))
  //  const toCutRec = R.filter(objs => R.length(objs) > 1);
  //  const setItems = R.map(arr => ({
  //    title:            arr[0]
  //  , link:             arr[1]
  //  , description: { DIV: { A: {
  //      attr: {
  //        HREF:         arr[2]
  //      }
  //    , IMG: { attr: {
  //        SRC:          arr[3]
  //      , BORDER:       arr[4]
  //      , WIDTH:        arr[5]
  //      , HEIGHT:       arr[6]
  //      , ALT:          arr[7]
  //      }}
  //    }}}
  //  , attr_HREF:        arr[2]
  //  , img_SRC:          arr[3]
  //  , img_BORDER:       arr[4]
  //  , img_WIDTH:        arr[5]
  //  , img_HEIGHT:       arr[6]
  //  , img_ALT:          arr[7]
  //  , pubDate:          arr[8]
  //  , guid: {
  //      _:              arr[9]
  //    , attr: {
  //      isPermaLink:    arr[10]
  //    }}
  //  , guid__:           arr[9]
  //  , guid_isPermaLink: arr[10]
  //  , price:            arr[11]
  //  , bids:             arr[12]
  //  , bidStopTime:      arr[13]
  //  }));
  //  const setNote = objs => ({
  //    url: ''
  //  , category
  //  , user
  //  , updated: std.formatDate(new Date(), 'YYYY/MM/DD hh:mm:ss')
  //  , items: objs
  //  , title: 'Untitled'
  //  , asin: ''
  //  , name: ''
  //  , price: 0
  //  , bidsprice: 0
  //  , body: ''
  //  , AmazonUrl: ''
  //  , AmazonImg: ''
  //  });
  //  return R.compose(
  //    setNote
  //  , setItems
  //  , toCutRec
  //  , toCutLst
  //  , toCutHed
  //  , toColumn
  //  , toTailes
  //  , toRcords
  //  )(file.toString());
  //}

  downloadNotes({ user, category }) {
    const isCategory = obj => obj.category === category;
    const setNotes = objs => R.map(obj => ({
      title:      obj.title
    , url:        obj.url
    , asin:       obj.asin
    , price:      obj.price
    , bidsprice:  obj.bidsprice
    , memo:       obj.body
    }), objs);
    const keys = category === 'marchant'
      ? ['title', 'url', 'asin', 'price', 'bidsprice', 'memo']
      : ['title', 'url'];
    const setNotesCsv = objs => js2Csv.of({ csv: objs, keys }).parse();
    return this.fetchNotes({ user })
      .map(objs => R.filter(isCategory, objs))
      .map(objs => setNotes(objs))
      .map(objs => setNotesCsv(objs))
      .map(csv  => Buffer.from(csv, 'utf8'))
    ;
  }
  
  downloadItems({ user, id }) {
    const setItems = objs => R.map(obj => ({
      title:  obj.title
    , seller: obj.seller
    , auid:   obj.guid__
    , link:   obj.link
    , price:  obj.price
    , date:   obj.pubDate
    }), objs);
    const keys = ['title', 'seller', 'auid', 'link', 'price', 'date'];
    const setItemsCsv = objs => js2Csv.of({ csv: objs, keys }).parse();
    return this.fetchNote({ user, id })
      .map(obj  => setItems(obj.items))
      .map(objs => setItemsCsv(objs))
      .map(csv  => Buffer.from(csv, 'utf8'))
      //.map(R.tap(log.trace.bind(this)))
    ;
  }
  
  setNote({ user, url, category, categoryIds, title }, obj) {
    //log.debug(FeedParser.displayName, 'setNote'
    //  , { user, title, category, categoryIds, url });
    return ({
      url: url
    , category: category
    , categoryIds: categoryIds ? categoryIds : []
    , user: user
    , updated: std.formatDate(new Date(), 'YYYY/MM/DD hh:mm:ss')
    , items: obj.item
    , title: title ? title : obj.title
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
FeedParser.displayName = 'FeedParser';
