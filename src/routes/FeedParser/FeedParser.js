import dotenv                   from 'dotenv';
import * as R                   from 'ramda';
import { from, forkJoin }       from 'rxjs';
import { map, flatMap }         from 'rxjs/operators';
import { parseString }          from 'xml2js';
import mongoose                 from 'mongoose';
import encoding                 from 'encoding-japanese';
import { Iconv }                from 'iconv';
import { Note, Category, Added, Deleted, Readed, Traded, Bided, Starred, Listed } 
                                from 'Models/feed';
import std                      from 'Utilities/stdutils';
import Amazon                   from 'Utilities/Amazon';
import Yahoo                    from 'Utilities/Yahoo';
import log                      from 'Utilities/logutils';
import js2Csv                   from 'Utilities/js2Csv';

dotenv.config();
const AMZ_ACCESS_KEY = process.env.AMZ_ACCESS_KEY;
const AMZ_SECRET_KEY = process.env.AMZ_SECRET_KEY;
const AMZ_ASSOCI_TAG = process.env.AMZ_ASSOCI_TAG;
const amz_keyset = { access_key: AMZ_ACCESS_KEY, secret_key: AMZ_SECRET_KEY, associ_tag: AMZ_ASSOCI_TAG };

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
          const conditions = !options.category 
            ? { user: options.user } : { user: options.user, category: options.category };
          Note.find(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'fetch/categorys':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Category.find(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          })
        });
      case 'fetch/added':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Added.find(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'fetch/deleted':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Deleted.find(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'fetch/readed':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Readed.find(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'fetch/traded':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Traded.find(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'fetch/bided':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Bided.find(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'fetch/starred':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Starred.find(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'fetch/listed':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          Listed.find(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'fetch/note':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id, user: options.user };
          Note.findOne(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'fetch/category':
        return new Promise((resolve, reject) => {
          const conditions = { _id:  options.id, user: options.user };
          Category.findOne(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'create/note':
        return new Promise((resolve, reject) => {
          const note = new Note({
            user: options.user
          , url: options.data.url
          , category: options.data.category
          , categoryIds: options.data.categoryIds
          , title: options.data.title
          , asin: options.data.asin
          , name: options.data.name
          , price: options.data.price
          , bidsprice: options.data.bidsprice
          , body: options.data.body
          , items: options.data.items
          });
          note.save((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'update/note':
        return new Promise((resolve, reject) => {
          const isItems = !!options.data.items;
          const isAsin = options.data.asin !== '';
          const conditions = { _id:  options.id, user: options.user };
          const update = isItems
            ? { items: options.data.items, updated: options.data.updated }
            : isAsin
              ? {
                title: options.data.title
              , asin: options.data.asin
              , price: options.data.price
              , bidsprice: options.data.bidsprice
              , body: options.data.body
              , name: options.data.name
              , AmazonUrl: options.data.AmazonUrl
              , AmazonImg: options.data.AmazonImg
              , categoryIds: options.data.categoryIds
              , updated: new Date
              }
              : {
                title: options.data.title
              , asin: options.data.asin
              , price: options.data.price
              , bidsprice: options.data.bidsprice
              , body: options.data.body
              , categoryIds: options.data.categoryIds
              , updated: new Date
              };
          Note.update(conditions, update).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'delete/note':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id, user: options.user };
          Note.remove(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'create/category':
        return new Promise((resolve, reject) => {
          const category = new Category({
            user: options.user
          , category: options.data.category
          , subcategory: options.data.subcategory
          , subcategoryId: new mongoose.Types.ObjectId
          });
          category.save((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'update/category':
        return new Promise((resolve, reject) => {
          const conditions = { _id:  options.id, user: options.user };
          const update = {
            category: options.data.category
          , subcategory: options.data.subcategory
          , subcategoryId: new mongoose.Types.ObjectId(options.data.subcategoryId)
          };
          Category.update(conditions, update).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'delete/category':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id, user: options.user };
          Category.remove(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'create/added':
        return new Promise((resolve, reject) => {
          const conditions = { added: options.id, user: options.user };
          const update = { added: options.id, user: options.user };
          Added.update(conditions, update, { upsert: true }).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'delete/added':
        return new Promise((resolve, reject) => {
          const conditions = { added: options.id, user: options.user };
          Added.remove(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'create/deleted':
        return new Promise((resolve, reject) => {
          const conditions = { deleted: options.id, user: options.user };
          const update = { deleted: options.id, user: options.user };
          Deleted.update(conditions, update, { upsert: true }).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'delete/deleted':
        return new Promise((resolve, reject) => {
          const conditions = { deleted: options.id, user: options.user };
          Deleted.remove(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'create/readed':
        return new Promise((resolve, reject) => {
          const conditions = { readed: options.id, user: options.user };
          const update = { readed: options.id, user: options.user };
          Readed.update(conditions, update, { upsert: true }).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'delete/readed':
        return new Promise((resolve, reject) => {
          const conditions = { readed: options.id, user: options.user };
          Readed.remove(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'create/traded':
        return new Promise((resolve, reject) => {
          const conditions = { traded: options.id, user: options.user };
          const update = { traded: options.id, user: options.user };
          Traded.update(conditions, update, { upsert: true }).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'delete/traded':
        return new Promise((resolve, reject) => {
          const conditions = { traded: options.id, user: options.user };
          Traded.remove(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'create/bided':
        return new Promise((resolve, reject) => {
          const conditions = { bided:  options.id, user: options.user };
          const update = { bided: options.id, user: options.user };
          Bided.update(conditions, update, { upsert: true }).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'delete/bided':
        return new Promise((resolve, reject) => {
          const conditions = { bided: options.id, user: options.user };
          Bided.remove(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'create/starred':
        return new Promise((resolve, reject) => {
          const conditions = { starred: options.id, user: options.user };
          const update = { starred: options.id, user: options.user };
          Starred.update(conditions, update, { upsert: true }).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'delete/starred':
        return new Promise((resolve, reject) => {
          const conditions = { starred:  options.id, user:     options.user };
          Starred.remove(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'create/listed':
        return new Promise((resolve, reject) => {
          const conditions = { listed: options.id, user:   options.user };
          const update = { listed: options.id, user:   options.user };
          Listed.update(conditions, update, { upsert: true }).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'delete/listed':
        return new Promise((resolve, reject) => {
          const conditions = { listed: options.id, user:   options.user };
          Listed.remove(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      default:
        return new Promise((resolve, reject) => reject({ name: 'error', message: 'request: ' + request }));
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
  }

  removeAdd(user, id) {
    return this.request('delete/added', { user, id });
  }

  addDelete(user, id) {
    return this.request('create/deleted', { user, id });
  }

  removeDelete(user, id) {
    return this.request('delete/deleted', { user, id });
  }

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
    return this.request('create/category', { user, data });
  }

  getNotes(user, category) {
    return this.request('fetch/notes', { user, category });
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
  }

  getDeleted(user) {
    return this.request('fetch/deleted', { user });
  }

  getNote(user, id) {
    return this.request('fetch/note', { user, id });
  }

  getCategory(user, id) {
    return this.request('fetch/category', { user, id });
  }

  fetchCategorys({ user }) {
    const observables = forkJoin([
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
    )(objs[3]);
    return observables.pipe(
      map(setAttribute)
    );
  }

  setCategorys(categorys) {
    const _categorys = this.toObject(categorys);
    const _hasCategorys = R.curry(this.hasCategorys)(_categorys);
    const _hasNotCategorys = this.hasNotCategorys;
    const _hasFavorites = this.hasFavorites;
    const __categorys = objs => R.concat(_hasCategorys(objs), _hasNotCategorys(objs));
    return objs => R.isNil(objs) ? _categorys : R.concat(__categorys(objs), _hasFavorites(objs))
    ;
  }

  hasCategorys(categorys, notes) {
    // 1. Match of the same categoryId.
    const _isNote = (categoryId, obj) => obj.categoryIds ? R.contains(categoryId, obj.categoryIds) : false;
    const isNote = R.curry(_isNote);
    const isNotes = (objs, categoryId) => R.filter(isNote(categoryId), objs);
    // 2. Get not readed item.
    const isNotRead = R.filter(obj => !obj.readed);
    const isNotReads = R.map(obj => obj.items ? R.length(isNotRead(obj.items)) : 0);
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
    const _isNotNote = (category, obj) => (obj.category === category && R.isNil(obj.categoryIds));
    const isNotNote = R.curry(_isNotNote);
    const isNotNotes = (objs, category) => R.filter(isNotNote(category), objs);
    // 2. Get not readed item.
    const isNotRead = R.filter(obj => !obj.readed);
    const isNotReads = R.map(obj => obj.items ? R.length(isNotRead(obj.items)) : 0);
    // 3. Return.
    const countNew = R.countBy(R.lt(0)); 
    return R.map(obj =>
      R.merge(obj, {
        newRelease: countNew(
          isNotReads(
            isNotNotes(notes, obj.category)))
      }), [
        { _id: '9999', category: 'marchant',        subcategory: '未分類' }
      , { _id: '9999', category: 'sellers',         subcategory: '未分類' }
      , { _id: '9999', category: 'closedmarchant',  subcategory: '未分類' }
      , { _id: '9999', category: 'closedsellers',   subcategory: '未分類' }
      ]);
  }

  hasFavorites(notes) {
    // 1. Match of the starred items.
    const isStarred = R.filter(obj => obj.starred);
    const isStarreds = obj => obj.items ? R.length(isStarred(obj.items)) > 0 : false;
    const _isStarredNote = (category, obj) => obj.category === category && isStarreds(obj);
    const isStarredNote = R.curry(_isStarredNote);
    const isStarredNotes = (objs, category) => R.filter(isStarredNote(category), objs);
    // 2. Get not readed item.
    const isNotRead = R.filter(obj => !obj.readed);
    const isNotReads = R.map(obj => obj.items ? R.length(isNotRead(obj.items)) : 0);
    // 3. Return.
    const countNew = R.countBy(R.lt(0)); 
    return R.map(obj =>
      R.merge(obj, {
        newRelease: countNew(
          isNotReads(
            isStarredNotes(notes, obj.category)))
      }), [
        { _id: '9998', category: 'marchant',        subcategory: 'お気に入り登録' }
      , { _id: '9998', category: 'sellers',         subcategory: 'お気に入り登録' }
      , { _id: '9998', category: 'closedmarchant',  subcategory: 'お気に入り登録' }
      , { _id: '9998', category: 'closedsellers',   subcategory: 'お気に入り登録' }
      ]);
  }

  fetchNotes({ user, category }) {
    const observables = forkJoin([
      this.getStarred(user)
    , this.getListed(user)
    , this.getReaded(user)
    , this.getDeleted(user)
    , this.getAdded(user)
    , this.getNotes(user, category)
    ]);
    const setAttribute = objs => R.compose(
      this.setAdded(objs[4])
    , this.setDeleted(objs[3])
    , this.setReaded(objs[2])
    , this.setListed(objs[1])
    , this.setStarred(objs[0])
    , this.toObject
    )(objs[5]);
    return observables.pipe(
      map(setAttribute)
    );
  }

  fetchAllNotes({ users }) {
    const observables = R.map(user => this.getNotes(user));
    return forkJoin(observables(users));
  }

  fetchAddedNotes({ user }) {
    const observables = forkJoin([
      this.getAdded(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setAdded(objs[0])
    , this.toObject
    )(objs[1]);
    return observables.pipe(
      map(setAttribute)
    );
  }

  fetchDeletedNotes({ user }) {
    const observables = forkJoin([
      this.getDeleted(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setDeleted(objs[0])
    , this.toObject
    )(objs[1]);
    return observables.pipe(
      map(setAttribute)
    );
  }

  fetchReadedNotes({ user }) {
    const observables = forkJoin([
      this.getReaded(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setReaded(objs[0])
    , this.toObject
    )(objs[1]);
    return observables.pipe(
      map(setAttribute)
    );
  }

  fetchTradedNotes({ user }) {
    const observables = forkJoin([
      this.getTraded(user)
    , this.getBided(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setBided(objs[1])
    , this.setTraded(objs[0])
    , this.toObject
    )(objs[2]);
    return observables.pipe(
      map(setAttribute)
    );
  }

  fetchBidedNotes({ user }) {
    const observables = forkJoin([
      this.getBided(user)
    , this.getListed(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setListed(objs[1])
    , this.setBided(objs[0])
    , this.toObject
    )(objs[2]);
    return observables.pipe(
      map(setAttribute)
    );
  }

  fetchStarredNotes({ user }) {
    const observables = forkJoin([
      this.getStarred(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setStarred(objs[0])
    , this.toObject
    )(objs[1]);
    return observables.pipe(
      map(setAttribute)
    );
  }

  fetchListedNotes({ user }) {
    const observables = forkJoin([
      this.getListed(user)
    , this.getNotes(user)
    ]);
    const setAttribute = objs => R.compose(
      this.setListed(objs[0])
    , this.toObject
    )(objs[1]);
    return observables.pipe(
      map(setAttribute)
    );
  }

  fetchNote({ user, id }) {
    const observables = forkJoin([
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
    return observables.pipe(
      map(setAttribute)
    , map(R.head)
    );
  }

  fetchCategory({ user, id }) {
    return from(this.getCategory(user, id));
  }

  toObject(objs) {
    return R.isNil(objs) ? [] : R.map(obj => obj.toObject() , objs);
  }

  setAdded(added) {
    //log.trace('setAdded', added);
    const ids =           objs => R.isNil(objs) ? [] : R.map(obj => obj.added, objs);
    const isId =          obj => R.contains(obj.guid._, ids(added));
    const setAdd =        obj => R.merge(obj, { added: isId(obj) });
    const _setAddItems =  obj => R.map(setAdd, obj.items);
    const setAddItems  =  obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setAddItems(obj) }); 
    const results =       objs => R.isNil(objs) ? [] : R.map(setAddItems, objs);
    return results;
  }

  setDeleted(deleted) {
    //log.trace('setDeleted', deleted);
    const ids =             objs => R.isNil(objs) ? [] : R.map(obj =>   obj.deleted, objs);
    const isId =            obj => R.contains(obj.guid._, ids(deleted));
    const setDelete =       obj => R.merge(obj, { deleted: isId(obj) });
    const _setDeleteItems = obj => R.map(setDelete, obj.items);
    const setDeleteItems  = obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setDeleteItems(obj) }); 
    const results =         objs => R.isNil(objs) ? [] : R.map(setDeleteItems, objs);
    return results;
  }

  setReaded(readed) {
    //log.trace('setReaded', readed);
    const ids =           objs => R.isNil(objs) ? [] : R.map(obj => obj.readed, objs);
    const isId =          obj => R.contains(obj.guid._, ids(readed));
    const setRead =       obj => R.merge(obj, { readed: isId(obj) });
    const _setReadItems = obj => R.map(setRead, obj.items);
    const setReadItems  = obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setReadItems(obj) }); 
    const results =       objs => R.isNil(objs) ? [] : R.map(setReadItems, objs);
    return results;
  }

  setListed(listed) {
    //log.trace('setListed', listed);
    const ids =           objs => R.isNil(objs) ? [] : R.map(obj => obj.listed, objs);
    const isId =          obj => R.contains(obj.guid._, ids(listed));
    const setList =       obj => R.merge(obj, { listed: isId(obj) });
    const _setListItems = obj => R.map(setList, obj.items);
    const setListItems =  obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setListItems(obj) });
    const results =       objs => R.isNil(objs) ? [] : R.map(setListItems, objs);
    return results;
  }

  setStarred(starred) {
    //log.trace('setStarred', starred);
    const ids =           objs => R.isNil(objs) ? [] : R.map(obj => obj.starred, objs);
    const isId =          obj => R.contains(obj.guid._, ids(starred));
    const setStar =       obj => R.merge(obj, { starred: isId(obj) });
    const _setStarItems = obj => R.map(setStar, obj.items);
    const setStarItems =  obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setStarItems(obj) });
    const results =       objs => R.isNil(objs) ? [] : R.map(setStarItems, objs);
    return results;
  }

  setTraded(traded) {
    //log.trace('setTraded', traded);
    const ids =           objs => R.isNil(objs) ? [] : R.map(obj => obj.traded, objs);
    const isId =          obj => R.contains(obj.guid._, ids(traded));
    const setTrade =      obj => R.merge(obj, { traded: isId(obj) });
    const _setTradeItems= obj => R.map(setTrade, obj.items);
    const setTradeItems = obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setTradeItems(obj) });
    const results =       objs => R.isNil(objs) ? [] : R.map(setTradeItems, objs);
    return results;
  }

  setBided(bided) {
    //log.trace('setBided', bided);
    const ids =           objs => R.isNil(objs) ? [] : R.map(obj => obj.bided, objs);
    const isId =          obj => R.contains(obj.guid._, ids(bided));
    const setBids =       obj => R.merge(obj, { bided: isId(obj) });
    const _setBidsItems = obj => R.map(setBids, obj.items);
    const setBidsItems  = obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setBidsItems(obj) });
    const results =       objs => R.isNil(objs) ? [] : R.map(setBidsItems, objs);
    return results;
  }

  createNote({ user, url, category, categoryIds, title }) {
    let observable;
    switch(category) {
      case 'closedmarchant':
        observable = Yahoo.of().fetchClosedMerchant({ url });
        break;
      case 'closedsellers':
        observable = Yahoo.of().fetchClosedSellers({ url });
        break;
      case 'marchant':
      case 'sellers':
      default:
        observable = Yahoo.of().fetchHtml({ url });
        break;
    }
    const setNote = obj => this.setNote({ user, url, category, categoryIds, title }, obj);
    const addNote = obj => from(this.addNote(user, obj));
    return observable.pipe(
      map(setNote)
    , flatMap(addNote)
    );
  }

  updateNote({ user, id, data }) {
    const isAsin = data.asin !== '';
    const setAmazonData = obj => obj
      ? R.merge(data, {
          name:       obj.ItemAttributes.Title
        , AmazonUrl:  obj.DetailPageURL
        , AmazonImg:  obj.MediumImage ? obj.MediumImage.URL : ''
      })
      : R.merge(data, { name: '', AmazonUrl: '', AmazonImg: '' });
    const setNote = obj => this._updateNote({ user, id, data: obj });
    const getNote = () => this.fetchNote({ user, id });
    return isAsin
      ? Amazon.of(amz_keyset).fetchItemLookup(data.asin, 'ASIN').pipe(
          map(setAmazonData)
        , flatMap(setNote)
        , flatMap(getNote)
        )
      : this._updateNote({ user, id, data }).pipe(
          flatMap(getNote)
        )
    ;
  }

  _updateNote({ user, id, data }) {
    return from(this.replaceNote(user, id, data));
  }
  
  deleteNote({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeNote(user, id));
    return forkJoin(promises(_ids));
  }

  createCategory({ user, category, subcategory }) {
    return from(this.addCategory(user, { category, subcategory }));
  }

  updateCategory({ user, id, data }) {
    const getCategory = () => this.fetchCategory({ user, id });
    return this._updateCategory({ user, id, data }).pipe(
        flatMap(getCategory)
      );
  }

  _updateCategory({ user, id, data }) {
    return from(this.replaceCategory(user, id, data));
  }

  deleteCategory({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeCategory(user, id));
    return forkJoin(promises(_ids));
  }

  updateHtml({ user, id, html }) {
    const data = { updated:  html.updated , items:    html.items  };
    return this._updateNote({ user, id, data });
  }

  updateRss({ user, id, rss }) {
    const data = { updated:  rss.updated , items:    rss.items  };
    return this._updateNote({ user, id, data });
  }

  createAdd({ user, ids }) {
    const promises = R.map(id => this.addAdd(user, id));
    return forkJoin(promises(ids));
  }

  deleteAdd({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeAdd(user, id));
    return forkJoin(promises(_ids));
  }

  createDelete({ user, ids }) {
    const promises = R.map(id => this.addDelete(user, id));
    return forkJoin(promises(ids));
  }

  deleteDelete({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeDelete(user, id));
    return forkJoin(promises(_ids));
  }

  createRead({ user, ids }) {
    const promises = R.map(id => this.getNote(user, id));
    const observables = forkJoin(promises(ids));
    const setRead = objs => this._createRead({ user, ids: objs });
    return observables.pipe(
      map(R.map(obj => obj.items))
    , map(R.flatten)
    , map(R.map(obj => obj.guid._))
    , flatMap(setRead)
    );
  }

  _createRead({ user, ids }) {
    //log.debug(user, ids);
    const promises = R.map(id => this.addRead(user, id));
    return forkJoin(promises(ids));
  }

  deleteRead({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeRead(user, id));
    return forkJoin(promises(_ids));
  }

  createTrade({ user, ids }) {
    const promises = R.map(id => this.addTrade(user, id));
    return forkJoin(promises(ids));
  }

  deleteTrade({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeTrade(user, id));
    return forkJoin(promises(_ids));
  }

  createBids({ user, ids }) {
    const promises = R.map(id => this.addBids(user, id));
    return forkJoin(promises(ids));
  }

  deleteBids({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeBids(user, id));
    return forkJoin(promises(_ids));
  }

  createStar({ user, ids }) {
    const promises = R.map(id => this.addStar(user, id));
    return forkJoin(promises(ids));
  }

  deleteStar({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeStar(user, id));
    return forkJoin(promises(_ids));
  }

  createList({ user, ids }) {
    const promises = R.map(id => this.addList(user, id));
    return forkJoin(promises(ids));
  }

  deleteList({ user, ids }) {
    const _ids = R.split(',', ids);
    const promises = R.map(id => this.removeList(user, id));
    return forkJoin(promises(_ids));
  }

  uploadNotes({ user, category, file }) {
    const observableCsv = from(this.setCsvToObj(user, category, file.content));
    const observableOpml = from(this.setOmplToObj(user, category, file.content));
    const setNote = objs => this.createNotes({ user, category, notes: objs});
    switch(file.type) {
      case 'application/vnd.ms-excel':
      case 'text/csv':
      case 'csv':
        return observableCsv.pipe(
          flatMap(setNote)
        );
      case 'opml':
        return observableOpml.pipe(
          flatMap(setNote)
        );
      default:
        log.error(FeedParser.displayName
          , 'setContent', `Unknown File Type: ${file.type}`);
        return null;
    }
  }
  
  createNotes({ user, category, notes }) {
    const setNote = obj => this.setNote({ user , category , title: obj.title , url: obj.url });
    const setNotes = R.map(setNote);
    const promises = R.map(obj => this.addNote(user, obj));
    return forkJoin(promises(setNotes(notes)));
  }

  setOmplToObj(user, category, file) {
    return new Promise((resolve, reject) => {
      parseString(file.toString(), {
          trim: true
        , explicitArray: true
        , attrkey: 'attr'
        , charkey: '_' }
      , (err, res) => {
        if(err) return reject(err);
        const outlines = res.opml.body[0].outline;
        const getOutline = obj => R.map(_obj => ({ attr: {
          type: 'rss'
        , category: obj.attr.title
        , title: _obj.attr.title
        , htmlUrl: _obj.attr.htmlUrl
        }}), obj.outline);
        const setOutline  = obj => obj.attr.type === 'rss'
        ? [{ attr: {
            type: 'rss'
          , category: obj.attr.category ? obj.attr.category : ''
          , title: obj.attr.title
          , htmlUrl: obj.attr.htmlUrl
          }}]
        : getOutline(obj);
        const setNote = obj => ({
          user
        , url: obj.attr.htmlUrl
        , category
        , subcategory: obj.attr.category
        , title: obj.attr.title
        , asin: ''
        , price: 0
        , bidsprice: 0
        , body: ''
        , updated: std.formatDate(new Date(), 'YYYY/MM/DD hh:mm:ss')
        });
        const base_url = 'https://auctions.yahoo.co.jp';
        const isYahoo = obj =>
          std.parse_url(obj.attr.htmlUrl).origin === base_url;
        resolve(R.compose(
          R.map(setNote)
        , R.filter(isYahoo)
        , R.flatten
        , R.map(setOutline)
        , R.flatten
        , R.map(setOutline)
        )(outlines));
      });
    });
  }
  
  setCsvToObj(user, category, file) {
    return new Promise(resolve => {
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
      const toColumn = R.map(R.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/));
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

  downloadNotes({ user, category }) {
    const isCategory = obj => obj.category === category;
    const setNotes = objs => R.map(obj => ({
      title:     obj.title
    , url:       obj.url
    , asin:      obj.asin
    , price:     obj.price
    , bidsprice: obj.bidsprice
    , memo:      obj.body
    }), objs);
    const keys = category === 'marchant'
      ? ['title', 'url', 'asin', 'price', 'bidsprice', 'memo']
      : ['title', 'url'];
    const setNotesCsv = objs => js2Csv.of({ csv: objs, keys }).parse();
    return this.fetchNotes({ user, category }).pipe(
      map(objs => R.filter(isCategory, objs))
    , map(objs => setNotes(objs))
    , map(objs => setNotesCsv(objs))
    , map(csv  => Buffer.from(csv, 'utf8'))
    );
  }
  
  downloadItems({ user, ids, filter }) {
    const setImage = (img, idx) => img[idx-1] ? img[idx-1] : '';
    const setAsins = R.join(':');
    const _getItems = R.curry(this.filterItems)(filter);
    const getItems = R.filter(_getItems);
    const setItems = R.map(obj => ({
      title:        obj.title
    , seller:       obj.seller
    , auid:         obj.guid__
    , link:         obj.link
    , price:        obj.price
    , buynow:       obj.buynow
    , condition:    obj.item_condition
    , categorys:    obj.item_categorys
    , bids:         obj.bids
    , countdown:    obj.countdown
    , image1:       setImage(obj.images, 1)
    , image2:       setImage(obj.images, 2)
    , image3:       setImage(obj.images, 3)
    , image4:       setImage(obj.images, 4)
    , image5:       setImage(obj.images, 5)
    , image6:       setImage(obj.images, 6)
    , image7:       setImage(obj.images, 7)
    , image8:       setImage(obj.images, 8)
    , image9:       setImage(obj.images, 9)
    , image10:      setImage(obj.images, 10)
    , offers:       obj.offers
    , market:       obj.market
    , sale:         obj.sale
    , sold:         obj.sold
    , categoryid:   obj.item_categoryid
    , explanation:  obj.explanation
    , payment:      obj.payment
    , shipping:     obj.shipping
    , ship_price:   obj.ship_price
    , ship_buynow:  obj.ship_buynow
    , asins:        setAsins(obj.asins)
    , date:         obj.pubDate
    }));
    const keys = [
      'auid', 'title', 'categorys'
    , 'price', 'ship_price', 'buynow', 'ship_buynow', 'condition', 'bids', 'countdown', 'seller', 'link'
    , 'image1', 'image2', 'image3', 'image4', 'image5', 'image6', 'image7', 'image8', 'image9',  'image10'
    , 'offers', 'market', 'sale', 'sold'
    , 'categoryid', 'explanation', 'payment', 'shipping', 'asins', 'date'];
    const setItemsCsv = objs => js2Csv.of({ csv: objs, keys }).parse();
    const setBuffer = csv  => Buffer.from(csv, 'utf8');
    const observables = R.map(id => this.fetchNote({ user, id }));
    return forkJoin(observables(ids)).pipe(
      map(R.map(obj => obj.items))
    , map(R.map(getItems))
    , map(R.map(setItems))
    , map(R.flatten)
    , map(setItemsCsv)
    , map(setBuffer)
    );
  }
  
  filterItems(filter, item) {
    if(!filter) return true;
    const date      = new Date();
    const now       = new Date(item.bidStopTime);
    const start     = new Date(filter.aucStartTime);
    const stop      = new Date(filter.aucStopTime);
    const year      = date.getFullYear();
    const month     = date.getMonth();
    const day       = date.getDate();
    const lastWeek  = new Date(year, month, day-7);
    const twoWeeks  = new Date(year, month, day-14);
    const lastMonth = new Date(year, month-1, day);
    const today     = new Date(year, month, day);
    const isLastWeek  = lastWeek  <= now && now < today && item.sold >= 1;
    const isTwoWeeks  = twoWeeks  <= now && now < today && item.sold >= 2;
    const isLastMonth = lastMonth <= now && now < today && item.sold >= 3;
    const isAll = true;
    const isNow = start <= now && now <= stop;
    return filter.inAuction
      ? isNow
      : filter.allAuction
        ? isAll
        : filter.lastMonthAuction 
          ? isLastMonth
          : filter.twoWeeksAuction 
            ? isTwoWeeks
            : filter.lastWeekAuction 
              ? isLastWeek
              : true;
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
    , items: obj ? obj.item : []
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
}
FeedParser.displayName = 'FeedParser';
