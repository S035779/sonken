import path                       from 'path';
import dotenv                     from 'dotenv';
import * as R                     from 'ramda';
import { from, forkJoin }         from 'rxjs';
import { map, flatMap }           from 'rxjs/operators';
import { parseString }            from 'xml2js';
import mongoose                   from 'mongoose';
import encoding                   from 'encoding-japanese';
import { Iconv }                  from 'iconv';
import { Item, Note, Category, Added, Deleted, Readed, Traded, Bided, Starred, Listed, Attribute } 
                                  from 'Models/feed';
import std                        from 'Utilities/stdutils';
import Amazon                     from 'Utilities/Amazon';
import Yahoo                      from 'Utilities/Yahoo';
import log                        from 'Utilities/logutils';
import js2Csv                     from 'Utilities/js2Csv';
import aws                        from 'Utilities/awsutils';

const config = dotenv.config();
if(config.error) throw config.error();

const AMZ_ACCESS_KEY  = process.env.AMZ_ACCESS_KEY;
const AMZ_SECRET_KEY  = process.env.AMZ_SECRET_KEY;
const AMZ_ASSOCI_TAG  = process.env.AMZ_ASSOCI_TAG;
const AWS_ACCESS_KEY  = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY  = process.env.AWS_SECRET_KEY;
const AWS_REGION_NAME = process.env.AWS_REGION_NAME;
const STORAGE         = process.env.STORAGE;

