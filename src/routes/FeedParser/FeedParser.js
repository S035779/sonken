import path                     from 'path';
import dotenv                   from 'dotenv';
import * as R                   from 'ramda';
import { from, forkJoin }       from 'rxjs';
import { map, flatMap }         from 'rxjs/operators';
import { parseString }          from 'xml2js';
import mongoose                 from 'mongoose';
import encoding                 from 'encoding-japanese';
import { Iconv }                from 'iconv';
import { Items, Note, Category, Added, Deleted, Readed, Traded, Bided, Starred, Listed } 
                                from 'Models/feed';
import std                      from 'Utilities/stdutils';
import Amazon                   from 'Utilities/Amazon';
import Yahoo                    from 'Utilities/Yahoo';
import log                      from 'Utilities/logutils';
import js2Csv                   from 'Utilities/js2Csv';
import aws                      from 'Utilities/awsutils';

const config = dotenv.config();
if(config.error) throw config.error();
const AMZ_ACCESS_KEY = process.env.AMZ_ACCESS_KEY;
const AMZ_SECRET_KEY = process.env.AMZ_SECRET_KEY;
const AMZ_ASSOCI_TAG = process.env.AMZ_ASSOCI_TAG;
const amz_keyset = { access_key: AMZ_ACCESS_KEY, secret_key: AMZ_SECRET_KEY, associ_tag: AMZ_ASSOCI_TAG };
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_REGION_NAME = process.env.AWS_REGION_NAME;
const aws_keyset = { access_key: AWS_ACCESS_KEY, secret_key: AWS_SECRET_KEY, region: AWS_REGION_NAME };
const STORAGE = process.env.STORAGE;
const baseurl = 'https://auctions.yahoo.co.jp';
const ObjectId = mongoose.Types.ObjectId;

/**
 * FeedPaser class.
 *
 * @constructor
 */
export default class FeedParser {
  static of() {
    return new FeedParser();
  }

