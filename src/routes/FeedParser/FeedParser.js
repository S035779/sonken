import path                       from 'path';
import dotenv                     from 'dotenv';
import * as R                     from 'ramda';
import { from, forkJoin, defer, throwError, of }  from 'rxjs';
import { map, flatMap, catchError }               from 'rxjs/operators';
import { parseString }            from 'xml2js';
import mongoose                   from 'mongoose';
import encoding                   from 'encoding-japanese';
import { Iconv }                  from 'iconv';
import { Item, Note, Category, Added, Deleted, Readed, Traded, Bided, Starred, Listed, Attribute } from 'Models/feed';
import std                        from 'Utilities/stdutils';
import Amazon                     from 'Routes/Amazon/Amazon';
import Yahoo                      from 'Routes/Yahoo/Yahoo';
import log                        from 'Utilities/logutils';
import js2Csv                     from 'Utilities/js2Csv';
import aws                        from 'Utilities/awsutils';

const config = dotenv.config();
if(config.error) throw config.error();

const NODE_ENV        = process.env.NODE_ENV || 'development';
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
  constructor() {
    this.AWS = aws.of(aws_keyset);
    const _request = R.curry(this.request);
    //this.countNote  = std.memoizeWith(5 * 60 * 1000, _request('count/note'));
    this.countItems = std.memoizeWith(5 * 60 * 1000, _request('count/items'));
    this.countBids  = std.memoizeWith(5 * 60 * 1000, _request('count/bided'));
    this.countTrade = std.memoizeWith(5 * 60 * 1000, _request('count/traded'));
  }

  static of() {
    return new FeedParser();
  }

  request(request, options) {
    //log.debug(FeedParser.displayName, 'Request', request, options);
    console.time(request);
    switch(request) {
      case 'job/notes':
        {
          const { users, categorys, filter, skip, limit, sort } = options;
          const isPaginate      = !R.isNil(skip) && !R.isNil(limit);
          const isItems         = filter && filter.isItems;
          const isImages        = filter && filter.isImages;
          const isNotAsins      = filter && filter.isNotAsins;
          const isNotAttributes = filter && filter.isNotAttributes;
          const isNotImages     = filter && filter.isNotImages;
          const expire          = filter && !R.isNil(filter.expire) ? filter.expire : Date.now();
          const conditions      = isItems
          ? { 
            user:     { $in: users              }
          , category: { $in: categorys          }
          , items:    { $ne: [], $exists: true  }
          , updated:  { $lt: expire             }
          } : {
            user:     { $in: users              }
          , category: { $in: categorys          }
          , updated:  { $lt: expire             }
          };
          const select = { user: 1, category: 1, url: 1 };
          const query = Note.find(conditions).select(select);
          const params = {
            path:     'items'
          , select:   { guid__: 1 }
          , options:  { sort: { bidStopTime: 'desc' } }
          , populate: { path: 'attributes', select: { images: 1, asins: 1 } }
          };
          const hasNotImages      = R.filter(obj => obj.attributes && obj.attributes.images && obj.attributes.images[0]
            && !obj.attributes.images[0].signedlink);
          const hasNotAttributes = R.filter(obj => obj.attributes && obj.attributes.updated < expire);
          const hasNotAsins = R.filter(obj => obj.attributes && obj.attributes.asins && obj.attributes.asins[0]
            && obj.attributes.asins[0].code !== 'ExactMatches');
          const hasImages   = R.filter(obj => obj.attributes && obj.attributes.images)
          const setItem     = obj =>  isImages        ? R.merge(obj, { items: hasImages(obj.items) })         :
                                      isNotAsins      ? R.merge(obj, { items: hasNotAsins(obj.items) })       :
                                      isNotAttributes ? R.merge(obj, { items: hasNotAttributes(obj.items) })  :
                                      isNotImages     ? R.merge(obj, { items: hasNotImages(obj.items) })      : obj;
          const setItems    = R.map(setItem);
          const hasItems    = R.filter(obj => obj.items);
          const hasNotes    = R.compose(setItems, hasItems);
          const setNotes    = objs => isItems ? hasNotes(objs) : objs;
          const setObject   = R.map(doc => doc.toObject());
          if(isPaginate) query.sort({ updated : sort }).skip(Number(skip)).limit(Number(limit));
          const promise = (isItems || isImages  || isNotAsins) ? query.populate(params).exec() : query.exec();
          return promise
            .then(setObject)
            .then(setNotes)
            //.then(R.tap(console.timeEnd.bind(this, request)))
          ;
        }
      case 'job/note':
        {
          const { user, id, skip, limit } = options;
          const conditions = { user, _id: id };
          const isPaginate = !R.isNil(skip) && !R.isNil(limit);
          const query = Note.findOne(conditions);
          const params = isPaginate
          ? {
            path: 'items'
          , options: { skip: Number(skip), limit: Number(limit), sort: { bidStopTime: 'desc' }}
          , populate: { path: 'attributes', select: { images: 1 } }
          } : {
            path: 'items'
          , options: { sort: { bidStopTime: 'desc' }}
          , populate: { path: 'attributes', select: { images: 1 } }
          };
          const setObject = doc => doc.toObject();
          const promise = query.populate(params).exec();
          return promise
            .then(setObject)
            //.then(R.tap(console.timeEnd.bind(this, request)))
          ;
        }
      //case 'count/note':
      //  {
      //    const { user, category } = options;
      //    const conditions = { user, category };
      //    const query = Note.find(conditions);
      //    const promise = query.countDocuments().exec();
      //    return promise;
      //  }
      case 'count/items':
        {
          const { user, category, filter } = options;
          const conditions = { user, category };
          const query = Note.find(conditions, { items: 1 });
          let match = null, sold = 0, isAsin = false;
          if(!R.isNil(filter)) {
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
            if(!R.isNil(filter.inAuction)               && filter.inAuction) {
              match = { bidStopTime: { $gte: start, $lt: stop } };
            } else if(!R.isNil(filter.allAuction)       && filter.allAuction) {
              match = null;
            } else if(!R.isNil(filter.lastMonthAuction) && filter.lastMonthAuction) {
              match = { bidStopTime: { $gte: lastMonth, $lt: today } };
            } else if(!R.isNil(filter.twoWeeksAuction)  && filter.twoWeeksAuction) {
              match = { bidStopTime: { $gte: twoWeeks, $lt: today } };
            } else if(!R.isNil(filter.lastWeekAuction)  && filter.lastWeekAuction) {
              match = { bidStopTime: { $gte: lastWeek, $lt: today } };
            }
            if(!R.isNil(filter.sold)) {
              sold  = Number(filter.sold);
            }
            if(!R.isNil(filter.asinAuction)) { 
              isAsin = filter.asinAuction;
            }
          }
          let params = { 
            path:     'items'
          , select:   { guid__: 1 }
          , populate: { path: 'attributes', select: { sold: 1, 'asins.code': 1, 'asins.asin': 1, 'images.signedlink': 1 } } 
          };
          if(match) params = R.merge(params, { match });
          const isSold   = obj => !R.isNil(obj.attributes) && !R.isNil(obj.attributes.sold);
          const isImgs   = obj => !R.isNil(obj.attributes) && !R.isNil(obj.attributes.images);
          //const isArch   = obj => !R.isNil(obj.attributes) && !R.isNil(obj.attributes.archive);
          const hasSold  = R.filter(isSold);
          const hasImgs  = R.filter(isImgs);
          //const hasArch  = R.filter(isArch);
          const setSold  = R.compose(R.length, hasSold);
          const setImgs  = R.compose(R.length, hasImgs);
          //const setArch  = R.compose(R.length, hasArch);
          const setNoteCounts = docs => R.map(obj => R.merge(obj, { notes: docs.length }), docs);
          const setItemCount = doc => ({ 
            _id:      doc._id
          , items:    R.length(doc.items)
          , sold:     setSold(doc.items)
          , images:   setImgs(doc.items)
          //, archive:  setArch(doc.items)
          });
          const setItemCounts = R.map(setItemCount);
          const setCounts     = R.compose(setNoteCounts, setItemCounts);
          const isSolds       = obj => !R.isNil(obj.attributes) && sold !== 0 ? R.equals(sold, obj.attributes.sold) : R.lte(sold, 0);
          const hasSoldItems  = R.filter(isSolds);
          const isAsins       =
            obj => obj.attributes && obj.attributes.asins && obj.attributes.asins[0] && obj.attributes.asins[0].code === 'ExactMatches';
          const hasAsinItems  = R.filter(obj => isAsin ? isAsins(obj) : true);
          const setItems      = R.compose(hasAsinItems, hasSoldItems);
          const setNote       = obj => R.merge(obj, { items: setItems(obj.items) });
          const setNotes      = R.map(setNote);
          const setObjects    = R.map(doc => doc.toObject());
          const promise       = !R.isNil(filter) ? query.populate(params).exec() : query.exec();
          return promise
            .then(setObjects)
            .then(setNotes)
            .then(setCounts)
            .then(R.tap(console.timeEnd.bind(this, request)))
          ;
        }
      case 'fetch/notes':
        {
          const { user, category, skip, limit, filter } = options;
          const isCSV      = !R.isNil(filter) && filter.isCSV;
          const isProject  = !R.isNil(filter) && filter.select;
          const isPaginate = !R.isNil(skip) && !R.isNil(limit);
          const isCategory = !R.isNil(category);
          const conditions = isCategory ? { user, category } : { user };
          const query = Note.find(conditions);
          let params = { 
            path:     'items'
          , options:  { skip: 0, limit: 20, sort: { bidStopTime: 'desc' } }
          , populate: [
              { path: 'added',   select: 'added'   }
            , { path: 'deleted', select: 'deleted' }
            , { path: 'readed',  select: 'readed'  }
            , { path: 'starred', select: 'starred' }
            , { path: 'listed',  select: 'listed'  }
            , { path: 'attributes'
              , select: { sale: 1, sold: 1, market: 1, 'asins.code': 1, 'asins.asin': 1, 'images.signedlink': 1 } }
            ]
          };
          if(isProject) params = R.merge(params, { select: filter.select });
          //const setItems = R.slice(0, 20);
          //const setNote  = obj => R.merge(obj, { items: setItems(obj.items) });
          //const setNotes = R.map(setNote);
          const setObjects = R.map(doc => doc.toObject());
          if(isPaginate)  query.skip(Number(skip)).limit(Number(limit)).sort('-updated');
          const promise = isCSV ? query.exec() : query.populate(params).exec();
          return promise.then(setObjects)
            //.then(setNotes)
            //.then(R.tap(log.trace.bind(this)))
            .then(R.tap(console.timeEnd.bind(this, request)))
          ;
        }
      case 'fetch/note':
        {
          const { user, id, skip, limit, filter } = options;
          const isCSV      = !R.isNil(filter) && filter.isCSV;
          const isProject  = !R.isNil(filter) && filter.select;
          const isPaginate = !R.isNil(skip) && !R.isNil(limit);
          const conditions = { user, _id: id };
          const query = Note.findOne(conditions);
          let match = null, sold = 0, isAsin = false;
          if(!R.isNil(filter)) {
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
            if(!R.isNil(filter.inAuction)               && filter.inAuction) {
              match = { bidStopTime: { $gte: start, $lt: stop } };
            } else if(!R.isNil(filter.allAuction)       && filter.allAuction) {
              match = null;
            } else if(!R.isNil(filter.lastMonthAuction) && filter.lastMonthAuction) {
              match = { bidStopTime: { $gte: lastMonth, $lt: today } };
            } else if(!R.isNil(filter.twoWeeksAuction)  && filter.twoWeeksAuction) {
              match = { bidStopTime: { $gte: twoWeeks, $lt: today } };
            } else if(!R.isNil(filter.lastWeekAuction)  && filter.lastWeekAuction) {
              match = { bidStopTime: { $gte: lastWeek, $lt: today } };
            }
            if(!R.isNil(filter.sold)) {
              sold  = Number(filter.sold);
            }
            if(!R.isNil(filter.asinAuction)) {
              isAsin = filter.asinAuction;
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
            , { path: 'attributes', select: isCSV
                ? { asins: 1, images: 1, sale: 1, sold: 1, market: 1 }
                : { 'asins.code': 1, 'asins.asin': 1, images: 1, sale: 1, sold: 1, market: 1 }
              }
            ]
          };
          if(match) params = R.merge(params, { match })
          if(isProject) params  = R.merge(params, { select: filter.select });
          const sliItems        = docs => isPaginate ? R.slice(Number(skip), Number(skip) + Number(limit), docs) : docs;
          const isSolds         = obj => !R.isNil(obj.attributes) && sold !== 0 ? R.equals(sold, obj.attributes.sold) : R.lte(sold, 0);
          const hasSoldItems    = R.filter(isSolds);
          const isAsins         =
            obj => obj.attributes && obj.attributes.asins && obj.attributes.asins[0] && obj.attributes.asins[0].code === 'ExactMatches';
          const hasAsinItems    = R.filter(obj => isAsin ? isAsins(obj) : true);
          const setItems        = R.compose(sliItems, hasAsinItems, hasSoldItems);
          const setNote         = obj => R.merge(obj, { items: setItems(obj.items) });
          const setObject       = doc => doc.toObject();
          const promise         = query.populate(params).exec();
          return promise
            .then(setObject)
            .then(setNote)
            .then(R.tap(console.timeEnd.bind(this, request)))
          ;
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
          return promise
          //  .then(R.tap(console.timeEnd.bind(this, request)))
          ;
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
          return promise
          //  .then(R.tap(console.timeEnd.bind(this, request)))
          ;
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
          return Category.find(conditions).exec()
          //  .then(R.tap(console.timeEnd.bind(this, request)))
          ;
        }
      case 'fetch/category':
        {
          const conditions = { _id:  options.id, user: options.user };
          return Category.findOne(conditions).exec()
          //  .then(R.tap(console.timeEnd.bind(this, request)))
          ;
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
          const setNote = R.compose(setIds, getIds);
          return Item.insertMany(items)
            .then(setNote)
            .then(obj => Note.create(obj))
            //.then(R.tap(log.trace.bind(this)))
          ;
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
                Note.updateMany(conditions, { $set: objs[0] }).exec()
              , Item.deleteMany({ _id: { $in: objs[1] }}).exec()
              ]))
            : Note.updateMany(conditions, { $set: update }).exec()
          ;
        }
      case 'delete/note':
        {
          const { id, user } = options;
          const conditions = { _id: id, user };
          const setIds   = R.map(obj => obj._id);
          const setGuids = R.map(obj => obj.guid__);
          const setItems = obj => obj ? obj.items : null;
          const getItems = objs => objs ? Item.find({ _id: { $in: setIds(objs) }}) : null;
          const delItems = objs => objs ? Promise.all([
            Item.deleteMany({ _id: { $in: setIds(objs) }})
          , Listed.deleteMany({ user, listed: { $in: setGuids(objs) }}).exec()
          , Traded.deleteMany({ user, traded: { $in: setGuids(objs) }}).exec()
          , Bided.deleteMany({ user, bided: { $in: setGuids(objs) }}).exec()
          , Added.deleteMany({ user, added: { $in: setGuids(objs) }}).exec()
          , Deleted.deleteMany({ user, deleted: { $in: setGuids(objs) }}).exec()
          , Readed.deleteMany({ user, readed: { $in: setGuids(objs) }}).exec()
          , Starred.deleteMany({ user, starred: { $in: setGuids(objs) }}).exec()
          , Attribute.deleteMany({ user, guid: { $in: setGuids(objs) }}).exec()
          ]) : null;
          return Note.findOneAndDelete(conditions).exec()
            .then(setItems)
            .then(getItems)
            .then(delItems);
        }
      case 'create/category':
        {
          const { user, data } = options;
          const category = {
            user
          , category: data.category
          , subcategory: data.subcategory
          , subcategoryId: new ObjectId
          };
          return Category.create(category);
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
          return Category.updateMany(conditions, { $set: update }).exec();
        }
      case 'delete/category':
        {
          const { id, user } = options;
          const conditions = { _id: id, user };
          return Category.deleteMany(conditions).exec();
        }
      case 'create/added':
        {
          const { id, user } = options;
          const conditions = { added: id, user };
          const update = { updated: new Date };
          const params = { upsert: true };
          return Added.updateMany(conditions, { $set: update }, params).exec();
        }
      case 'delete/added':
        {
          const { id, user } = options;
          const conditions = { added: id, user };
          return Added.deleteMany(conditions).exec();
        }
      case 'create/deleted':
        {
          const { id, user } = options;
          const conditions = { deleted: id, user };
          const update = { updated: new Date };
          const params = { upsert: true };
          return Deleted.updateMany(conditions, { $set: update }, params).exec();
        }
      case 'delete/deleted':
        {
          const { id, user } = options;
          const conditions = { deleted: id, user };
          return Deleted.deleteMany(conditions).exec();
        }
      case 'create/readed':
        {
          const { id, user } = options;
          const conditions = { readed: id, user };
          const update = { updated: new Date };
          const params = { upsert: true };
          return Readed.updateMany(conditions, { $set: update }, params).exec();
        }
      case 'delete/readed':
        {
          const { id, user } = options;
          const conditions = { readed: id, user };
          return Readed.deleteMany(conditions).exec();
        }
      case 'create/traded':
        {
          const { id, user } = options;
          const conditions = { traded: id, user };
          const update = { updated: new Date };
          const params = { upsert: true };
          return Traded.updateMany(conditions, { $set: update }, params).exec();
        }
      case 'delete/traded':
        {
          const { id, user } = options;
          const conditions = { traded: id, user };
          return Traded.deleteMany(conditions).exec();
        }
      case 'create/bided':
        {
          const { id, user } = options;
          const conditions = { bided: id, user };
          const update = { updated: new Date };
          const params = { upsert: true };
          return Bided.updateMany(conditions, { $set: update }, params).exec();
        }
      case 'delete/bided':
        {
          const { id, user } = options;
          const conditions = { bided: id, user };
          return Bided.deleteMany(conditions).exec();
        }
      case 'create/starred':
        {
          const { id, user } = options;
          const conditions = { starred: id, user };
          const update = { updated: new Date };
          const params = { upsert: true };
          return Starred.updateMany(conditions, { $set: update }, params).exec();
        }
      case 'delete/starred':
        {
          const { id, user } = options;
          const conditions = { starred: id, user };
          return Starred.deleteMany(conditions).exec();
        }
      case 'create/listed':
        {
          const { id, user } = options;
          const conditions = { listed: id, user };
          const update = { updated: new Date };
          const params = { upsert: true };
          return Listed.updateMany(conditions, { $set: update }, params).exec();
        }
      case 'delete/listed':
        {
          const { id, user } = options;
          const conditions = { listed: id, user };
          return Listed.deleteMany(conditions).exec();
        }
      case 'create/attribute':
        {
          const { id, user, data } = options;
          const { sale, sold, market, asins, images/*, archive*/ } = data;
          const isAsins = !R.isNil(asins);
          const isImages = !R.isNil(images);
          //const isArchive = !R.isNil(archive);
          const isPerformance = !R.isNil(sale) && !R.isNil(sold) && !R.isNil(market);
          const conditions = { guid: id, user };
          const update = isAsins
          ? { asins: asins, updated: new Date }
          : isImages
            ? { images: images, updated: new Date }
            //: isArchive
              //? { archive: archive, updated: new Date }
              : isPerformance 
                ? { sale: sale, sold: sold, market: market, updated: new Date }
                : null;
          const params = { upsert: true/*, multi: !!isArchive*/ };
          //log.trace(FeedParser.displayName, 'options', options, { isPerformance, isImages, isAsins });
          return update
            ? Attribute.updateMany(conditions, { $set: update }, params).exec()
            : Promise.reject(new Error(`request ${request}.`));
        }
      case 'delete/attribute':
        {
          const { id, user } = options;
          const conditions = { guid: id, user };
          return Attribute.deleteMany(conditions).exec();
        }
      case 'defrag/items':
        {
          const { user, id } = options;
          const conditions = { user, _id: id };
          return Note.findOne(conditions, 'items').exec()
            .then(async obj => {

              const ids   = obj.items;
              const docs  = await Item.find({ _id: { $in: ids } }, '_id').exec();

              const _ids  = R.map(obj => obj._id, docs);
              const cmp   = (id, _id) => id.equals(_id);
              const diff  = R.differenceWith(cmp, ids, _ids);

              if(R.isEmpty(diff)) throw ({ name: 'NoProblem', message: 'Compared successfully.', stack: diff });
              return _ids;
            })
            .then(objs => Note.updateMany(conditions, { $set: { items: objs } }).exec());
        }
      //case 'defrag/added':
      //  {
      //    const { user } = options;
      //    const hasNotItems = R.filter(obj => R.isNil(obj.items));
      //    const promises = R.map(obj => Added.deleteMany({ added: obj.added }).exec());
      //    return Added.find({ user }).populate('items', '_id').exec()
      //      .then(docs => hasNotItems(docs))
      //      .then(docs => Promise.all(promises(docs)));
      //  }
      //case 'defrag/deleted':
      //  {
      //    const { user } = options;
      //    const hasNotItems = R.filter(obj => R.isNil(obj.items));
      //    const promises = R.map(obj => Deleted.deleteMany({ deleted: obj.deleted }).exec());
      //    return  Deleted.find({ user }).populate('items', '_id').exec()
      //      .then(docs => hasNotItems(docs))
      //      .then(docs => Promise.all(promises(docs)));
      //  }
      //case 'defrag/readed':
      //  { 
      //    const { user } = options;
      //    const hasNotItems = R.filter(obj => R.isNil(obj.items));
      //    const promises = R.map(obj => Readed.deleteMany({ readed: obj.readed }).exec());
      //    return Readed.find({ user }).populate('items', '_id').exec()
      //      .then(docs => hasNotItems(docs))
      //      .then(docs => Promise.all(promises(docs)));
      //  }
      //case 'defrag/starred':
      //  {
      //    const { user } = options;
      //    const hasNotItems = R.filter(obj => R.isNil(obj.items));
      //    const promises = R.map(obj => Starred.deleteMany({ starred: obj.starred }).exec());
      //    return Starred.find({ user }).populate('items', '_id').exec()
      //      .then(docs => hasNotItems(docs))
      //      .then(docs => Promise.all(promises(docs)));
      //  }
      //case 'defrag/bided':
      //  { 
      //    const { user } = options;
      //    const hasNotItems = R.filter(obj => R.isNil(obj.items));
      //    const promises = R.map(obj => Bided.deleteMany({ bided: obj.bided }).exec());
      //    return Bided.find({ user }).populate('items', '_id').exec()
      //      .then(docs => hasNotItems(docs))
      //      .then(docs => Promise.all(promises(docs)));
      //  }
      //case 'defrag/traded':
      //  { 
      //    const { user } = options;
      //    const hasNotItems = R.filter(obj => R.isNil(obj.items));
      //    const promises = R.map(obj => Traded.deleteMany({ traded: obj.traded }).exec());
      //    return Traded.find({ user }).populate('items', '_id').exec()
      //      .then(docs => hasNotItems(docs))
      //      .then(docs => Promise.all(promises(docs)));
      //  }
      //case 'defrag/listed':
      //  {
      //    const { user } = options;
      //    const hasNotItems = R.filter(obj => R.isNil(obj.items));
      //    const promises = R.map(obj => Listed.deleteMany({ listed: obj.listed }).exec());
      //    return Listed.find({ user }).populate('items', '_id').exec()
      //      .then(docs => hasNotItems(docs))
      //      .then(docs => Promise.all(promises(docs)));
      //  }
      //case 'defrag/attribute':
      //  {
      //    const { user } = options;
      //    const hasNotItems = R.filter(obj => R.isNil(obj.items));
      //    const promises = R.map(obj => Attribute.deleteMany({ guid: obj.guid }).exec());
      //    return Attribute.find({ user }).populate('items', '_id').exec()
      //      .then(docs => hasNotItems(docs))
      //      .then(docs => Promise.all(promises(docs)));
      //  }
      default:
        return new Promise((resolve, reject) => reject({ name: 'error', message: 'request: ' + request }));
    }
  }

  getJobNotes(users, categorys, filter, skip, limit, sort) {
    return this.request('job/notes', { users, categorys, filter, skip, limit, sort });
  }

  getJobNote(user, id, skip, limit) {
    return this.request('job/note', { user, id, skip, limit });
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
  
  //cntNote(user, category) {
  //  return this.countNote({ user, category });
  //}

  cntItems(user, category, filter) {
    //return this.request('count/items', { user, category, filter });
    const result = this.countItems.memoize({ user, category, filter });
    this.countItems.clean();
    return result;
  }

  cntItem(user, category, id, filter) {
    //return this.request('count/items', { user, category, id, filter });
    const result = this.countItems.memoize({ user, category, id, filter });
    this.countItems.clean();
    return result;
  }

  cntBided(user, skip, limit, filter) {
    //return this.request('count/bided', { user, skip, limit, filter });
    const result = this.countBids.memoize({ user, skip, limit, filter });
    this.countBids.clean();
    return result;
  }

  cntTraded(user, skip, limit, filter) {
    //return this.request('count/traded', { user, skip, limit, filter });
    const result = this.countTrade.memoize({ user, skip, limit, filter });
    this.countTrade.clean();
    return result;
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
    return from(this.dfgItems(user, id));
      //.pipe(
      //  flatMap(() => this.dfgAdded(user)    )
      //, flatMap(() => this.dfgDeleted(user)  )
      //, flatMap(() => this.dfgReaded(user)   )
      //, flatMap(() => this.dfgStarred(user)  )
      //, flatMap(() => this.dfgListed(user)   )
      //, flatMap(() => this.dfgBided(user)    )
      //, flatMap(() => this.dfgTraded(user)   )
      //, flatMap(() => this.dfgAttribute(user))
      //)
  }

  //fetchCategorys({ user, category, skip, limit }) {
  //  const filter = { select: { guid__: 1 } };
  //  const observables = forkJoin([
  //  //  this.getReaded(user)
  //  //, this.getStarred(user)
  //    this.getCategorys(user)
  //  , this.getNotes(user, category, skip, limit, filter)
  //  ]);
  //  const setAttribute = objs => R.compose(
  //    this.setCategorys(objs[0])
  //  //, this.setStarred(objs[1])
  //  //  this.setReaded(objs[0])
  //  //, this.toObject
  //  )(objs[1]);
  //  return observables.pipe(
  //    map(setAttribute)
  //  );
  //}

  setCategorys(categorys) {
    const _categorys = this.toObject(categorys);
    const _hasCategorys = R.curry(this.hasCategorys)(_categorys);
    const _hasNotCategorys = this.hasNotCategorys;
    const _hasFavorites = this.hasFavorites;
    const __categorys = objs => R.concat(_hasCategorys(objs), _hasNotCategorys(objs));
    return objs => R.isNil(objs) 
      ? { notes: [],    categorys: _categorys } 
      : { notes: objs,  categorys: R.concat(__categorys(objs), _hasFavorites(objs)) };
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

  fetchNotes({ user, category, skip, limit, filter }) {
    const project = { select:   { title: 1, guid__: 1, pubDate: 1, price: 1, bids: 1, bidStopTime: 1, seller: 1, description: 1 } };
    const _filter = R.merge(filter, project);
    const observables = forkJoin([
    //  this.getStarred(user)
    //, this.getListed(user)
    //, this.getReaded(user)
    //, this.getDeleted(user)
    //, this.getAdded(user)
      this.cntItems(user, category, _filter)
    //, this.cntNote(user, category)
    , this.getCategorys(user)
    , this.getNotes(user, category, skip, limit, _filter)
    ]);
    const setAttribute = objs => R.compose(
      this.setCategorys(objs[1])
    , this.setNotePage(skip, limit, objs[0])
    , this.setItemPage(   0,    20, objs[0])
    //, this.setAdded(objs[4])
    //, this.setDeleted(objs[3])
    //, this.setReaded(objs[2])
    //, this.setListed(objs[1])
    //, this.setStarred(objs[0])
    //, this.toObject
    )(objs[2]);
    return observables.pipe(
      map(setAttribute)
    //, map(R.tap(log.trace.bind(this)))
    );
  }

  fetchJobNotes({ users, categorys, filter, skip, limit, sort, profiles }) {
    const hasProfile = obj => R.find(profile => profile.user === obj.user)(profiles); 
    const setProfile = obj => profiles ? R.merge({ profile: hasProfile(obj) }, obj) : obj;
    const setProfiles = R.map(setProfile);
    return from(this.getJobNotes(users, categorys, filter, skip, limit, sort)).pipe(
        map(setProfiles)
      );
  }

  fetchJobNote({ user, id, skip, limit }) {
    return from(this.getJobNote(user, id, skip, limit));
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

  fetchNote({ user, category, id, skip, limit, filter }) {
    const project = { select: { title: 1, guid__: 1, pubDate: 1, price: 1, bids: 1, bidStopTime: 1, seller: 1, description: 1 } };
    const _filter = R.merge(filter, project);
    const promise = R.isNil(filter) ? this.cntItems(user, category, _filter) : this.cntItem(user, category, id, _filter);
    const observables = forkJoin([
    //  this.getStarred(user)
    //, this.getListed(user)
    //, this.getReaded(user)
    //, this.getDeleted(user)
    //, this.getAdded(user)
      promise
    , this.getNote(user, id, skip, limit, _filter)
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
    //, map(R.tap(log.trace.bind(this)))
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
    const itemSkip  = Number(skip);
    const itemLimit = Number(limit);

    const inCounts = num => R.gt(num, itemSkip + itemLimit);

    const setPage = num => ({
      total: Math.ceil(num / itemLimit)
    , count: inCounts(num) ? Math.ceil((itemSkip + itemLimit) / itemLimit) : Math.ceil(num / itemLimit) 
    });
    const setItem = num => ({
      total: num
    , count: inCounts(num) ? itemSkip + itemLimit : num
    });
    const setItems = R.compose(
      num => ({ total: num })
    , R.sum
    , R.map(obj => obj.items)
    );

    const setItemCount = obj => ({ 
      page:   setPage(obj.items)
    , item:   setItem(obj.items)
    , items:  setItems(counts)
    });
    const setPerfCount = obj => ({ 
      sold:   { total: obj.sold }
    , images: { total: obj.images }
    /*, archive: { total: obj.archive }*/
    });

    const setAttributes = obj => obj && (!R.isNil(obj.sold) || !R.isNil(obj.images)/*|| !R.isNil(obj.archive) */)
      ? R.merge(setItemCount(obj), setPerfCount(obj))
      : (obj ? setItemCount(obj) : {});

    const _counts = id => R.find(obj => id.equals(obj._id))(counts);
    const setCounts = obj => R.merge(obj, { item_attributes: setAttributes(_counts(obj._id)) });

    return objs => R.isNil(objs) || R.isEmpty(counts) ? [] : R.map(setCounts, objs);
  }

  setNotePage(skip, limit, counts) {
  //  //log.trace(FeedParser.displayName, 'setNotePage', counts);
    const noteSkip  = Number(skip);
    const noteLimit = Number(limit);

    const inCounts = num => R.gt(num, noteSkip + noteLimit);

    const setPage = num => ({
      total: Math.ceil(num / noteLimit)
    , count: inCounts(num) ? Math.ceil((noteSkip + noteLimit) / noteLimit) : Math.ceil(num / noteLimit)
    });
    const setNote = num => ({
      total: num
    , count: inCounts(num) ? noteSkip + noteLimit : num
    });

    const setNoteCount = obj => ({ 
      page:   setPage(obj.notes)
    , note:   setNote(obj.notes)
    });
    
    const setAttributes = obj => obj && !R.isNil(obj.notes)
      ? setNoteCount(obj)
      : {};

    const _counts = id => R.find(obj => id.equals(obj._id))(counts);
    const setCounts = obj => R.merge(obj, { note_attributes: setAttributes(_counts(obj._id)) });

    return objs => R.isNil(objs) || R.isEmpty(counts) ? [] : R.map(setCounts, objs);
  }

  setAttributes(skip, limit, counts) {
    //log.trace(FeedParser.displayName, 'setAttributes', counts);
    const inCounts = R.gt(counts, Number(skip) + Number(limit));
    const item = { total: counts, count: inCounts ? Number(skip) + Number(limit) : counts };
    const page = { total: Math.ceil(counts / Number(limit)), count: inCounts
      ? Math.ceil((Number(skip) + Number(limit)) / Number(limit)) : Math.ceil(counts / Number(limit)) };
    const setItems = R.map(obj => obj.items);
    const setNotes = objs => ([{ items_attributes: { item, page }, items: setItems(objs) }]);
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
    return observable.pipe(
      map(obj => this.setNote({ user, url, category, categoryIds, title }, obj))
    , flatMap(obj => from(this.addNote(user, obj)))
    );
  }

  updateNote({ user, category, id, data }) {
    const isAsin = data.asin !== '';
    const setAmazonData = obj => obj
      ? R.merge(data, {
          name:       obj.ItemAttributes.Title
        , AmazonUrl:  obj.DetailPageURL
        , AmazonImg:  obj.MediumImage ? obj.MediumImage.URL : ''
      })
      : R.merge(data, { name: '', AmazonUrl: '', AmazonImg: '' });
    return isAsin
      ? Amazon.of(amz_keyset).fetchItemLookup(data.asin, 'ASIN').pipe(
          map(setAmazonData)
        , flatMap(obj => this._updateNote({ user, id, data: obj }))
        , flatMap(() => this.fetchNote({ user, category, id }))
        )
      : this._updateNote({ user, id, data }).pipe(
          flatMap(() => this.fetchNote({ user, category, id }))
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
    , map(R.map(obj => obj.guid__))
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
    const { images } = data;
    const setKey    = urls => this.setImagesKey(id, urls);
    const setUrls   = R.map(obj => obj.url);
    const setFiles  = R.compose(setKey, setUrls);
    const zipLinks  = R.zip(images)
    const mrgLinks  = R.map(R.mergeAll);
    const setLinks  = R.map(obj => ({ signedlink: obj.url }));
    const setImages = objs => ({ images: objs });
    const getLinks  = R.compose(setImages, mrgLinks, zipLinks, setLinks);
    return defer(() => !R.isNil(images) 
      ? from(this.AWS.fetchSignedUrls(STORAGE, setFiles(images))).pipe(map(getLinks), flatMap(obj => this.addAttribute(user, id, obj)))
      : from(this.addAttribute(user, id, data))
    );
  }

  deleteAttribute({ user, id }) {
    return from(this.removeAttribute(user, id));
  }

  uploadNotes({ user, category, subcategory, file }) {
    let observable;
    switch(file.type) {
      case 'application/vnd.ms-excel':
      case 'text/csv':
      case 'csv':
        observable = forkJoin([ this.addCategory(user, { category, subcategory }), this.setCsvToObj(user, category, file.content) ]);
        break;
      case 'opml':
        observable = forkJoin([ this.addCategory(user, { category, subcategory }), this.setOmplToObj(user, category, file.content) ]);
        break;
    }
    return observable.pipe(
      flatMap(objs => R.length(objs[1]) <= 1000 
        ? this.createNotes({ user, category, categoryIds: [objs[0]._id], notes: objs[1] })
        : throwError({ name: 'Throttle Error:', message: 'The maximum number of notes has been exceeded.' }))
      , catchError(err => { 
        if(err) log.warn(FeedParser.displayName, err.name, err.message, err.stack);
        return of(null);
      }));
  }
  
  createNotes({ user, category, categoryIds, notes }) {
    const setNote = obj => this.setNote({ user, category, categoryIds, title: obj.title , url: obj.url });
    const setNotes = R.map(setNote);
    const promises = R.map(obj => this.addNote(user, obj));
    return forkJoin(promises(setNotes(notes))).pipe(
      flatMap(() => this.fetchNotes({ user, category, skip: 0, limit: 20 }))
    );
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
      //const toTailes = R.tail;
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
      //, toTailes
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
    const urlpath   = NODE_ENV !== 'staging';
    const setName   = (guid, url) => urlpath ? url : guid + '_' + path.basename(std.parse_url(url).pathname);
    const setImage  = (guid, img, idx) => img[idx-1] ? setName(guid, img[idx-1]) : '-';
    const setAsin   = obj => obj.asin;
    const isAsins   = obj => 
      obj.attributes && obj.attributes.asins && obj.attributes.asins[0] && obj.attributes.asins[0].code === 'ExactMatches';
    const isOffers  = obj => obj.attributes.asins[0].offers && Number(obj.attributes.asins[0].offers.TotalOffers) !== 0; 
    const isOffer   = obj => Number(obj.offers.TotalOffers) === 1;
    const hasOffer  = 
      obj => R.find(offer => obj.offerSummary.LowestNewPrice.Amount === offer.OfferListing.Price.Amount)(obj.offers.Offer);
    const setMerchant           = obj => obj.Merchant ? obj.Merchant.Name : '-';
    const setMerchants          = 
      obj => isOffer(obj) ? setMerchant(obj.offers.Offer)          : R.compose(setMerchant, hasOffer)(obj);
    const isPrime               = obj => Number(obj.OfferListing.IsEligibleForPrime) === 1 ? '有' : '無';
    const isPrimes              = 
      obj => isOffer(obj) ? isPrime(obj.offers.Offer)              : R.compose(isPrime, hasOffer)(obj);
    const isSuperSaverShipping  = obj => Number(obj.OfferListing.IsEligibleForSuperSaverShipping) === 1 ? '有' : '無';
    const isSuperSaverShippings = 
      obj => isOffer(obj) ? isSuperSaverShipping(obj.offers.Offer) : R.compose(isSuperSaverShipping, hasOffer)(obj);
    const setAvailabirity       = obj => obj.OfferListing.Availability ? obj.OfferListing.Availability : '発売未定';
    const setAvailabiritys      = 
      obj => isOffer(obj) ? setAvailabirity(obj.offers.Offer)      : R.compose(setAvailabirity, hasOffer)(obj);
    const setPurchasePrice      = obj => obj.OfferListing.Price ? obj.OfferListing.Price.FormattedPrice : '-';
    const setPurchasePrices     = 
      obj => isOffer(obj) ? setPurchasePrice(obj.offers.Offer)     : R.compose(setPurchasePrice, hasOffer)(obj);
    let map, keys;
    switch(type) {
      case '0001':
        keys = [
          'auid'
        , 'title'
        , 'categorys'
        , 'price'
        , 'ship_price'
        , 'buynow'
        , 'ship_buynow'
        , 'condition'
        , 'bids'
        , 'countdown'
        , 'seller'
        , 'image1', 'image2', 'image3', 'image4', 'image5', 'image6', 'image7', 'image8', 'image9',  'image10'
        , 'link'
        , 'asin'
        , 'merchant'
        , 'isPrime'
        , 'isSuperSaverShipping'
        , 'availability'
        , 'purchasePrice'
        , 'date'
        //, 'offers'
        //, 'market'
        //, 'sale'
        //, 'sold'
        //, 'categoryid'
        //, 'explanation'
        //, 'payment'
        //, 'shipping'
        ];
        map = R.map(obj => ({
          auid:         obj.guid__
        , title:        obj.title
        , categorys:    obj.item_categorys
        , price:        obj.price
        , ship_price:   obj.ship_price
        , buynow:       obj.buynow
        , ship_buynow:  obj.ship_buynow
        , condition:    obj.item_condition
        , bids:         obj.bids
        , countdown:    obj.countdown
        , seller:       obj.seller
        , image1:       setImage(obj.guid__, obj.images, 1)
        , image2:       setImage(obj.guid__, obj.images, 2)
        , image3:       setImage(obj.guid__, obj.images, 3)
        , image4:       setImage(obj.guid__, obj.images, 4)
        , image5:       setImage(obj.guid__, obj.images, 5)
        , image6:       setImage(obj.guid__, obj.images, 6)
        , image7:       setImage(obj.guid__, obj.images, 7)
        , image8:       setImage(obj.guid__, obj.images, 8)
        , image9:       setImage(obj.guid__, obj.images, 9)
        , image10:      setImage(obj.guid__, obj.images, 10)
        , link:         obj.link
        , asin:                 isAsins(obj) ? setAsin(obj.attributes.asins[0]) : '-'
        , merchant:             isAsins(obj) && isOffers(obj) ? setMerchants(obj.attributes.asins[0]) : '-'
        , isPrime:              isAsins(obj) && isOffers(obj) ? isPrimes(obj.attributes.asins[0]) : '-'
        , isSuperSaverShipping: isAsins(obj) && isOffers(obj) ? isSuperSaverShippings(obj.attributes.asins[0]) : '-'
        , availability:         isAsins(obj) && isOffers(obj) ? setAvailabiritys(obj.attributes.asins[0]) : '-'
        , purchasePrice:        isAsins(obj) && isOffers(obj) ? setPurchasePrices(obj.attributes.asins[0]) : '-'
        , date:         obj.pubDate
        //, offers:       obj.offers
        //, market:       obj.attributes ? obj.attributes.market : '-'
        //, sale:         obj.attributes ? obj.attributes.sale : '-'
        //, sold:         obj.attributes ? obj.attributes.sold : '-'
        //, categoryid:   obj.item_categoryid
        //, explanation:  obj.explanation
        //, payment:      obj.payment
        //, shipping:     obj.shipping
        }));
        break;
      case '0002': // Format A
        keys = [
          'filename'
        , 'category_id'
        , 'title'
        , 'input_method_of_description'
        , 'description'
        , 'image1'
        , 'image2'
        , 'image3'
        , 'coment1'
        , 'coment2'
        , 'coment3'
        , 'number'
        , 'start_price'
        , 'buynow_price'
        , 'negotiation'
        , 'duration'
        , 'end_time'
        , 'auto_re_sale'
        , 'auto_price_cut'
        , 'auto_extension'
        , 'early_termination'
        , 'bidder_limit'
        , 'bad_evaluation'
        , 'identification'
        , 'condition'
        , 'remarks_on_condition'
        , 'returns'
        , 'remarks_on_returns'
        , 'yahoo_easy_settlement'
        , 'bank_account1'
        , 'bank_account2'
        , 'bank_account3'
        , 'bank_account4'
        , 'bank_account5'
        , 'bank_account6'
        , 'bank_account7'
        , 'bank_account8'
        , 'bank_account9'
        , 'bank_account10'
        , 'check_seller_information'
        //////////
        , 'region'
        , 'municipality'
        , 'shipping_charge_borne'
        , 'shipping_input_method'
        , 'delivaly_days'
        , 'yafuneko'
        , 'yafuneko_compact'
        , 'yafuneko_post'
        , 'jpp_pack'
        , 'jpp_packet'
        , 'hako_boon'
        , 'hako_boon_mini'
        , 'size'
        , 'weight'
        //////////
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
          filename: ''
        , category_id:  obj.item_categoryid
        , title: obj.title
        , input_method_of_description: ''
        , description:  obj.explanation
        , image1: setImage(obj.guid__, obj.images, 1)
        , image2: setImage(obj.guid__, obj.images, 2)
        , image3: setImage(obj.guid__, obj.images, 3)
        , coments1: ''
        , coments2:  ''
        , coments3: ''
        , number: ''
        , start_price: ''
        , buynow_price: obj.buynow
        , negotiation: 0
        , duration: 1
        , end_time: 23
        , auto_re_sale: 3
        , auto_price_cut: 0
        , auto_extension: 1
        , early_termination: 1
        , bidder_limit: 1
        , bad_evaluation: 1
        , identification: 1
        , condition: 1
        , remarks_on_condition: ''
        , returns: 1
        , remarks_on_returns: '到着後２日'
        , yahoo_easy_settlement: 1
        , bank_account1: ''
        , bank_account2: ''
        , bank_account3: ''
        , bank_account4: ''
        , bank_account5: ''
        , bank_account6: ''
        , bank_account7: ''
        , bank_account8: ''
        , bank_account9: ''
        , bank_account10: ''
        , check_seller_information: 0
        /////////
        , region: 1
        , municipality: ''
        , shipping_charge_borne: 0 
        , shipping_input_method: 1
        , delivaly_days: 2
        , yafuneko: 0
        , yafuneko_compact: 0
        , yafuneko_post: 0
        , jpp_pack: 0
        , jpp_packet: 0
        , hako_boon: 0
        , hako_boon_mini: 0
        , size: 1
        , weight: 0
        //////////
        , shipping_method1:  '郵便局またはヤマト運輸',  domestic1:  1000,  hokkaido1:   '', okinawa1:   '', remote1:  ''
        , shipping_method2:  '',                        domestic2:  '',    hokkaido2:   '', okinawa2:   '', remote2:  ''
        , shipping_method3:  '',                        domestic3:  '',    hokkaido3:   '', okinawa3:   '', remote3:  ''
        , shipping_method4:  '',                        domestic4:  '',    hokkaido4:   '', okinawa4:   '', remote4:  ''
        , shipping_method5:  '',                        domestic5:  '',    hokkaido5:   '', okinawa5:   '', remote5:  ''
        , shipping_method6:  '',                        domestic6:  '',    hokkaido6:   '', okinawa6:   '', remote6:  ''
        , shipping_method7:  '',                        domestic7:  '',    hokkaido7:   '', okinawa7:   '', remote7:  ''
        , shipping_method8:  '',                        domestic8:  '',    hokkaido8:   '', okinawa8:   '', remote8:  ''
        , shipping_method9:  '',                        domestic9:  '',    hokkaido9:   '', okinawa9:   '', remote9:  ''
        , shipping_method10: '',                        domestic10: '',    hokkaido10:  '', okinawa10:  '', remote10: ''
        , arrival_jpp_pack:  '', arrival_mail: '', arrival_neko: '', arrival_sagawa: '', arrival_seino: ''
        , oversea: 0, options: 0, bold: 0, background: 0, affiliate: 1
        }));
        break;
      case '0003': // Format C
        keys = [
          'asin'
        , 'title'
        , 'brand'
        , 'category'
        , 'description'
        , 'word_count'
        , 'rating'
        , 'review'
        , 'list_price'
        , 'price'
        , 'discount'
        , 'commision'
        , 'sales_rank'
        , 'available'
        , 'thumbnail'
        , 'product_url'
        , 'fullfilled'
        , 'ship_price'
        , 'total_price'
        , 'parent_asin'
        , 'child_asin'
        , 'upc'
        , 'ean'
        , 'prime'
        , 'affiliate_link'
        , 'image1', 'image2', 'image3', 'image4', 'image5', 'image6', 'image7', 'image8', 'image9', 'image10'
        ];
        map = R.map(obj => ({
          asin:           obj.attributes ? setAsin(obj.attributes.asins, 1) : '-'
        , title:          obj.title
        , brand:          ''
        , category:       ''
        , description:    ''
        , word_count:     0
        , rating:         0
        , review:         0
        , list_price:     0
        , price:          obj.price
        , discount:       0
        , commision:      ''
        , sales_rank:     0
        , available:      'N'
        , thumbnail:      ''
        , product_url:    ''
        , fullfilled:     'N'
        , ship_price:     0
        , total_price:    0
        , parent_asin:    ''
        , child_asin:     ''
        , upc:            ''
        , ean:            ''
        , prime:          ''
        , affiliate_link: ''
        , image1:         setImage(obj.guid__, obj.images, 1)
        , image2:         setImage(obj.guid__, obj.images, 2)
        , image3:         setImage(obj.guid__, obj.images, 3)
        , image4:         setImage(obj.guid__, obj.images, 4)
        , image5:         setImage(obj.guid__, obj.images, 5)
        , image6:         setImage(obj.guid__, obj.images, 6)
        , image7:         setImage(obj.guid__, obj.images, 7)
        , image8:         setImage(obj.guid__, obj.images, 8)
        , image9:         setImage(obj.guid__, obj.images, 9)
        , image10:        setImage(obj.guid__, obj.images, 10)
        }));
        break;
      case '0004': // Format B
        keys = [
          'filename'
        , 'category_id'
        , 'title'
        , 'input_method_of_description'
        , 'description'
        , 'image1'
        , 'image2'
        , 'image3'
        , 'image4'
        , 'image5'
        , 'image6'
        , 'image7'
        , 'image8'
        , 'image9'
        , 'image10'
        , 'coment1'
        , 'coment2'
        , 'coment3'
        , 'coment4'
        , 'coment5'
        , 'coment6'
        , 'coment7'
        , 'coment8'
        , 'coment9'
        , 'coment10'
        , 'number'
        , 'start_price'
        , 'buynow_price'
        , 'negotiation'
        , 'duration'
        , 'end_time'
        , 'auto_re_sale'
        , 'auto_price_cut'
        , 'auto_extension'
        , 'early_termination'
        , 'bidder_limit'
        , 'bad_evaluation'
        , 'identification'
        , 'condition'
        , 'remarks_on_condition'
        , 'returns'
        , 'remarks_on_returns'
        , 'yahoo_easy_settlement'
        //////////
        , 'check_seller_information'
        //////////
        , 'region'
        , 'municipality'
        , 'shipping_charge_borne'
        , 'shipping_input_method'
        , 'delivaly_days'
        , 'yafuneko'
        , 'yafuneko_compact'
        , 'yafuneko_post'
        , 'jpp_pack'
        , 'jpp_packet'
        , 'unused1'
        , 'unused2'
        , 'size'
        , 'weight'
        //////////
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
          filename: ''
        , category_id:  obj.item_categoryid
        , title: obj.title
        , input_method_of_description: ''
        , description:  obj.explanation
        , image1: setImage(obj.guid__, obj.images, 1)
        , image2: setImage(obj.guid__, obj.images, 2)
        , image3: setImage(obj.guid__, obj.images, 3)
        , image4: setImage(obj.guid__, obj.images, 4)
        , image5: setImage(obj.guid__, obj.images, 5)
        , image6: setImage(obj.guid__, obj.images, 6)
        , image7: setImage(obj.guid__, obj.images, 7)
        , image8: setImage(obj.guid__, obj.images, 8)
        , image9: setImage(obj.guid__, obj.images, 9)
        , image10: setImage(obj.guid__, obj.images, 10)
        , coments1: ''
        , coments2:  ''
        , coments3: ''
        , coments4: ''
        , coments5: ''
        , coments6: ''
        , coments7: ''
        , coments8: ''
        , coments9: ''
        , coments10: ''
        , number: 1
        //////////
        , start_price: ''
        , buynow_price: obj.buynow
        , negotiation: 0
        , duration: 1
        , end_time: 23
        , auto_re_sale: 2
        , auto_price_cut: 0
        , auto_extension: 1
        , early_termination: 1
        , bidder_limit: 1
        , bad_evaluation: 1
        , identification: 1
        , condition: 1
        , remarks_on_condition: ''
        , returns: 1
        , remarks_on_returns: '到着後２日'
        , yahoo_easy_settlement: 1
        //////////
        , check_seller_information: 0
        /////////
        , region: 40
        , municipality: ''
        , shipping_charge_borne: 0 
        , shipping_input_method: 1
        , delivaly_days: 2
        , yafuneko: 0
        , yafuneko_compact: 0
        , yafuneko_post: 0
        , jpp_pack: 0
        , jpp_packet: 0
        , unused1: 0
        , unused2: 0
        , size: 1
        , weight: 0
        //////////
        , shipping_method1:  '郵便局またはヤマト運輸',  domestic1:  1000,  hokkaido1:   '', okinawa1:   '', remote1:  ''
        , shipping_method2:  '',                        domestic2:  '',    hokkaido2:   '', okinawa2:   '', remote2:  ''
        , shipping_method3:  '',                        domestic3:  '',    hokkaido3:   '', okinawa3:   '', remote3:  ''
        , shipping_method4:  '',                        domestic4:  '',    hokkaido4:   '', okinawa4:   '', remote4:  ''
        , shipping_method5:  '',                        domestic5:  '',    hokkaido5:   '', okinawa5:   '', remote5:  ''
        , shipping_method6:  '',                        domestic6:  '',    hokkaido6:   '', okinawa6:   '', remote6:  ''
        , shipping_method7:  '',                        domestic7:  '',    hokkaido7:   '', okinawa7:   '', remote7:  ''
        , shipping_method8:  '',                        domestic8:  '',    hokkaido8:   '', okinawa8:   '', remote8:  ''
        , shipping_method9:  '',                        domestic9:  '',    hokkaido9:   '', okinawa9:   '', remote9:  ''
        , shipping_method10: '',                        domestic10: '',    hokkaido10:  '', okinawa10:  '', remote10: ''
        , arrival_jpp_pack:  '', arrival_mail: '', arrival_neko: '', arrival_sagawa: '', arrival_seino: ''
        , oversea: 0, options: 0, bold: 0, background: 0, affiliate: 1
        }));
        break;
    }
    return { keys, map };
  }

  downloadNotes({ user, category }) {
    const CSV         = this.setCsvNotes(category);
    const setBuffer   = csv  => Buffer.from(csv, 'utf8');
    const setNotesCsv = objs => js2Csv.of({ csv: objs, keys: CSV.keys }).parse();
    const filter      = { isCSV: true };
    const promise     = this.getNotes(user, category, null, null, filter);
    return from(promise).pipe(
      map(CSV.map)
    , map(setNotesCsv)
    , map(setBuffer)
    );
  }
  
  downloadTrade({ user, filter }) {
    const CSV         = this.setCsvItems('0001');
    const setBuffer   = csv  => Buffer.from(csv, 'utf8');
    const setItemsCsv = objs => js2Csv.of({ csv: objs, keys: CSV.keys }).parse();
    const getItems    = obj => obj.items ? obj.items : [];
    //const dupItems    = objs => std.dupObj(objs, 'title');
    const promise     = this.getTraded(user, null, null, filter);
    return from(promise).pipe(
      map(R.map(getItems))
    , map(R.map(CSV.map))
    , map(R.flatten)
    //, map(dupItems)
    , map(setItemsCsv)
    , map(setBuffer)
    );
  }
  
  downloadBids({ user, filter }) {
    const CSV         = this.setCsvItems('0001');
    const setBuffer   = csv  => Buffer.from(csv, 'utf8');
    const setItemsCsv = objs => js2Csv.of({ csv: objs, keys: CSV.keys }).parse();
    const getItems    = obj => obj.items ? obj.items : [];
    //const dupItems    = objs => std.dupObj(objs, 'title');
    const promise     = this.getBided(user, null, null, filter);
    return from(promise).pipe(
      map(R.map(getItems))
    , map(R.map(CSV.map))
    , map(R.flatten)
    //, map(dupItems)
    , map(setItemsCsv)
    , map(setBuffer)
    );
  }

  downloadItems({ user, ids, filter, type }, header) {
    const CSV         = this.setCsvItems(type);
    const BOM         = Buffer.from('\uFEFF', 'utf8');
    const setBuffer   = csv  => Buffer.from(csv, 'utf8');
    const setHeader   = buf  => header ? Buffer.concat([BOM, buf]) : buf;
    const setItemsCsv = objs => js2Csv.of({ csv: objs, keys: CSV.keys, header }).parse();
    //const dupItems    = objs => std.dupObj(objs, 'title');
    const getItems    = obj => obj.items ? obj.items : [];
    const _filter     = R.merge(filter, { isCSV: true });
    const promises    = R.map(id => this.getNote(user, id, null, null, _filter));
    return forkJoin(promises(ids)).pipe(
      map(R.map(getItems))
    , map(R.map(CSV.map))
    , map(R.flatten)
    //, map(dupItems)
    , map(setItemsCsv)
    , map(setBuffer)
    , map(setHeader)
    );
  }

  setImagesKey(key, values) {
    const setKey      = (_key, _val) => std.crypto_sha256(_val, _key, 'hex') + '.img';
    const setName     = (_key, _val) => _key + '_' + path.basename(std.parse_url(_val).pathname);
    const setImage    = (_key, _vals) => R.map(_val => ({ key: setKey(_key, _val), name: setName(_key, _val) }), _vals);
    return setImage(key, values);
  }

  downloadImages({ user, ids, filter }) {
    const getobjects  = objs => this.AWS.fetchObjects(STORAGE, objs);
    const setImages   = R.map(obj => this.setImagesKey(obj.guid, obj.images));
    const dupItems    = objs => std.dupObj(objs, 'title');
    const setItems    = R.map(obj => ({ guid: obj.guid__, title: obj.title, images: obj.images}));
    const hasImages   = R.filter(obj => obj.attributes && obj.attributes.images && !R.isEmpty(obj.attributes.images));
    const getItems    = obj => obj.items ? obj.items: [];
    const promises    = R.map(id => this.getNote(user, id, null, null, filter));
    return forkJoin(promises(ids)).pipe(
      map(R.map(getItems))
    , map(R.map(hasImages))
    , map(R.map(setItems))
    , map(R.flatten)
    , map(dupItems)
    , map(setImages)
    , map(R.flatten)
    , flatMap(objs => getobjects(objs))
    );
  }

  downloadImage({ user, ids, filter }) {
    const setImages   = R.map(obj => this.setImagesKey(obj.guid, obj.images));
    const dupItems    = objs => std.dupObj(objs, 'title');
    const setItems    = R.map(obj => ({ guid: obj.guid__, title: obj.title, images: obj.images}));
    const hasImages   = R.filter(obj => obj.attributes && obj.attributes.images && !R.isEmpty(obj.attributes.images));
    const getItems    = obj => obj.items ? obj.items: [];
    const promises    = R.map(id => this.getNote(user, id, null, null, filter));
    return forkJoin(promises(ids)).pipe(
      map(R.map(getItems))
    , map(R.map(hasImages))
    , map(R.map(setItems))
    , map(R.flatten)
    , map(dupItems)
    , map(setImages)
    , map(R.flatten)
    );
  }
}
FeedParser.displayName = 'FeedParser';