const amz_keyset  = { access_key: AMZ_ACCESS_KEY, secret_key: AMZ_SECRET_KEY, associ_tag: AMZ_ASSOCI_TAG };
const aws_keyset  = { access_key: AWS_ACCESS_KEY, secret_key: AWS_SECRET_KEY, region: AWS_REGION_NAME };
const baseurl     = 'https://auctions.yahoo.co.jp';

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
      case 'job/notes':
        {
          const { users, categorys, filter, skip, limit, sort } = options;
          const isItems = filter && filter.isItems;
          const isImages = filter && filter.isImages;
          const create = filter && !R.isNil(filter.create) ? filter.create : Date.now();
          const expire = filter && !R.isNil(filter.expire) ? filter.expire : Date.now();
          const conditions = isItems
          ? { 
            user:     { $in: users }
          , category: { $in: categorys }
          , items:    { $ne: [], $exists: true }
          , $or:      [{ created: { $gt: create }}, { updated: { $lt: expire } }]
          } : {
            user:     { $in: users }
          , category: { $in: categorys }
          , $or:      [{ created: { $gt: create }}, { updated: { $lt: expire } }]
          };
          const select = { user: 1, category: 1, url: 1 };
          const params = {
            path:     'items'
          , select:   { guid__: 1 }
          , options:  { sort: { bidStopTime: 'desc' } }
          , populate: { path: 'attributes', select: { images: 1 } }
          };
          const hasImages = R.filter(obj => obj.attributes && obj.attributes.images)
          const setItems = R.map(obj => isImages ? R.merge(obj, { items: hasImages(obj.items) }) : obj);
          const hasItems = R.filter(obj => obj.items);
          const hasNotes = R.compose(setItems, hasItems);
          const setNotes = objs => isItems ? hasNotes(objs) : objs;
          const setObject = R.map(doc => doc.toObject());
          const query = Note.find(conditions).select(select);
          return query.populate(params).sort({ updated: sort }).skip(Number(skip)).limit(Number(limit)).exec()
            .then(setObject)
            .then(setNotes);
        }
      case 'job/note':
        {
          const { user, id } = options;
          const conditions = { user, _id: id };
          const params = {
            path: 'items'
          , options: { sort: { bidStopTime: 'desc' }}
          , populate: { path: 'attributes', select: { images: 1 } }
          };
          const query = Note.findOne(conditions);
          return query.populate(params).exec()
            .then(doc => doc.toObject());
        }
      case 'count/items':
        {
          const { user } = options;
          const conditions = { user };
          const setIds = R.map(doc => doc._id);
          const query = Note.find(conditions);
          return query.exec()
            .then(docs => setIds(docs))
            .then(docs =>  Note.aggregate()
              .match({ user, _id: { $in: docs.map(id => ObjectId(id)) } })
              .project({ item_size: { $size: "$items" }})
              .group({ _id: "$_id", counts: { $sum: "$item_size" } })
              .exec());
        }
      case 'count/note':
        {
          const { user } = options;
          const conditions = { user };
          const params = { path: 'items', options: { sort: { bidStopTime: 'desc' }}};
          const query = Note.find(conditions);
          return query.populate(params).sort('updated').countDocuments().exec();
        }
      case 'fetch/notes':
        {
          const { user, category, skip, limit, filter } = options;
          const isCSV      = !R.isNil(filter) && filter.isCSV;
          const isPaginate = !R.isNil(skip) && !R.isNil(limit);
          const isCategory = !R.isNil(category);
          const conditions = isCategory ? { user, category } : { user };
          const params = { 
            path:     'items'
          , options:  { sort: { bidStopTime: 'desc' }, skip: 0, limit: 20 }
          , populate: [
              { path: 'added',   select: 'added'   }
            , { path: 'deleted', select: 'deleted' }
            , { path: 'readed',  select: 'readed'  }
            , { path: 'starred', select: 'starred' }
            , { path: 'listed',  select: 'listed'  }
            ]
          };
          const query = Note.find(conditions);
          if(!isCSV) query.populate(params);
          if(isPaginate) query.skip(Number(skip)).limit(Number(limit)).sort('-updated');
          return query.exec();
        }
      case 'count/item':
      case 'fetch/note':
        {
          const { user, id, skip, limit, filter } = options;
          const isPaginate = !R.isNil(skip) && !R.isNil(limit);
          const isCount = request === 'count/item';
          const conditions = { user, _id: id };
          const query = Note.findOne(conditions);
          let match = null;
          let sold = 0;
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
              match = { bidStopTime: { $gte: start, $lt: stop } };
            } else if(filter.allAuction) {
              match = null;
            } else if(filter.lastMonthAuction) {
              match = { bidStopTime: { $gte: lastMonth, $lt: today } };
            } else if(filter.twoWeeksAuction) {
              match = { bidStopTime: { $gte: twoWeeks, $lt: today } };
            } else if(filter.lastWeekAuction) {
              match = { bidStopTime: { $gte: lastWeek, $lt: today } };
            }
            if(filter.sold) {
              sold  = Number(filter.sold);
            }
          }

          let params = { 
            path: 'items'
          , options: { sort: { bidStopTime: 'desc' } }
          , populate: [
              { path: 'added',      select: 'added'   }
            , { path: 'deleted',    select: 'deleted' }
            , { path: 'readed',     select: 'readed'  }
            , { path: 'starred',    select: 'starred' }
            , { path: 'listed',     select: 'listed'  }
            , { path: 'attributes' }
            ]
          };
          if(match) {
            params = R.merge(params, { match });
          }
          const isSold   = obj => !R.isNil(obj.attributes) && !R.isNil(obj.attributes.sold);
          const isArch   = obj => !R.isNil(obj.attributes) && !R.isNil(obj.attributes.archive);
          const hasSold  = R.filter(isSold);
          const hasArch  = R.filter(isArch);
          const setSold  = R.compose(R.length, hasSold);
          const setArch  = R.compose(R.length, hasArch);
          const setCount = doc => isCount
            ? [{ _id: doc._id, counts: R.length(doc.items), sold: setSold(doc.items), archive: setArch(doc.items) }] : doc;
          const sliItems = docs => isPaginate ? R.slice(Number(skip), Number(skip) + Number(limit), docs) : docs;
          const hasItems = R.filter(obj => obj.attributes ? R.lte(sold, obj.attributes.sold) : R.lte(sold, 0));
          const setItems = R.compose(sliItems, hasItems);
          const setNote  = obj => R.merge(obj, { items: setItems(obj.items) });
          return query.populate(params).exec()
            .then(doc => doc.toObject())
            .then(setNote)
            .then(setCount);
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
          let query, conditions, populates, promise;
          if(filter) {
            const start     = new Date(filter.bidStartTime);
            const stop      = new Date(filter.bidStopTime);
            if(filter.inBidding) {
              conditions = { 'bidStopTime': { $gte: start, $lt: stop }};
              promise = Item.find(conditions).populate('bided').exec()
                .then(docs => hasBided(docs))
                .then(docs => setIds(docs))
                .then(docs => {
                  conditions = { user, bided: { $in: docs } };
                  populates = { path: 'items', populate: [{ path: 'bided' }, { path: 'traded' }] } ;
                  query = Bided.find(conditions).populate(populates).sort('-updated');
                  query = isPaginate ? query.skip(Number(skip)).limit(Number(limit)) : query;
                  query = isCount ? query.countDocuments() : query;
                  return query.exec();
                });
            } else if(filter.allTrading) {
              conditions = { user };
              populates = { path: 'items', populate: [{ path: 'bided' }, { path: 'traded' }] };
              query = Bided.find(conditions).populate('items').sort('-updated');
              query = isPaginate ? query.skip(Number(skip)).limit(Number(limit)) : query;
              query = isCount ? query.countDocuments() : query;
              promise = query.exec();
            } else if(filter.endTrading) {
              conditions = {};
              promise = Item.find(conditions).populate('traded').exec()
                .then(docs => hasTraded(docs))
                .then(docs => setIds(docs))
                .then(docs => {
                  conditions = { user, traded: { $in: docs } };
                  populates = { path: 'items', populate: [{ path: 'traded' }, { path: 'traded' }] };
                  query = Traded.find(conditions).populate(populates).sort('-updated')
                  query = isPaginate ? query.skip(Number(skip)).limit(Number(limit)) : query;
                  query = isCount ? query.countDocuments() : query;
                  return query.exec();
                });
            }
          } else {
            conditions = { user };
            populates = { path: 'items', populate: [{ path: 'bided' }, { path: 'traded' }] };
            query = Bided.find(conditions).populate(populates).sort('-updated');
            query = isPaginate ? query.skip(Number(skip)).limit(Number(limit)) : query;
            query = isCount ? query.countDocuments() : query;
            promise = query.exec();
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
          let query, conditions, populates, promise;
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
              promise = Item.find(conditions).populate('listed').exec()
                .then(docs => hasListed(docs))
                .then(docs => setIds(docs))
                .then(docs => {
                  conditions = { user, listed: { $in: docs } };
                  populates = { path: 'items', populate: [{ path: 'bided' }, { path: 'listed' }] };
                  query = Listed.find(conditions).populate(populates).sort('-updated');
                  query = isPaginate ? query.skip(Number(skip)).limit(Number(limit)) : query;
                  query = isCount ? query.countDocuments() : query;
                  return query.exec();
                });
            } else if(filter.allBidding) {
              conditions = { user };
              populates = { path: 'items', populate: [{ path: 'bided' }, { path: 'listed' }] };
              query = Listed.find(conditions).populate(populates).sort('-updated');
              query = isPaginate ? query.skip(Number(skip)).limit(Number(limit)) : query;
              query = isCount ? query.countDocuments() : query;
              promise = query.exec();
            } else if(filter.endBidding) {
              conditions = { 'bidStopTime': { $gte: yesterday, $lt: today } };
              promise = Item.find(conditions).populate('listed').exec()
                .then(docs => hasListed(docs))
                .then(docs => setIds(docs))
                .then(docs => {
                  conditions = { user, listed: { $in: docs } };
                  populates = { path: 'items', populate: [{ path: 'bided' }, { path: 'listed' }] };
                  query = Listed.find(conditions).populate(populates).sort('-updated');
                  query = isPaginate ? query.skip(Number(skip)).limit(Number(limit)) : query;
                  query = isCount ? query.countDocuments() : query;
                  return query.exec();
                });
            }
          } else {
            conditions = { user };
            populates = { path: 'items', populate: [{ path: 'bided' }, { path: 'listed' }] };
            query = Listed.find(conditions).populate(populates).sort('-updated');
            query = isPaginate ? query.skip(Number(skip)).limit(Number(limit)) : query;
            query = isCount ? query.countDocuments() : query;
            promise = query.exec();
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
          return Item.insertMany(items)
            .then(setNote);
        }
      case 'update/note':
        {
          const { id, user, data } = options;
          const isAsin = data.asin !== '';
          const conditions = { _id: id, user };
          const update = data.items
          ? { updated:      new Date }
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
          const isNotItems  = (obj, items) => R.none(item => obj.guid__ === item.guid__, items);
          const newItems    = objs => R.filter(obj => isNotItems(obj, objs[0]), objs[1].items);
          const isItems     = (obj, items) => R.any(item => obj.guid__ === item.guid__, items);
          const oldItems    = objs => R.filter(obj => isItems(obj, objs[0]), objs[1].items);
          const conItems    = objs => ([R.concat(objs[0], newItems(objs)),  oldItems(objs)]);
          const getItemIds  = objs => ([R.map(obj => obj._id, objs[0]),     R.map(obj => obj._id, objs[1])]);
          const setItemIds  = objs => ([R.merge(update, { items: objs[0] }),  objs[1]]);
          return data.items
            ? Promise.all([
                Item.insertMany(data.items)
              , Note.findOne(conditions, 'items').populate('items').exec()
              ])
              .then(conItems)
              .then(getItemIds)
              .then(setItemIds)
              .then(objs => Promise.all([
                Note.update(conditions, { $set: objs[0] }).exec()
              , Item.remove({ _id: { $in: objs[1] }}).exec()
              ]))
            : Note.update(conditions, { $set: update }).exec();
        }
      case 'delete/note':
        {
          const { id, user } = options;
          const conditions = { _id: id, user };
          const setIds   = R.map(obj => obj._id);
          const setGuids = R.map(obj => obj.guid__);
          const setItems = obj => obj.items;
          const getItems = objs => Item.find({ _id: { $in: setIds(objs) }});
          const delItems = objs => Promise.all([
            Item.remove({       _id: { $in: setIds(objs) }})
          , Listed.remove({     user, listed:  { $in: setGuids(objs) }}).exec()
          , Traded.remove({     user, traded:  { $in: setGuids(objs) }}).exec()
          , Bided.remove({      user, bided:   { $in: setGuids(objs) }}).exec()
          , Added.remove({      user, added:   { $in: setGuids(objs) }}).exec()
          , Deleted.remove({    user, deleted: { $in: setGuids(objs) }}).exec()
          , Readed.remove({     user, readed:  { $in: setGuids(objs) }}).exec()
          , Starred.remove({    user, starred: { $in: setGuids(objs) }}).exec()
          , Attribute.remove({  user, guid:    { $in: setGuids(objs) }}).exec()
          ]);
          return Note.findOneAndDelete(conditions).exec()
            .then(setItems)
            .then(getItems)
            .then(delItems);
        }
      case 'create/category':
        {
          const { user, data } = options;
          const docs = { user, category: data.category, subcategory: data.subcategory, subcategoryId: new ObjectId };
          return Category.create(docs);
        }
      case 'update/category':
        {
          const { id, user, data } = options;
          const { category, subcategory, subcategoryId } = data;
          const conditions = { _id: id, user };
          const update = {
            category:       category
          , subcategory:    subcategory
          , subcategoryId:  ObjectId(subcategoryId)
          };
          return Category.update(conditions, { $set: update }).exec();
        }
      case 'delete/category':
        {
          const { id, user } = options;
          const conditions = { _id: id, user };
          return Category.remove(conditions).exec();
        }
      case 'create/added':
        {
          const { id, user } = options;
          const conditions = { added: id, user };
          const update = { updated: new Date };
          const params = { upsert: true };
          return Added.update(conditions, { $set: update }, params).exec();
        }
      case 'delete/added':
        {
          const { id, user } = options;
          const conditions = { added: id, user };
          return Added.remove(conditions).exec();
        }
      case 'create/deleted':
        {
          const { id, user } = options;
          const conditions = { deleted: id, user };
          const update = { updated: new Date };
          const params = { upsert: true };
          return Deleted.update(conditions, { $set: update }, params).exec();
        }
      case 'delete/deleted':
        {
          const { id, user } = options;
          const conditions = { deleted: id, user };
          return Deleted.remove(conditions).exec();
        }
      case 'create/readed':
        {
          const { id, user } = options;
          const conditions = { readed: id, user };
          const update = { updated: new Date };
          const params = { upsert: true };
          return Readed.update(conditions, { $set: update }, params).exec();
        }
      case 'delete/readed':
        {
          const { id, user } = options;
          const conditions = { readed: id, user };
          return Readed.remove(conditions).exec();
        }
      case 'create/traded':
        {
          const { id, user } = options;
          const conditions = { traded: id, user };
          const update = { updated: new Date };
          const params = { upsert: true };
          return Traded.update(conditions, { $set: update }, params).exec();
        }
      case 'delete/traded':
        {
          const { id, user } = options;
          const conditions = { traded: id, user };
          return Traded.remove(conditions).exec();
        }
      case 'create/bided':
        {
          const { id, user } = options;
          const conditions = { bided: id, user };
          const update = { updated: new Date };
          const params = { upsert: true };
          return Bided.update(conditions, { $set: update }, params).exec();
        }
      case 'delete/bided':
        {
          const { id, user } = options;
          const conditions = { bided: id, user };
          return Bided.remove(conditions).exec();
        }
      case 'create/starred':
        {
          const { id, user } = options;
          const conditions = { starred: id, user };
          const update = { updated: new Date };
          const params = { upsert: true };
          return Starred.update(conditions, { $set: update }, params).exec();
        }
      case 'delete/starred':
        {
          const { id, user } = options;
          const conditions = { starred: id, user };
          return Starred.remove(conditions).exec();
        }
      case 'create/listed':
        {
          const { id, user } = options;
          const conditions = { listed: id, user };
          const update = { updated: new Date };
          const params = { upsert: true };
          return Listed.update(conditions, { $set: update }, params).exec();
        }
      case 'delete/listed':
        {
          const { id, user } = options;
          const conditions = { listed: id, user };
          return Listed.remove(conditions).exec();
        }
      case 'create/attribute':
        {
          const { id, user, data } = options;
          const { sale, sold, market, asins, images, archive } = data;
          const isAsins = !R.isNil(asins);
          const isImages = !R.isNil(images);
          const isArchive = !R.isNil(archive);
          const isPerformance = !R.isNil(sale) && !R.isNil(sold) && !R.isNil(market);
          const conditions = { guid: id, user };
          const update = isAsins
          ? { asins: asins, updated: new Date }
          : isImages
            ? { images: images, updated: new Date }
            : isArchive
              ? { archive: archive, updated: new Date }
              : isPerformance 
                ? { sale: sale, sold: sold, market: market, updated: new Date }
                : null;
          const params = { upsert: true, multi: !!isArchive };
          //log.trace(FeedParser.displayName, 'options', options, { isPerformance, isArchive, isImages, isAsins });
          return update
            ? Attribute.update(conditions, { $set: update }, params).exec()
            : Promise.reject(new Error(`request ${request}.`));
        }
      case 'delete/attribute':
        {
          const { id, user } = options;
          const conditions = { guid: id, user };
          return Attribute.remove(conditions).exec();
        }
      case 'defrag/items':
        {
          const { user, id } = options;
          const conditions = { user, _id: id };
          const setIds = R.map(obj => obj._id);
          return Note.findOne(conditions, 'items').exec()
            .then(obj => Item.find({ _id: { $in: obj.items } }, '_id').exec())
            .then(objs => Note.update(conditions, { $set: { items: setIds(objs) } }).exec())
        }
      case 'defrag/added':
        {
          const { user } = options;
          const hasNotItems = R.filter(obj => R.isNil(obj.items));
          const promises = R.map(obj => Added.remove({ added: obj.added }).exec());
          return Added.find({ user }).populate('items', '_id').exec()
            .then(docs => hasNotItems(docs))
            .then(docs => Promise.all(promises(docs)));
        }
      case 'defrag/deleted':
        {
          const { user } = options;
          const hasNotItems = R.filter(obj => R.isNil(obj.items));
          const promises = R.map(obj => Deleted.remove({ deleted: obj.deleted }).exec());
          return  Deleted.find({ user }).populate('items', '_id').exec()
            .then(docs => hasNotItems(docs))
            .then(docs => Promise.all(promises(docs)));
        }
      case 'defrag/readed':
        { 
          const { user } = options;
          const hasNotItems = R.filter(obj => R.isNil(obj.items));
          const promises = R.map(obj => Readed.remove({ readed: obj.readed }).exec());
          return Readed.find({ user }).populate('items', '_id').exec()
            .then(docs => hasNotItems(docs))
            .then(docs => Promise.all(promises(docs)));
        }
      case 'defrag/starred':
        {
          const { user } = options;
          const hasNotItems = R.filter(obj => R.isNil(obj.items));
          const promises = R.map(obj => Starred.remove({ starred: obj.starred }).exec());
          return Starred.find({ user }).populate('items', '_id').exec()
            .then(docs => hasNotItems(docs))
            .then(docs => Promise.all(promises(docs)));
        }
      case 'defrag/bided':
        { 
          const { user } = options;
          const hasNotItems = R.filter(obj => R.isNil(obj.items));
          const promises = R.map(obj => Bided.remove({ bided: obj.bided }).exec());
          return Bided.find({ user }).populate('items', '_id').exec()
            .then(docs => hasNotItems(docs))
            .then(docs => Promise.all(promises(docs)));
        }
      case 'defrag/traded':
        { 
          const { user } = options;
          const hasNotItems = R.filter(obj => R.isNil(obj.items));
          const promises = R.map(obj => Traded.remove({ traded: obj.traded }).exec());
          return Traded.find({ user }).populate('items', '_id').exec()
            .then(docs => hasNotItems(docs))
            .then(docs => Promise.all(promises(docs)));
        }
      case 'defrag/listed':
        {
          const { user } = options;
          const hasNotItems = R.filter(obj => R.isNil(obj.items));
          const promises = R.map(obj => Listed.remove({ listed: obj.listed }).exec());
          return Listed.find({ user }).populate('items', '_id').exec()
            .then(docs => hasNotItems(docs))
            .then(docs => Promise.all(promises(docs)));
        }
      case 'defrag/attribute':
        {
          const { user } = options;
          const hasNotItems = R.filter(obj => R.isNil(obj.items));
          const promises = R.map(obj => Attribute.remove({ guid: obj.guid }).exec());
          return Attribute.find({ user }).populate('items', '_id').exec()
            .then(docs => hasNotItems(docs))
            .then(docs => Promise.all(promises(docs)));
        }
      default:
        return new Promise((resolve, reject) => reject({ name: 'error', message: 'request: ' + request }));
    }
  }

  getJobNotes(users, categorys, filter, skip, limit, sort) {
    return this.request('job/notes', { users, categorys, filter, skip, limit, sort });
  }

  getJobNote(user, id) {
    return this.request('job/note', { user, id });
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

  addAttribute(user, id, data) {
    return this.request('create/attribute', { user, id, data });
  }

  removeAttribute(user, id) {
    return this.request('delete/attribute', { user, id });
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

  getNotes(user, category, skip, limit, filter) {
    return this.request('fetch/notes', { user, category, skip, limit, filter });
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
  
  cntNote(user) {
    return this.request('count/note', { user });
  }

  cntItems(user) {
    return this.request('count/items', { user });
  }

  cntItem(user, id, filter) { 
    return this.request('count/item', { user, id, filter });
  }

  cntBided(user, skip, limit, filter) {
    return this.request('count/bided', { user, skip, limit, filter });
  }

  cntTraded(user, skip, limit, filter) {
    return this.request('count/traded', { user, skip, limit, filter });
  }

  dfgItems(user, id) {
    return this.request('defrag/items', { user, id });
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

  dfgAttribute(user) {
    return this.request('defrag/attribute', { user });
  }

  garbageCollection({ user, id }) {
    const observables = forkJoin([
      this.dfgItems(user, id)
    , this.dfgAdded(user)
    , this.dfgDeleted(user)
    , this.dfgReaded(user)
    , this.dfgStarred(user)
    , this.dfgListed(user)
    , this.dfgBided(user)
    , this.dfgTraded(user)
    , this.dfgAttribute(user)
    ]);
    return observables;
  }

  fetchCategorys({ user, category, skip, limit }) {
    const observables = forkJoin([
    //  this.getReaded(user)
    //, this.getStarred(user)
      this.getCategorys(user)
    , this.getNotes(user, category, skip, limit)
    ]);
    const setAttribute = objs => R.compose(
      this.setCategorys(objs[0])
    //, this.setStarred(objs[1])
    //  this.setReaded(objs[0])
    , this.toObject
    )(objs[1]);
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
    // 4. utility
    const _setRelease = (category, obj) => R.merge(category, { newRelease: obj });
    const setRelease = R.curry(_setRelease);
    const setNotes = obj => isNotes(notes, obj._id);
    const setCategory = obj => R.compose(setRelease(obj), countNew, isNotReads, setNotes)(obj);
    const setCategorys = R.map(setCategory);
    return setCategorys(categorys);
    //return R.map(obj =>
    //  R.merge(obj, {
    //    newRelease: countNew(
    //      isNotReads(
    //        isNotes(notes, obj._id)))
    //  })
    //, categorys);
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
    // 4. utility
    const _setRelease = (category, obj) => R.merge(category, { newRelease: obj });
    const setRelease = R.curry(_setRelease);
    const setNotes = obj => isNotNotes(notes, obj.category);
    const setCategory = obj => R.compose(setRelease(obj), countNew, isNotReads, setNotes)(obj);
    const setCategorys = R.map(setCategory);
    const categorys = [
      { _id: '9999', category: 'marchant',        subcategory: '未分類' }
    , { _id: '9999', category: 'sellers',         subcategory: '未分類' }
    , { _id: '9999', category: 'closedmarchant',  subcategory: '未分類' }
    , { _id: '9999', category: 'closedsellers',   subcategory: '未分類' }
    ];
    return setCategorys(categorys);
    //return R.map(obj =>
    //  R.merge(obj, {
    //    newRelease: countNew(
    //      isNotReads(
    //        isNotNotes(notes, obj.category)))
    //  }), [
    //    { _id: '9999', category: 'marchant',        subcategory: '未分類' }
    //  , { _id: '9999', category: 'sellers',         subcategory: '未分類' }
    //  , { _id: '9999', category: 'closedmarchant',  subcategory: '未分類' }
    //  , { _id: '9999', category: 'closedsellers',   subcategory: '未分類' }
    //  ]);
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
    // 4. utility
    const _setRelease = (category, obj) => R.merge(category, { newRelease: obj });
    const setRelease = R.curry(_setRelease);
    const setNotes = obj => isStarredNotes(notes, obj.category);
    const setCategory = obj => R.compose(setRelease(obj), countNew, isNotReads, setNotes)(obj);
    const setCategorys = R.map(setCategory);
    const categorys = [
      { _id: '9998', category: 'marchant',        subcategory: 'お気に入り登録' }
    , { _id: '9998', category: 'sellers',         subcategory: 'お気に入り登録' }
    , { _id: '9998', category: 'closedmarchant',  subcategory: 'お気に入り登録' }
    , { _id: '9998', category: 'closedsellers',   subcategory: 'お気に入り登録' }
    ];
    return setCategorys(categorys);
    //return R.map(obj =>
    //  R.merge(obj, {
    //    newRelease: countNew(
    //      isNotReads(
    //        isStarredNotes(notes, obj.category)))
    //  }), [
    //    { _id: '9998', category: 'marchant',        subcategory: 'お気に入り登録' }
    //  , { _id: '9998', category: 'sellers',         subcategory: 'お気に入り登録' }
    //  , { _id: '9998', category: 'closedmarchant',  subcategory: 'お気に入り登録' }
    //  , { _id: '9998', category: 'closedsellers',   subcategory: 'お気に入り登録' }
    //  ]);
  }

  fetchNotes({ user, category, skip, limit }) {
    const observables = forkJoin([
    //  this.getStarred(user)
    //, this.getListed(user)
    //, this.getReaded(user)
    //, this.getDeleted(user)
    //, this.getAdded(user)
      this.cntItems(user, category)
    , this.cntNote(user, category)
    , this.getNotes(user, category, skip, limit)
    ]);
    const setAttribute = objs => R.compose(
      this.setNotePage(skip, limit, objs[1])
    , this.setItemPage(   0,    20, objs[0])
    //, this.setAdded(objs[4])
    //, this.setDeleted(objs[3])
    //, this.setReaded(objs[2])
    //, this.setListed(objs[1])
    //, this.setStarred(objs[0])
    , this.toObject
    )(objs[2]);
    return observables.pipe(
      map(setAttribute)
    );
  }

  fetchJobNotes({ users, categorys, filter, skip, limit, sort }) {
    return from(this.getJobNotes(users, categorys, filter, skip, limit, sort));
  }

  fetchJobNote({ user, id }) {
    return from(this.getJobNote(user, id));
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
    //  this.getStarred(user)
    //, this.getListed(user)
    //, this.getReaded(user)
    //, this.getDeleted(user)
    //, this.getAdded(user)
      this.cntItem(user, id, filter)
    , this.getNote(user, id, skip, limit, filter)
    ]);
    const setAttribute = objs => R.compose(
      this.setItemPage(skip, limit, objs[0])
    //, this.setAdded(objs[4])
    //, this.setDeleted(objs[3])
    //, this.setReaded(objs[2])
    //, this.setListed(objs[1])
    //, this.setStarred(objs[0])
    //, this.toObject
    )([objs[1]]);
    return observables.pipe(
      map(setAttribute)
    , map(R.head)
    //, map(R.tap(console.log))
    );
  }

  fetchCategory({ user, id }) {
    return from(this.getCategory(user, id));
  }

  toObject(objs) {
    const setObj  = obj => obj.toObject();
    const hasObj  = obj => !!obj;
    const setObjs = R.map(setObj);
    const hasObjs = R.filter(hasObj);
    return R.compose(setObjs, hasObjs)(objs);
  }

  setAdded(added) {
    //log.trace('setAdded', added);
    const ids = objs => R.isNil(objs) ? [] : R.map(obj => obj.added, objs);
    const isId = obj => R.contains(obj.guid__, ids(added));
    const setAdd = obj => R.merge(obj, { added: isId(obj) });
    const _setAddItems = obj => R.map(setAdd, obj.items);
    const setAddItems = obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setAddItems(obj) }); 
    const results = objs => R.isNil(objs) ? [] : R.map(setAddItems, objs);
    return results;
  }

  setDeleted(deleted) {
    //log.trace('setDeleted', deleted);
    const ids = objs => R.isNil(objs) ? [] : R.map(obj =>   obj.deleted, objs);
    const isId = obj => R.contains(obj.guid__, ids(deleted));
    const setDelete = obj => R.merge(obj, { deleted: isId(obj) });
    const _setDeleteItems = obj => R.map(setDelete, obj.items);
    const setDeleteItems  = obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setDeleteItems(obj) }); 
    const results = objs => R.isNil(objs) ? [] : R.map(setDeleteItems, objs);
    return results;
  }

  setReaded(readed) {
    //log.trace('setReaded', readed);
    const ids = objs => R.isNil(objs) ? [] : R.map(obj => obj.readed, objs);
    const isId = obj => R.contains(obj.guid__, ids(readed));
    const setRead = obj => R.merge(obj, { readed: isId(obj) });
    const _setReadItems = obj => R.map(setRead, obj.items);
    const setReadItems = obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setReadItems(obj) }); 
    const results = objs => R.isNil(objs) ? [] : R.map(setReadItems, objs);
    return results;
  }

  setListed(listed) {
    //log.trace('setListed', listed);
    const ids = objs => R.isNil(objs) ? [] : R.map(obj => obj.listed, objs);
    const isId = obj => R.contains(obj.guid__, ids(listed));
    const setList = obj => R.merge(obj, { listed: isId(obj) });
    const _setListItems = obj => R.map(setList, obj.items);
    const setListItems = obj => R.isNil(obj.items) ? obj : R.merge(obj, { items: _setListItems(obj) });
    const results = objs => R.isNil(objs) ? [] : R.map(setListItems, objs);
    return results;
  }

  setStarred(starred) {
    //log.trace('setStarred', starred);
    const ids = objs => R.isNil(objs) ? [] : R.map(obj => obj.starred, objs);
    const isId = obj => R.contains(obj.guid__, ids(starred));
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
    const setSold = num => ({ total: num });
    const setArch = num => ({ total: num });
    const setAttributes 
      = obj => ({ item: setItem(obj.counts), page: setPage(obj.counts), sold: setSold(obj.sold), archive: setArch(obj.archive) });
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
    const data = { items: html.items  };
    return this._updateNote({ user, id, data });
  }

  //updateRss({ user, id, rss }) {
  //  const data = { items: rss.items  };
  //  return this._updateNote({ user, id, data });
  //}

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

  createAttribute({ user, id, data }) {
    return from(this.addAttribute(user, id, data));
  }

  deleteAttribute({ user, id }) {
    return from(this.removeAttribute(user, id));
  }

  uploadNotes({ user, category, subcategory, file }) {
    const setNote = objs => this.createNotes({ user, category, categoryIds: [objs[0]._id], notes: objs[1] });
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
      const data = file.toString();
      parseString(data, { trim: true, explicitArray: true, attrkey: 'attr', charkey: '_' }, (err, res) => {
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
          , htmlUrl: obj.attr.htmlUrl }}]
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
        , updated: std.formatDate(new Date(), 'YYYY/MM/DD hh:mm:ss') });
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
      const data = file.toString();
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
      const toCutRec = R.filter(objs => R.length(objs) !== 0 && objs[0] !== '');
      const setUrl   = (category, array) => {
        const string = R.length(array) === 1 ? array[0] : array[1];
        let result;
        if(string.match(/^(https?|ftp)(:\/\/[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+)$/)) {
          result = string;
        } else if(category === 'closedmarchant') {
          result = baseurl + '/closedsearch/closedsearch?' + std.urlencode({ p: string });
        } else if(category === 'closedsellers') {
          result = baseurl + '/jp/show/rating?' + std.urlencode({ userID: string, role: 'seller' });
        } else if(category === 'sellers') {
          result = baseurl + '/seller/' + string;
        } else if(category === 'marchant') {
          result = baseurl + '/search/search?' + std.urlencode({ p: string });
        }
        return result;
      }
      const setNotes = R.map(array => ({
        user
      , category
      , title:        array[0]
      , url:          setUrl(category, array)
      , asin:         array[2]
      , price:        array[3]
      , bidsprice:    array[4]
      , body:         array[5]
      , updated:      std.formatDate(new Date(), 'YYYY/MM/DD hh:mm:ss') }));
      resolve(R.compose(
        setNotes
      , toCutRec
      , toMBConv
      , forkJoin
      , toColumn
      , toTailes
      , toRcords
      )(data));
    });
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

  setCsvNotes(category) {
    let map, keys;
    switch(category) {
      case 'marchant':
      case 'closedmarchant':
        keys = ['title', 'url', 'asin', 'price', 'bidsprice', 'memo'];
        map = R.map(obj => ({
          title:     obj.title
        , url:       obj.url
        , asin:      obj.asin
        , price:     obj.price
        , bidsprice: obj.bidsprice
        , memo:      obj.body
        }));
        break;
      case 'sellers':
      case 'closedsellers':
        keys = ['title', 'url'];
        map = R.map(obj => ({
          title:     obj.title
        , url:       obj.url
        }));
        break;
    }
    return { keys, map };
  }

  setCsvItems(type) {
    const setAsins = R.join(':');
    const setAsin = (asin, idx) => asin[idx-1] ? asin[idx-1] : '-';
    const setImage = (img, idx) => img[idx-1] ? img[idx-1] : '-';
    let map, keys;
    switch(type) {
      case '0001':
        keys = [ 'auid', 'title', 'categorys', 'price', 'ship_price', 'buynow', 'ship_buynow', 'condition', 'bids', 'countdown'
        , 'seller', 'link'
        , 'image1', 'image2', 'image3', 'image4', 'image5', 'image6', 'image7', 'image8', 'image9',  'image10'
        , 'offers', 'market', 'sale', 'sold', 'categoryid', 'explanation', 'payment', 'shipping', 'asins', 'date'];
        map = R.map(obj => ({
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
        , market:       obj.attributes ? obj.attributes.market : '-'
        , sale:         obj.attributes ? obj.attributes.sale : '-'
        , sold:         obj.attributes ? obj.attributes.sold : '-'
        , categoryid:   obj.item_categoryid
        , explanation:  obj.explanation
        , payment:      obj.payment
        , shipping:     obj.shipping
        , ship_price:   obj.ship_price
        , ship_buynow:  obj.ship_buynow
        , asins:        obj.attributes ? setAsins(obj.attributes.asins) : '-'
        , date:         obj.pubDate
        }));
        break;
      case '0002':
        keys = [
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
        map = R.map(obj => ({
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
        break;
      case '0003':
        keys = [ 'asin', 'title', 'brand', 'category', 'description', 'word_count', 'rating', 'review', 'list_price', 'price'
        , 'discount', 'commision', 'sales_rank', 'available', 'thumbnail', 'product_url', 'fullfilled', 'ship_price', 'total_price'
        , 'parent_asin', 'child_asin', 'upc', 'ean', 'prime', 'affiliate_link'
        , 'image1', 'image2', 'image3', 'image4', 'image5', 'image6', 'image7', 'image8', 'image9', 'image10'];
        map = R.map(obj => ({
          asin:           obj.attributes ? setAsin(obj.attributes.asins) : '-'
        , title:          obj.title
        , brand:          '-'
        , category:       obj.item_categoryid
        , description:    obj.explanation
        , word_count:     '-'
        , rating:         '-'
        , review:         '-'
        , list_price:     '-'
        , price:          obj.price
        , discount:       '-'
        , commision:      '-'
        , sales_rank:     '-'
        , available:      '-'
        , thumbnail:      '-'
        , product_url:    '-'
        , fullfilled:     '-'
        , ship_price:     '-'
        , total_price:    '-'
        , parent_asin:    '-'
        , child_asin:     '-'
        , upc:            '-'
        , ean:            '-'
        , prime:          '-'
        , affiliate_link: '-'
        , image1:         setImage(obj.images, 1)
        , image2:         setImage(obj.images, 2)
        , image3:         setImage(obj.images, 3)
        , image4:         setImage(obj.images, 4)
        , image5:         setImage(obj.images, 5)
        , image6:         setImage(obj.images, 6)
        , image7:         setImage(obj.images, 7)
        , image8:         setImage(obj.images, 8)
        , image9:         setImage(obj.images, 9)
        , image10:        setImage(obj.images, 10)
        }));
        break;
    }
    return { keys, map };
  }

  downloadNotes({ user, category }) {
    const CSV = this.setCsvNotes(category);
    const setBuffer = csv  => Buffer.from(csv, 'utf8');
    const setNotesCsv = objs => js2Csv.of({ csv: objs, keys: CSV.keys }).parse();
    const filter = { isCSV: true };
    const observable = from(this.getNotes(user, category, null, null, filter));
    return observable.pipe(
      map(CSV.map)
    , map(setNotesCsv)
    , map(setBuffer)
    );
  }
  
  downloadItems({ user, ids, filter, type }) {
    log.trace(FeedParser.displayName, 'downloadItems', { user, ids, filter, type });
    const CSV = this.setCsvItems(type);
    const setBuffer = csv  => Buffer.from(csv, 'utf8');
    const setItemsCsv = objs => js2Csv.of({ csv: objs, keys: CSV.keys }).parse();
    const setItems = obj => obj.items ? obj.items : [];
    const dupItems = objs => std.dupObj(objs, 'title');
    const observables = R.map(id => this.fetchNote({ user, id, filter }));
    return forkJoin(observables(ids)).pipe(
      map(R.map(setItems))
    , map(R.map(CSV.map))
    , map(R.flatten)
    , map(dupItems)
    , map(setItemsCsv)
    , map(setBuffer)
    );
  }

  downloadTrade({ user, filter }) {
    const CSV = this.setCsvItems('0001');
    const setBuffer = csv  => Buffer.from(csv, 'utf8');
    const setItemsCsv = objs => js2Csv.of({ csv: objs, keys: CSV.keys }).parse();
    const getItems    = obj => obj.items ? obj.items : [];
    const dupItems    = objs => std.dupObj(objs, 'title');
    return this.fetchTradedNotes({ user, filter }).pipe(
      map(R.map(getItems))
    , map(R.map(CSV.map))
    , map(R.flatten)
    , map(dupItems)
    , map(setItemsCsv)
    , map(setBuffer)
    );
  }
  
  downloadBids({ user, filter }) {
    const CSV = this.setCsvItems('0001');
    const setBuffer = csv  => Buffer.from(csv, 'utf8');
    const setItemsCsv = objs => js2Csv.of({ csv: objs, keys: CSV.keys }).parse();
    const getItems    = obj => obj.items ? obj.items : [];
    const dupItems    = objs => std.dupObj(objs, 'title');
    return this.fetchBidedNotes({ user, filter }).pipe(
      map(R.map(getItems))
    , map(R.map(CSV.map))
    , map(R.flatten)
    , map(dupItems)
    , map(setItemsCsv)
    , map(setBuffer)
    );
  }

  //downloadImages({ user, id, filter }) {
  //  const AWS         = aws.of(aws_keyset);
  //  const getObjects  = objs => AWS.fetchObjects(STORAGE, objs);
  //  const setKey      = (guid, url) => std.crypto_sha256(url, guid, 'hex') + '.img';
  //  const setName     = (guid, url) => guid + '_' + path.basename(std.parse_url(url).pathname);
  //  const setImage    = (guid, urls) => R.map(url => ({ key: setKey(guid, url), name: setName(guid, url) }), urls);
  //  const setImages   = R.map(obj => setImage(obj.guid, obj.images));
  //  const dupItems    = objs => std.dupObj(objs, 'title');
  //  const setItems    = R.map(obj => ({ guid: obj.guid__, title: obj.title, images: obj.images}));
  //  const getItems    = obj => obj.items;
  //  return this.fetchNote({ user, id, filter }).pipe(
  //    map(getItems)
  //  , map(setItems)
  //  , map(dupItems)
  //  , map(setImages)
  //  , map(R.flatten)
  //  , flatMap(objs => from(getObjects(objs)))
  //  );
  //}

  downloadImages({ user, id }) {
    const AWS         = aws.of(aws_keyset);
    const getObject   = obj => AWS.fetchObject(STORAGE, obj);
    const setKey      = (_id, url) => std.crypto_sha256(url, _id, 'hex') + '.zip';
    const setName     = (_id, url) => _id + '_' + path.basename(std.parse_url(url).pathname);
    const setArchives = obj => ({ key: setKey(obj._id.toString(), obj.url), name: setName(obj._id.toString(), obj.url) });
    return this.fetchNote({ user, id }).pipe(
      map(setArchives)
    , flatMap(obj => from(getObject(obj)))
    , map(obj => obj.buffer)
    );
  }

  createArchives({ _id, url, items }) {
    const AWS         = aws.of(aws_keyset);
    const setKey      = (guid, url) => std.crypto_sha256(url, guid, 'hex') + '.img';
    const setName     = (guid, url) => guid + '_' + path.basename(std.parse_url(url).pathname);
    const setImage    = (guid, urls) => R.map(url => ({ key: setKey(guid, url), name: setName(guid, url) }), urls);
    const setImages   = R.map(obj => setImage(obj.guid, obj.images));
    const dupItems    = objs => std.dupObj(objs, 'title');
    const setItems    = R.map(obj => ({ guid: obj.guid__, title: obj.title, images: obj.images}));
    const hasImages   = R.filter(obj => obj.attributes && obj.attributes.images && !R.isEmpty(obj.attributes.images));
    const setGuids    = R.map(obj => obj.guid__);
    const files       = R.compose(R.flatten, setImages, dupItems, setItems, hasImages)(items);
    const guids       = R.compose(setGuids, hasImages)(items);
    const zipkey      = std.crypto_sha256(url, _id.toString(), 'hex') + '.zip';
    const setArchive  = obj => ({ guid__: { $in: guids }, archive: obj.Key }); 
    const observable  = from(AWS.createArchive(STORAGE, { key: zipkey, files }));
    //log.trace(FeedParser.displayName, 'files/guids:', R.length(files), R.length(guids));
    return observable.pipe(
      map(setArchive)
    );
  }
}
FeedParser.displayName = 'FeedParser';