  request(request, options) {
    switch(request) {
      case 'defrag/items':
        {
          const { ids } = options;
          const date      = new Date();
          const year      = date.getFullYear();
          const month     = date.getMonth();
          const day       = date.getDate();
          const yesterday = new Date(year, month, day - 1);
          const conditions = { _id: { $in: ids }, pubDate: { $lt: yesterday  }};
          return Items.remove(conditions).exec();
        }
      case 'defrag/added':
        {
          const { user } = options;
          const hasNotItems = R.filter(obj => R.isNil(obj.items));
          const promises = R.map(obj => Added.remove({ added: obj.added }).exec());
          return Added.find({ user }).populate('items').exec()
            .then(docs => hasNotItems(docs))
            .then(docs => Promise.all(promises(docs)));
        }
      case 'defrag/deleted':
        {
          const { user } = options;
          const hasNotItems = R.filter(obj => R.isNil(obj.items));
          const promises = R.map(obj => Deleted.remove({ deleted: obj.deleted }).exec());
          return  Deleted.find({ user }).populate('items').exec()
            .then(docs => hasNotItems(docs))
            .then(docs => Promise.all(promises(docs)));
        }
      case 'defrag/readed':
        { 
          const { user } = options;
          const hasNotItems = R.filter(obj => R.isNil(obj.items));
          const promises = R.map(obj => Readed.remove({ readed: obj.readed }).exec());
          return Readed.find({ user }).populate('items').exec()
            .then(docs => hasNotItems(docs))
            .then(docs => Promise.all(promises(docs)));
        }
      case 'defrag/starred':
        {
          const { user } = options;
          const hasNotItems = R.filter(obj => R.isNil(obj.items));
          const promises = R.map(obj => Starred.remove({ starred: obj.starred }).exec());
          return Starred.find({ user }).populate('items').exec()
            .then(docs => hasNotItems(docs))
            .then(docs => Promise.all(promises(docs)));
        }
      case 'defrag/bided':
        { 
          const { user } = options;
          const hasNotItems = R.filter(obj => R.isNil(obj.items));
          const promises = R.map(obj => Bided.remove({ bided: obj.bided }).exec());
          return Bided.find({ user }).populate('items').exec()
            .then(docs => hasNotItems(docs))
            .then(docs => Promise.all(promises(docs)));
        }
      case 'defrag/traded':
        { 
          const { user } = options;
          const hasNotItems = R.filter(obj => R.isNil(obj.items));
          const promises = R.map(obj => Traded.remove({ traded: obj.traded }).exec());
          return Traded.find({ user }).populate('items').exec()
            .then(docs => hasNotItems(docs))
            .then(docs => Promise.all(promises(docs)));
        }
      case 'defrag/listed':
        {
          const { user } = options;
          const hasNotItems = R.filter(obj => R.isNil(obj.items));
          const promises = R.map(obj => Listed.remove({ listed: obj.listed }).exec());
          return Listed.find({ user }).populate('items').exec()
            .then(docs => hasNotItems(docs))
            .then(docs => Promise.all(promises(docs)));
        }
      case 'counts/notes':
      case 'count/notes':
      case 'fetch/notes':
        {
          const { user, category, skip, limit } = options;
          const isCounts = request === 'counts/notes';
          const isCount = request === 'count/notes';
          const isPaginate = skip && limit;
          const setIds = R.map(doc => doc._id);
          const conditions = category ? { user, category } : { user };
          let model, promise;
          if(isCount) {
            promise = Note.find(conditions).exec()
              .then(docs => setIds(docs))
              .then(docs => {
                model = Note.aggregate()
                  .match({ user, _id: { $in: docs.map(id => ObjectId(id)) } })
                  .project({ item_size: { $size: "$items" }})
                  .group({ _id: "$_id", counts: { $sum: "$item_size" } });
                return model.exec();
              });
          } else {
            model = Note.find(conditions);
            model = isPaginate
              ? model
                .populate({ path: 'items', options: { sort: { bidStopTime: 'desc' }, skip: 0, limit: 20 }})
                .sort('-updated').skip(Number(skip)).limit(Number(limit))
              : model
                .populate({ path: 'items', options: { sort: { bidStopTime: 'desc' }}})
                .sort('updated');
            promise = isCounts ? model.countDocuments().exec() : model.exec();
          }
          return promise;
        }
      case 'count/note':
      case 'fetch/note':
        {
          const { user, id, skip, limit, filter } = options;
          const isCount = request === 'count/note';
          const isPaginate = skip && limit;
          const setQuery = match => {
            const conditions = { user, _id: id };
            let model = Note.findOne(conditions);
            model = isPaginate 
              ? model.populate({ path: 'items', match
                , options: { sort: { bidStopTime: 'desc' }, skip: Number(skip), limit: Number(limit) }})
              : model.populate({ path: 'items', match
                , options: { sort: { bidStopTime: 'desc' } }});
            return model.exec();
          };
          let promise;
          if(filter) {
            const date      = new Date();
            const start     = new Date(filter.aucStartTime);
            const stop      = new Date(filter.aucStopTime);
            const year      = date.getFullYear();
            const month     = date.getMonth();
            const day       = date.getDate();
            const hours     = date.getHours();
            const minutes   = date.getMinutes();
            const seconds   = date.getSeconds();
            const lastWeek  = new Date(year, month, day - 7);
            const twoWeeks  = new Date(year, month, day - 14);
            const lastMonth = new Date(year, month - 1, day);
            const today     = new Date(year, month, day, hours, minutes, seconds);
            if(filter.inAuction) {
              promise = setQuery({ bidStopTime: { $gte: start, $lt: stop } });
            } else if(filter.allAuction) {
              promise = setQuery();
            } else if(filter.lastMonthAuction) {
              promise = setQuery({ bidStopTime: { $gte: lastMonth, $lt: today },  sold: { $gte: 3 } });
            } else if(filter.twoWeeksAuction) {
              promise = setQuery({ bidStopTime: { $gte: twoWeeks, $lt: today },   sold: { $gte: 2 } });
            } else if(filter.lastWeekAuction) {
              promise = setQuery({ bidStopTime: { $gte: lastWeek, $lt: today },   sold: { $gte: 1 } });
            }
          } else {
            promise = setQuery();
          }
          return isCount ? promise.then(doc => ([{ _id: doc._id, counts: doc.items.length }])) : promise;
        }
      case 'count/traded':
      case 'fetch/traded':
        {
          const { user, skip, limit, filter } = options;
          const isCount = request === 'count/traded';
          const isPaginate = skip && limit;
          const hasTraded = R.filter(doc => doc.traded && R.equals(doc.traded.user, user));
          const hasBided = R.filter(doc => doc.bided && R.equals(doc.bided.user, user));
          const setIds = R.map(doc => doc.guid__);
          let model, conditions, populates, promise;
          if(filter) {
            const start     = new Date(filter.bidStartTime);
            const stop      = new Date(filter.bidStopTime);
            if(filter.inBidding) {
              conditions = { 'bidStopTime': { $gte: start, $lt: stop }};
              promise = Items.find(conditions).populate('bided').exec()
                .then(docs => hasBided(docs))
                .then(docs => setIds(docs))
                .then(docs => {
                  conditions = { user, bided: { $in: docs } };
                  populates = { path: 'items', populate: [{ path: 'bided' }, { path: 'traded' }] } ;
                  model = Bided.find(conditions).populate(populates).sort('-updated');
                  model = isPaginate ? model.skip(Number(skip)).limit(Number(limit)) : model;
                  model = isCount ? model.countDocuments() : model;
                  return model.exec();
                });
            } else if(filter.allTrading) {
              conditions = { user };
              populates = { path: 'items', populate: [{ path: 'bided' }, { path: 'traded' }] };
              model = Bided.find(conditions).populate('items').sort('-updated');
              model = isPaginate ? model.skip(Number(skip)).limit(Number(limit)) : model;
              model = isCount ? model.countDocuments() : model;
              promise = model.exec();
            } else if(filter.endTrading) {
              conditions = {};
              promise = Items.find(conditions).populate('traded').exec()
                .then(docs => hasTraded(docs))
                .then(docs => setIds(docs))
                .then(docs => {
                  conditions = { user, traded: { $in: docs } };
                  populates = { path: 'items', populate: [{ path: 'traded' }, { path: 'traded' }] };
                  model = Traded.find(conditions).populate(populates).sort('-updated')
                  model = isPaginate ? model.skip(Number(skip)).limit(Number(limit)) : model;
                  model = isCount ? model.countDocuments() : model;
                  return model.exec();
                });
            }
          } else {
            conditions = { user };
            populates = { path: 'items', populate: [{ path: 'bided' }, { path: 'traded' }] };
            model = Bided.find(conditions).populate(populates).sort('-updated');
            model = isPaginate ? model.skip(Number(skip)).limit(Number(limit)) : model;
            model = isCount ? model.countDocuments() : model;
            promise = model.exec();
          }
          return promise;
        }
      case 'count/bided':
      case 'fetch/bided':
        {
          const { user, skip, limit, filter } = options;
          const isCount = request === 'count/bided';
          const isPaginate = skip && limit;
          const hasListed = R.filter(doc => doc.listed && R.equals(doc.listed.user, user));
          const setIds = R.map(doc => doc.guid__);
          let model, conditions, populates, promise;
          if(filter) {
            const date      = new Date();
            const start     = new Date(filter.bidStartTime);
            const stop      = new Date(filter.bidStopTime);
            const year      = date.getFullYear();
            const month     = date.getMonth();
            const day       = date.getDate();
            const yesterday = new Date(year, month, day);
            const today     = new Date(year, month, day + 1);
            if(filter.inBidding) {
              conditions = { 'bidStopTime': { $gte: start, $lt: stop } };
              promise = Items.find(conditions).populate('listed').exec()
                .then(docs => hasListed(docs))
                .then(docs => setIds(docs))
                .then(docs => {
                  conditions = { user, listed: { $in: docs } };
                  populates = { path: 'items', populate: [{ path: 'bided' }, { path: 'listed' }] };
                  model = Listed.find(conditions).populate(populates).sort('-updated');
                  model = isPaginate ? model.skip(Number(skip)).limit(Number(limit)) : model;
                  model = isCount ? model.countDocuments() : model;
                  return model.exec();
                });
            } else if(filter.allBidding) {
              conditions = { user };
              populates = { path: 'items', populate: [{ path: 'bided' }, { path: 'listed' }] };
              model = Listed.find(conditions).populate(populates).sort('-updated');
              model = isPaginate ? model.skip(Number(skip)).limit(Number(limit)) : model;
              model = isCount ? model.countDocuments() : model;
              promise = model.exec();
            } else if(filter.endBidding) {
              conditions = { 'bidStopTime': { $gte: yesterday, $lt: today } };
              promise = Items.find(conditions).populate('listed').exec()
                .then(docs => hasListed(docs))
                .then(docs => setIds(docs))
                .then(docs => {
                  conditions = { user, listed: { $in: docs } };
                  populates = { path: 'items', populate: [{ path: 'bided' }, { path: 'listed' }] };
                  model = Listed.find(conditions).populate(populates).sort('-updated');
                  model = isPaginate ? model.skip(Number(skip)).limit(Number(limit)) : model;
                  model = isCount ? model.countDocuments() : model;
                  return model.exec();
                });
            }
          } else {
            conditions = { user };
            populates = { path: 'items', populate: [{ path: 'bided' }, { path: 'listed' }] };
            model = Listed.find(conditions).populate(populates).sort('-updated');
            model = isPaginate ? model.skip(Number(skip)).limit(Number(limit)) : model;
            model = isCount ? model.countDocuments() : model;
            promise = model.exec();
          }
          return promise;
        }
      case 'fetch/listed':
        {
          const conditions = { user: options.user };
          return Listed.find(conditions).exec();
        }
      case 'fetch/added':
        {
          const conditions = { user: options.user };
          return Added.find(conditions).exec();
        }
      case 'fetch/deleted':
        {
          const conditions = { user: options.user };
          return Deleted.find(conditions).exec();
        }
      case 'fetch/readed':
        {
          const conditions = { user: options.user };
          return Readed.find(conditions).exec();
        }
      case 'fetch/starred':
        {
          const conditions = { user: options.user };
          return Starred.find(conditions).exec();
        }
      case 'fetch/categorys':
        {
          const conditions = { user: options.user };
          return Category.find(conditions).exec();
        }
      case 'fetch/category':
        {
          const conditions = { _id:  options.id, user: options.user };
          return Category.findOne(conditions).exec();
        }
      case 'create/note': 
        {
          const items = options.data.items;
          const note = {
            user: options.user
          , url: options.data.url
          , category: options.data.category
          , categoryIds: options.data.categoryIds
          , title: options.data.title
          , asin: options.data.asin
          , price: options.data.price
          , bidsprice: options.data.bidsprice
          , body: options.data.body
          , name: options.data.name
          };
          const getIds = R.map(obj => obj._id);
          const setIds = objs => R.merge(note, { items: objs });
          const putNote = obj => Note.create(obj);
          const setNote = R.compose(putNote, setIds, getIds);
          return Items.insertMany(items).then(setNote);
        }
      case 'update/note':
        {
          const isItems     = !!options.data.items;
          const isAsin      = options.data.asin !== '';
          const { id, user, data }  = options;
          const items       = data.items;
          const note        = isItems 
            ? { updated:      data.updated } 
            : isAsin 
              ? {
                  categoryIds:  data.categoryIds
                , title:        data.title
                , asin:         data.asin
                , price:        data.price
                , bidsprice:    data.bidsprice
                , body:         data.body
                , name:         data.name
                , AmazonUrl:    data.AmazonUrl
                , AmazonImg:    data.AmazonImg
                , updated:      new Date
              }
              : {
                  categoryIds:  data.categoryIds
                , title:        data.title
                , asin:         data.asin
                , price:        data.price
                , bidsprice:    data.bidsprice
                , body:         data.body
                , updated:      new Date
              };
          const conditions = { _id: id, user };
          const getIds = R.map(obj => obj._id);
          const setIds = objs => R.merge(note, { items: objs });
          const putNote = obj => Note.update(conditions, obj).exec();
          const setNote = R.compose(putNote, setIds, getIds);
          return isItems 
            ? Items.insertMany(items).then(setNote) 
            : setNote(note);
        }
      case 'delete/note':
        {
          const conditions = { _id: options.id, user: options.user };
          return Note.remove(conditions).exec();
        }
      case 'create/category':
        {
          const category = {
            user: options.user
          , category: options.data.category
          , subcategory: options.data.subcategory
          , subcategoryId: new ObjectId
          };
          return Category.create(category);
        }
      case 'update/category':
        {
          const conditions = { _id:  options.id, user: options.user };
          const update = {
            category: options.data.category
          , subcategory: options.data.subcategory
          , subcategoryId: ObjectId(options.data.subcategoryId)
          };
          return Category.update(conditions, update).exec();
        }
      case 'delete/category':
        {
          const conditions = { _id: options.id, user: options.user };
          return Category.remove(conditions).exec();
        }
      case 'create/added':
        {
          const conditions = { added: options.id, user: options.user };
          const update = { added: options.id, user: options.user };
          const params = { upsert: true };
          return Added.update(conditions, update, params).exec();
        }
      case 'delete/added':
        {
          const conditions = { added: options.id, user: options.user };
          return Added.remove(conditions).exec();
        }
      case 'create/deleted':
        {
          const conditions = { deleted: options.id, user: options.user };
          const update = { deleted: options.id, user: options.user };
          const params = { upsert: true };
          return Deleted.update(conditions, update, params).exec();
        }
      case 'delete/deleted':
        {
          const conditions = { deleted: options.id, user: options.user };
          return Deleted.remove(conditions).exec();
        }
      case 'create/readed':
        {
          const conditions = { readed: options.id, user: options.user };
          const update = { readed: options.id, user: options.user };
          const params = { upsert: true };
          return Readed.update(conditions, update, params).exec();
        }
      case 'delete/readed':
        {
          const conditions = { readed: options.id, user: options.user };
          return Readed.remove(conditions).exec();
        }
      case 'create/traded':
        {
          const conditions = { traded: options.id, user: options.user };
          const update = { traded: options.id, user: options.user };
          const params = { upsert: true };
          return Traded.update(conditions, update, params).exec();
        }
      case 'delete/traded':
        {
          const conditions = { traded: options.id, user: options.user };
          return Traded.remove(conditions).exec();
        }
      case 'create/bided':
        {
          const conditions = { bided:  options.id, user: options.user };
          const update = { bided: options.id, user: options.user };
          const params = { upsert: true };
          return Bided.update(conditions, update, params).exec();
        }
      case 'delete/bided':
        {
          const conditions = { bided: options.id, user: options.user };
          return Bided.remove(conditions).exec();
        }
      case 'create/starred':
        {
          const conditions = { starred: options.id, user: options.user };
          const update = { starred: options.id, user: options.user };
          const params = { upsert: true };
          return Starred.update(conditions, update, params).exec();
        }
      case 'delete/starred':
        {
          const conditions = { starred:  options.id, user:     options.user };
          return Starred.remove(conditions).exec();
        }
      case 'create/listed':
        {
          const conditions = { listed: options.id, user:   options.user };
          const update = { listed: options.id, user:   options.user };
          const params = { upsert: true };
          return Listed.update(conditions, update, params).exec();
        }
      case 'delete/listed':
        {
          const conditions = { listed: options.id, user:   options.user };
          return Listed.remove(conditions).exec();
        }
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

  getNotes(user, category, skip, limit) {
    return this.request('fetch/notes', { user, category, skip, limit });
  }

  getCategorys(user) {
    return this.request('fetch/categorys', { user });
  }

  getListed(user) {
    return this.request('fetch/listed', { user });
  }

  getBided(user, skip, limit, filter) {
    return this.request('fetch/bided', { user, skip, limit, filter });
  }

  getTraded(user, skip, limit, filter) {
    return this.request('fetch/traded', { user, skip, limit, filter });
  }

  getStarred(user) {
    return this.request('fetch/starred', { user });
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

  getNote(user, id, skip, limit, filter) {
    return this.request('fetch/note', { user, id, skip, limit, filter });
  }

  getCategory(user, id) {
    return this.request('fetch/category', { user, id });
  }
  
  cntsNotes(user) {
    return this.request('counts/notes', { user });
  }

  cntNotes(user) {
    return this.request('count/notes', { user });
  }

  cntNote(user, id, filter) { 
    return this.request('count/note', { user, id, filter });
  }

  cntBided(user, skip, limit, filter) {
    return this.request('count/bided', { user, skip, limit, filter });
  }

  cntTraded(user, skip, limit, filter) {
    return this.request('count/traded', { user, skip, limit, filter });
  }

  dfgItems(ids) {
    return this.request('defrag/items', { ids });
  }

  dfgAdded(user) {
    return this.request('defrag/added', { user });
  }

  dfgDeleted(user) {
    return this.request('defrag/deleted', { user });
  }
  
  dfgReaded(user) {
    return this.request('defrag/readed', { user });
  }

  dfgStarred(user) {
    return this.request('defrag/starred', { user });
  }

  dfgBided(user) {
    return this.request('defrag/bided', { user });
  }

  dfgTraded(user) {
    return this.request('defrag/traded', { user });
  }

  dfgListed(user) {
    return this.request('defrag/listed', { user });
  }

  defragItems({ user, ids }) {
    return forkJoin([
        this.dfgItems(ids)
      , this.dfgAdded(user)
      , this.dfgDeleted(user)
      , this.dfgReaded(user)
      , this.dfgStarred(user)
      , this.dfgListed(user)
      , this.dfgBided(user)
      , this.dfgTraded(user)
      ]);
  }

  fetchCategorys({ user, category, skip, limit }) {
    const observables = forkJoin([
      this.getReaded(user)
    , this.getStarred(user)
    , this.getCategorys(user)
    , this.getNotes(user, category, skip, limit)
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

  fetchNotes({ user, category, skip, limit }) {
    const observables = forkJoin([
      this.getStarred(user)
    , this.getListed(user)
    , this.getReaded(user)
    , this.getDeleted(user)
    , this.getAdded(user)
    , this.cntNotes(user, category)
    , this.cntsNotes(user, category)
    , this.getNotes(user, category, skip, limit)
    ]);
    const setAttribute = objs => R.compose(
      this.setNotePage(skip, limit, objs[6])
    , this.setItemPage(   0,    20, objs[5])
    , this.setAdded(objs[4])
    , this.setDeleted(objs[3])
    , this.setReaded(objs[2])
    , this.setListed(objs[1])
    , this.setStarred(objs[0])
    , this.toObject
    )(objs[7]);
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

  fetchTradedNotes({ user, skip, limit, filter }) {
    const observables = forkJoin([
      this.cntTraded(user, null,  null, filter)
    , this.getTraded(user, skip, limit, filter)
    ]);
    const setAttribute = objs => R.compose(
      this.setAttributes(skip, limit, objs[0])
    )(objs[1]);
    return observables.pipe(
      map(setAttribute)
    );
  }

  fetchBidedNotes({ user, skip, limit, filter }) {
    const observables = forkJoin([
      this.cntBided(user, null,  null, filter)
    , this.getBided(user, skip, limit, filter)
    ]);
    const setAttribute = objs => R.compose(
      this.setAttributes(skip, limit, objs[0])
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

  fetchNote({ user, id, skip, limit, filter }) {
    const observables = forkJoin([
      this.getStarred(user)
    , this.getListed(user)
    , this.getReaded(user)
    , this.getDeleted(user)
    , this.getAdded(user)
    , this.cntNote(user, id, filter)
    , this.getNote(user, id, skip, limit, filter)
    ]);
    const setAttribute = objs => R.compose(
      this.setItemPage(skip, limit, objs[5])
    , this.setAdded(objs[4])
    , this.setDeleted(objs[3])
    , this.setReaded(objs[2])
    , this.setListed(objs[1])
    , this.setStarred(objs[0])
    , this.toObject
    )([objs[6]]);
    return observables.pipe(
      map(setAttribute)
    , map(R.head)
    );
  }

  fetchCategory({ user, id }) {
    return from(this.getCategory(user, id));
  }

  toObject(objs) {
    const setObj  = obj => obj.toObject();
    const hasObj  = obj => obj ? true : false;
    const setObjs = R.map(setObj);
    const hasObjs = R.filter(hasObj);
    return R.compose(setObjs, hasObjs)(objs);
  }

  setAdded(added) {
    //log.trace('setAdded', added);
    const ids = objs => R.isNil(objs) ? [] : R.map(obj => obj.added, objs);
    const isId = obj => R.contains(obj.guid._, ids(added));
    const setAdd = obj => R.merge(obj, { added: isId(obj) });
    const _setAddItems = obj => R.map(setAdd, obj.items);
    const setAddItems = obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setAddItems(obj) }); 
    const results = objs => R.isNil(objs) ? [] : R.map(setAddItems, objs);
    return results;
  }

  setDeleted(deleted) {
    //log.trace('setDeleted', deleted);
    const ids = objs => R.isNil(objs) ? [] : R.map(obj =>   obj.deleted, objs);
    const isId = obj => R.contains(obj.guid._, ids(deleted));
    const setDelete = obj => R.merge(obj, { deleted: isId(obj) });
    const _setDeleteItems = obj => R.map(setDelete, obj.items);
    const setDeleteItems  = obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setDeleteItems(obj) }); 
    const results = objs => R.isNil(objs) ? [] : R.map(setDeleteItems, objs);
    return results;
  }

  setReaded(readed) {
    //log.trace('setReaded', readed);
    const ids = objs => R.isNil(objs) ? [] : R.map(obj => obj.readed, objs);
    const isId = obj => R.contains(obj.guid._, ids(readed));
    const setRead = obj => R.merge(obj, { readed: isId(obj) });
    const _setReadItems = obj => R.map(setRead, obj.items);
    const setReadItems = obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setReadItems(obj) }); 
    const results = objs => R.isNil(objs) ? [] : R.map(setReadItems, objs);
    return results;
  }

  setListed(listed) {
    //log.trace('setListed', listed);
    const ids = objs => R.isNil(objs) ? [] : R.map(obj => obj.listed, objs);
    const isId = obj => R.contains(obj.guid._, ids(listed));
    const setList = obj => R.merge(obj, { listed: isId(obj) });
    const _setListItems = obj => R.map(setList, obj.items);
    const setListItems = obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setListItems(obj) });
    const results = objs => R.isNil(objs) ? [] : R.map(setListItems, objs);
    return results;
  }

  setStarred(starred) {
    //log.trace('setStarred', starred);
    const ids = objs => R.isNil(objs) ? [] : R.map(obj => obj.starred, objs);
    const isId = obj => R.contains(obj.guid._, ids(starred));
    const setStar = obj => R.merge(obj, { starred: isId(obj) });
    const _setStarItems = obj => R.map(setStar, obj.items);
    const setStarItems = obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setStarItems(obj) });
    const results = objs => R.isNil(objs) ? [] : R.map(setStarItems, objs);
    return results;
  }

  setItemPage(skip, limit, counts) {
    //log.trace(FeedParser.displayName, 'setItemPage', counts);
    const _counts = id => R.find(obj => id.equals(obj._id))(counts);
    const inCounts = num => R.gt(num, Number(skip) + Number(limit))
    const setItem = num => ({ total: num, count: inCounts(num) ? Number(skip) + Number(limit) : num });
    const setPage = num => ({ total: Math.ceil(num / Number(limit)), count: inCounts(num)
      ? Math.ceil((Number(skip) + Number(limit)) / Number(limit)) : Math.ceil(num / Number(limit)) });
    const setAttributes = obj => ({ item: setItem(obj.counts), page: setPage(obj.counts) });
    const setCounts = obj => R.merge(obj, { attributes: setAttributes(_counts(obj._id)) });
    const results = objs => R.isNil(objs) || R.isEmpty(counts) ? [] : R.map(setCounts, objs);
    return results;
  }

  setNotePage(skip, limit, counts) {
    //log.trace(FeedParser.displayName, 'setNotePage', counts);
    const inCounts = R.gt(counts, Number(skip) + Number(limit));
    const note = { total: counts, count: inCounts ? Number(skip) + Number(limit) : counts };
    const page = { total: Math.ceil(counts / Number(limit)), count: inCounts
      ? Math.ceil((Number(skip) + Number(limit)) / Number(limit)) : Math.ceil(counts / Number(limit)) };
    const setCounts = obj => R.merge(obj, { note_attributes: { note, page } });
    const results = objs => R.isNil(objs) || counts === 0 ? [] : R.map(setCounts, objs);
    return results;
  }

  setAttributes(skip, limit, counts) {
    //log.trace(FeedParser.displayName, 'setAttributes', counts);
    const inCounts = R.gt(counts, Number(skip) + Number(limit));
    const item = { total: counts, count: inCounts ? Number(skip) + Number(limit) : counts };
    const page = { total: Math.ceil(counts / Number(limit)), count: inCounts
      ? Math.ceil((Number(skip) + Number(limit)) / Number(limit)) : Math.ceil(counts / Number(limit)) };
    const setItems = R.map(obj => obj.items);
    const setNotes = objs => ([{ attributes: { item, page }, items: setItems(objs) }]);
    const results = objs => R.isNil(objs) ? [] : setNotes(objs);
    return results;
  }

  //setTraded(traded) {
  //  //log.trace('setTraded', traded);
  //  const ids =           objs => R.isNil(objs) ? [] : R.map(obj => obj.traded, objs);
  //  const isId =          obj => R.contains(obj.guid._, ids(traded));
  //  const setTrade =      obj => R.merge(obj, { traded: isId(obj) });
  //  const _setTradeItems= obj => R.map(setTrade, obj.items);
  //  const setTradeItems = obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setTradeItems(obj) });
  //  const results =       objs => R.isNil(objs) ? [] : R.map(setTradeItems, objs);
  //  return results;
  //}

  //setBided(bided) {
  //  //log.trace('setBided', bided);
  //  const ids =           objs => R.isNil(objs) ? [] : R.map(obj => obj.bided, objs);
  //  const isId =          obj => R.contains(obj.guid._, ids(bided));
  //  const setBids =       obj => R.merge(obj, { bided: isId(obj) });
  //  const _setBidsItems = obj => R.map(setBids, obj.items);
  //  const setBidsItems  = obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setBidsItems(obj) });
  //  const results =       objs => R.isNil(objs) ? [] : R.map(setBidsItems, objs);
  //  return results;
  //}

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
    const setRead = objs => this._createRead({ user, ids: objs });
    return forkJoin(promises(ids)).pipe(
      map(R.filter(obj => obj.items))
    , map(R.map(obj => obj.items))
    , map(R.flatten)
    , map(R.map(obj => obj.guid._))
    , flatMap(setRead)
    );
  }

  _createRead({ user, ids }) {
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
    const setNote = objs => this.createNotes({ user, category, categoryIds: [objs[0]._id], notes: objs[1] });
    const subcategory = 'Uploadfile';
    switch(file.type) {
      case 'application/vnd.ms-excel':
      case 'text/csv':
      case 'csv':
        return forkJoin([
            this.addCategory(user, { category, subcategory })
          , this.setCsvToObj(user, category, file.content)
          ]).pipe(flatMap(setNote));
      case 'opml':
        return forkJoin([
            this.addCategory(user, { category, subcategory })
          , this.setOmplToObj(user, category, file.content)
          ]).pipe(flatMap(setNote));
      default:
        log.error(FeedParser.displayName, 'setContent', `Unknown File Type: ${file.type}`);
        return null;
    }
  }
  
  createNotes({ user, category, categoryIds, notes }) {
    const setNote = obj => this.setNote({ user, category, categoryIds, title: obj.title , url: obj.url });
    const setNotes = R.map(setNote);
    const promises = R.map(obj => this.addNote(user, obj));
    return forkJoin(promises(setNotes(notes)));
  }

  setOmplToObj(user, category, file) {
    return new Promise((resolve, reject) => {
      parseString(file.toString(), { trim: true, explicitArray: true, attrkey: 'attr', charkey: '_' }
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
        const isYahoo = obj => std.parse_url(obj.attr.htmlUrl).origin === baseurl;
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
      , category
      , title:        arr[0]
      , url:          this.setUrl(category, arr[1])
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

  setUrl(category, string) {
    if(string.match(/^(https?|ftp)(:\/\/[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+)$/)) {
      return string;
    } else {
      switch(category) {
        case 'closedmarchant':
          return baseurl + '/closedsearch/closedsearch?' + std.urlencode({ p: string });
        case 'closedsellers':
          return baseurl + '/jp/show/rating?' + std.urlencode({ userID: string, role: 'seller' });
        case 'sellers':
          return baseurl + '/seller/' + string;
        default:
          return baseurl + '/search/search?' + std.urlencode({ p: string });
      }
    }
  }

  setNote({ user, url, category, categoryIds, title }, obj) {
    //log.debug(FeedParser.displayName, 'setNote', { user, title, category, categoryIds, url });
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

  downloadNotes({ user, category }) {
    const keys = category === 'marchant'
      ? ['title', 'url', 'asin', 'price', 'bidsprice', 'memo'] : ['title', 'url'];
    const setBuffer = csv  => Buffer.from(csv, 'utf8');
    const setNotes = R.map(obj => ({
      title:     obj.title
    , url:       obj.url
    , asin:      obj.asin
    , price:     obj.price
    , bidsprice: obj.bidsprice
    , memo:      obj.body
    }));
    const setNotesCsv = objs => js2Csv.of({ csv: objs, keys }).parse();
    return this.fetchNotes({ user, category }).pipe(
      map(setNotes)
    , map(setNotesCsv)
    , map(setBuffer)
    );
  }
  
  downloadItems({ user, ids, filter }) {
    const keys = [
      'filename', 'category_id', 'title', 'input_method_of_description', 'description'
    , 'image1', 'image2', 'image3', 'image4', 'image5', 'image6', 'image7', 'image8', 'image9', 'image10'
    , 'coment1', 'coment2', 'coment3', 'coment4', 'coment5', 'coment6', 'coment7', 'coment8', 'coment9'
    , 'coment10', 'number', 'start_price', 'buynow_price'
    , 'negotiation', 'duration', 'end_time', 'auto_re_sale', 'auto_price_cut', 'auto_extension'
    , 'early_termination', 'bidder_limit', 'bad_evaluation', 'identification', 'condition'
    , 'remarks_on_condition'
    , 'returns', 'remarks_on_returns', 'yahoo_easy_settlement', 'check_seller_information'
    , 'region', 'municipality', 'shipping_charge_borne', 'shipping_input_method', 'delivaly_days'
    , 'yafuneko', 'yafuneko_compact', 'yafuneko_post', 'jpp_pack'
    , 'jpp_packet', 'unused1', 'unused2', 'size', 'weight'
    , 'shipping_method1',   'domestic1',  'hokkaido1',  'okinawa1',   'remote1'
    , 'shipping_method2',   'domestic2',  'hokkaido2',  'okinawa2',   'remote2'
    , 'shipping_method3',   'domestic3',  'hokkaido3',  'okinawa3',   'remote3'
    , 'shipping_method4',   'domestic4',  'hokkaido4',  'okinawa4',   'remote4'
    , 'shipping_method5',   'domestic5',  'hokkaido5',  'okinawa5',   'remote5'
    , 'shipping_method6',   'domestic6',  'hokkaido6',  'okinawa6',   'remote6'
    , 'shipping_method7',   'domestic7',  'hokkaido7',  'okinawa7',   'remote7'
    , 'shipping_method8',   'domestic8',  'hokkaido8',  'okinawa8',   'remote8'
    , 'shipping_method9',   'domestic9',  'hokkaido9',  'okinawa9',   'remote9'
    , 'shipping_method10',  'domestic10', 'hokkaido10', 'okinawa10',  'remote10'
    , 'arrival_jpp_pack', 'arrival_mail', 'arrival_neko', 'arrival_sagawa'
    , 'arrival_seino', 'oversea', 'options', 'bold', 'background', 'affiliate'
    ];
    const setBuffer = csv  => Buffer.from(csv, 'utf8');
    const setItemsCsv = objs => js2Csv.of({ csv: objs, keys }).parse();
    const setImage = (img, idx) => img[idx-1] ? img[idx-1] : '';
    const setItems = R.map(obj => ({
      filename: '-', category_id: obj.item_categoryid, title: obj.title, input_method_of_description: '-'
    , description: obj.explanation
    , image1: setImage(obj.images, 1), image2: setImage(obj.images, 2), image3: setImage(obj.images, 3)
    , image4: setImage(obj.images, 4), image5: setImage(obj.images, 5), image6: setImage(obj.images, 6)
    , image7: setImage(obj.images, 7), image8: setImage(obj.images, 8), image9: setImage(obj.images, 9)
    , image10: setImage(obj.images, 10)
    , coments1: '-', coments2:  '-', coments3: '-', coments4: '-'
    , coments5: '-', coments6:  '-', coments7: '-', coments8: '-'
    , coments9: '-', coments10: '-'
    , number: '-', start_price: '-', buynow_price: obj.buynow, negotiation: '-', duration: obj.countdown
    , end_time: '-', auto_re_sale: '-', auto_price_cut: '-', auto_extension: '-', early_termination: '-'
    , bidder_limit: '-', bad_evaluation: '-', identification: '-', condition: obj.item_condition
    , remarks_on_condition: '-', returns: '-', remarks_on_returns: '-', yahoo_easy_settlement: '-'
    , check_seller_information: '-', region: '-', municipality: '-', shipping_charge_borne: '-'
    , shipping_input_method: '-', delivaly_days: '-', yafuneko: '-', yafuneko_compact: '-'
    , yafuneko_post: '-', jpp_pack: '-', jpp_packet: '-', unused1: '-', unused2: '-', size: '-', weight: '-'
    , shipping_method1:  '-', domestic1:    '-', hokkaido1:    '-', okinawa1:       '-', remote1: '-'
    , shipping_method2:  '-', domestic2:    '-', hokkaido2:    '-', okinawa2:       '-', remote2: '-'
    , shipping_method3:  '-', domestic3:    '-', hokkaido3:    '-', okinawa3:       '-', remote3: '-'
    , shipping_method4:  '-', domestic4:    '-', hokkaido4:    '-', okinawa4:       '-', remote4: '-'
    , shipping_method5:  '-', domestic5:    '-', hokkaido5:    '-', okinawa5:       '-', remote5: '-'
    , shipping_method6:  '-', domestic6:    '-', hokkaido6:    '-', okinawa6:       '-', remote6: '-'
    , shipping_method7:  '-', domestic7:    '-', hokkaido7:    '-', okinawa7:       '-', remote7: '-'
    , shipping_method8:  '-', domestic8:    '-', hokkaido8:    '-', okinawa8:       '-', remote8: '-'
    , shipping_method9:  '-', domestic9:    '-', hokkaido9:    '-', okinawa9:       '-', remote9: '-'
    , shipping_method10: '-', domestic10:   '-', hokkaido10:   '-', okinawa10:      '-', remote10: '-'
    , arrival_jpp_pack:  '-', arrival_mail: '-', arrival_neko: '-', arrival_sagawa: '-', arrival_seino: '-'
    , oversea: '-',           options:      '-', bold:         '-', background:     '-', affiliate: '-'
    }));
    const getItems    = obj => obj.items ? obj.items : [];
    const dupItems    = objs => std.dupObj(objs, 'title');
    const observables = R.map(id => this.fetchNote({ user, id, filter }));
    return forkJoin(observables(ids)).pipe(
      map(R.map(getItems))
    , map(R.map(setItems))
    , map(R.flatten)
    , map(dupItems)
    , map(setItemsCsv)
    , map(setBuffer)
    );
  }

  downloadTrade({ user, filter }) {
    const keys = [ 'auid', 'title', 'categorys', 'price', 'ship_price', 'buynow', 'ship_buynow', 'condition'
    , 'bids', 'countdown', 'seller', 'link', 'image1', 'image2', 'image3', 'image4', 'image5', 'image6'
    , 'image7', 'image8', 'image9',  'image10', 'offers', 'market', 'sale', 'sold', 'categoryid'
    , 'explanation', 'payment', 'shipping', 'asins', 'date'];
    const setBuffer = csv  => Buffer.from(csv, 'utf8');
    const setItemsCsv = objs => js2Csv.of({ csv: objs, keys }).parse();
    const setImage = (img, idx) => img[idx-1] ? img[idx-1] : '';
    const setAsins = R.join(':');
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
    const getItems    = obj => obj.items ? obj.items : [];
    const dupItems    = objs => std.dupObj(objs, 'title');
    return this.fetchTradedNotes({ user, filter }).pipe(
      map(R.map(getItems))
    , map(R.map(setItems))
    , map(R.flatten)
    , map(dupItems)
    , map(setItemsCsv)
    , map(setBuffer)
    );
  }
  
  downloadBids({ user, filter }) {
    const keys = [ 'auid', 'title', 'categorys', 'price', 'ship_price', 'buynow', 'ship_buynow', 'condition'
    , 'bids', 'countdown', 'seller', 'link', 'image1', 'image2', 'image3', 'image4', 'image5', 'image6'
    , 'image7', 'image8', 'image9',  'image10', 'offers', 'market', 'sale', 'sold', 'categoryid'
    , 'explanation', 'payment', 'shipping', 'asins', 'date'];
    const setBuffer = csv  => Buffer.from(csv, 'utf8');
    const setItemsCsv = objs => js2Csv.of({ csv: objs, keys }).parse();
    const setImage = (img, idx) => img[idx-1] ? img[idx-1] : '';
    const setAsins = R.join(':');
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
    const getItems    = obj => obj.items ? obj.items : [];
    const dupItems    = objs => std.dupObj(objs, 'title');
    return this.fetchBidedNotes({ user, filter }).pipe(
      map(R.map(getItems))
    , map(R.map(setItems))
    , map(R.flatten)
    , map(dupItems)
    , map(setItemsCsv)
    , map(setBuffer)
    );
  }

  downloadImages({ user, ids, filter }) {
    const AWS         = aws.of(aws_keyset);
    //const promises    = R.map(obj => AWS.fetchSignedUrl(STORAGE, obj));
    const promise     = objs => AWS.fetchObjects(STORAGE, objs);
    const getImages   = objs => from(promise(objs));
    const setKey      = (aid, url) => std.crypto_sha256(url, aid, 'hex') + '.img';
    const setName     = (aid, url) => aid + '_' + path.basename(std.parse_url(url).pathname);
    const setImage    = (aid, urls) => R.map(url => ({ key: setKey(aid,url), name: setName(aid,url) }), urls);
    const setImages   = R.map(obj => setImage(obj.auid, obj.images))
    const dupItems    = objs => std.dupObj(objs, 'title');
    const setItems    = R.map(obj => ({ auid: obj.guid__, title: obj.title, images: obj.images}));
    const getItems    = obj => obj.items ? obj.items : [];
    const observables = R.map(id => this.fetchNote({ user, id, filter }));
    return forkJoin(observables(ids)).pipe(
      map(R.map(getItems))
    , map(R.map(setItems))
    , map(R.flatten)
    , map(dupItems)
    , map(setImages)
    , map(R.flatten)
    , flatMap(getImages)
    );
  }
}
FeedParser.displayName = 'FeedParser';
