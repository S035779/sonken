import dotenv                       from 'dotenv';
import * as R                       from 'ramda';
import { from, throwError, of, defer, interval } from 'rxjs';
import { take, map, flatMap, catchError, toArray } from 'rxjs/operators';
import FeedParser                   from 'Routes/FeedParser/FeedParser';
import job                          from 'Utilities/jobutils';
import log                          from 'Utilities/logutils';
import fss                          from 'Utilities/fssutils';
import aws                          from 'Utilities/awsutils';
import std                          from 'Utilities/stdutils';

const config = dotenv.config();
if(config.error) throw config.error();

const CACHE           = process.env.CACHE;
const AWS_ACCESS_KEY  = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY  = process.env.AWS_SECRET_KEY;
const AWS_REGION_NAME = process.env.AWS_REGION_NAME;
const STORAGE         = process.env.STORAGE;
const aws_keyset  = { access_key: AWS_ACCESS_KEY, secret_key: AWS_SECRET_KEY, region: AWS_REGION_NAME };

const max_images_capacity = 50; // 50 images = 1000 MB
const max_seller_count = 20;    // 20 sellers
/**
 * JobQueue class.
 *
 * @constructor
 */
export default class JobQueue {
  constructor() {
    this.feed = FeedParser.of();
    this.FSS = fss.of({ dirpath: '../', dirname: CACHE });
    this.AWS = aws.of(aws_keyset);
  }

  static of() {
    return new JobQueue();
  }

  request(operation, options) {
    //log.info(JobQueue.displayName, 'Request', operation);
    switch(operation) {
      case 'fetch/jobs':
        {
          const { operation, data } = options;
          const conditions = R.merge(data, { name: operation });
          return job.queueList(JobQueue.displayName, conditions);
        }
      case 'create/jobs':
        {
          const { operation, idss, data } = options;
          const { ids, limit, count, total } = idss;
          const setParam = (idx, obj) => R.merge(data, { ids: obj, limit, count, index: idx, total, created: new Date });
          const mapIndex = R.addIndex(R.map);
          const datas = mapIndex((obj, idx) => ({ operation, params: setParam(idx, obj) }), ids);
          return job.enqueue(JobQueue.displayName, operation, datas);
        }
      case 'create/job':
        {
          const { operation, ids, data } = options;
          const { id } = ids;
          const params = R.merge(data, { id, created: new Date })
          const datas = [{ operation, params }];
          return job.enqueue(JobQueue.displayName, operation, datas);
        }
      case 'defrag/jobs':
        {
          const { operation } = options;
          const conditions = { name: operation };
          return job.queueDelete(JobQueue.displayName, conditions);
        }
      default:
        return new Promise((resolve, reject) => reject({ name: 'error', message: 'operation: ' + operation }));
    }
  }

  addJobs(operation, idss, data) {
    return this.request('create/jobs', { operation, idss, data });
  }

  addJob(operation, ids, data) {
    return this.request('create/job', { operation, ids, data });
  }

  getJobs(operation, data) {
    return this.request('fetch/jobs', { operation, data });
  }

  garbageJobs(operation) {
    return this.request('defrag/jobs', { operation });
  }

  cancel({ operation }) {
    return from(this.garbageJobs(operation));
  }

  fetchJobs({ user, category }) { 
    const conditions = { 
      lastFinishedAt: { $exists: false }
    , 'data.params.user': user
    , 'data.params.category': category
    };
    const operation = { $in: ['download/item', 'download/items', 'download/images', 'download/image', 'signedlink/images'] };
    const setAttrs = R.map(obj => obj && obj.attrs ? obj.attrs : null);
    return from(this.getJobs(operation, conditions)).pipe(map(setAttrs));
  }

  createJobs(operation, options) {
    log.info(JobQueue.displayName, 'createjobs', operation);
    switch(operation) {
      case 'download/item':
      case 'download/items':
        {
          const { user, category, ids, type, filter } = options;
          const conditions = { 
            lastFinishedAt: { $exists: false }
          , 'data.params.user': user
          , 'data.params.category': category
          , 'data.params.type': type
          };
          const limit = max_seller_count; // seller count.
          const count = 0;  // archive count.
          const setIds = R.map(obj => obj._id);
          const setParams = objs => ({ ids: R.splitEvery(limit, objs), limit, count, total: objs.length });
          const observable = defer(() => R.isNil(ids) 
            ? this.feed.fetchJobNotes({ users: [ user ], categorys: [ category ], sort: 'desc', skip: 0, limit: 1000 }).pipe(map(setIds))
            : of(ids));
          return from(this.getJobs(operation, conditions)).pipe(
              flatMap(objs => R.isEmpty(objs) 
                ? observable : throwError({ name: 'Exists job:', message: 'Proceeding job...', stack: operation }))
            , map(setParams)
            , flatMap(obj => from(this.addJobs(operation, obj, { user, category, type, filter })))
            , catchError(err => {
                if(err) log.warn(JobQueue.displayName, err.name, err.message, err.stack);
                return of(null);
              })
            );
        }
      case 'download/images':
      case 'signedlink/images':
        {
          const { user, category, ids, type, filter } = options;
          const conditions = { 
            lastFinishedAt: { $exists: false }
          , 'data.params.user': user
          , 'data.params.category': category
          , 'data.params.type': type
          };
          const limit = 1;  // seller count.
          const count = max_images_capacity; // archive count.
          const setIds = R.map(obj => obj._id);
          const setParams = objs => ({ ids: R.splitEvery(limit, objs), limit, count, total: objs.length });
          const observable = defer(() => R.isNil(ids) 
            ? this.feed.fetchJobNotes({ users: [ user ], categorys: [ category ], sort: 'desc', skip: 0, limit: 1000 }).pipe(map(setIds))
            : of(ids));
          return from(this.getJobs(operation, conditions)).pipe(
              flatMap(objs => R.isEmpty(objs) 
                ? observable : throwError({ name: 'Exists job:', message: 'Proceeding job...', stack: operation }))
            , map(setParams)
            , flatMap(obj => from(this.addJobs(operation, obj, { user, category, type, filter })))
            , catchError(err => {
                if(err) log.warn(JobQueue.displayName, err.name, err.message, err.stack);
                return of(null);
              })
            );
        }
      case 'download/image':
        {
          const { user, category, ids, type, filter } = options;
          const conditions = {
            lastFinishedAt: { $exists: false }
          , 'data.params.user': user
          , 'data.params.category': category
          , 'data.params.type': type
          };
          const setIds = R.map(obj => obj._id);
          const setParams = objs => ({ ids: [objs], total: objs.length });
          const observable = defer(() => R.isNil(ids)
            ? this.feed.fetchJobNotes({ users: [ user ], categorys: [ category ], sort: 'desc', skip: 0, limit: 1000 }).pipe(map(setIds))
            : of(ids));
          return from(this.getJobs(operation, conditions)).pipe(
              flatMap(objs => R.isEmpty(objs) 
                ? observable : throwError({ name: 'Exists job:', message: 'Proceeding job...', stack: operation }))
            , map(setParams)
            , flatMap(obj => from(this.addJobs(operation, obj, { user, category, type, filter })))
            , catchError(err => {
                if(err) log.warn(JobQueue.displayName, err.name, err.message, err.stack);
                return of(null);
              })
            );
        }
      default:
        return throwError({ name: 'Invalid request:', message: 'Request is not implemented.', stack: operation });
    }
  }

  signedlinks(operation, params) {
    const { number } = params;
    const num = Math.ceil(number / max_images_capacity);
    return of(this.setAWSParams(operation, params, null)).pipe(
        flatMap(    obj => from(this.AWS.fetchObjectHead(STORAGE, obj.key)))
      , flatMap(     () => interval(1000).pipe(take(num)))
      , flatMap(    idx => this.signedlink(operation, params, idx))
      , toArray()
      , catchError( err => {
          if(err && !(err.name === 'NoSuchKey' || err.name === 'NotFound'))
            log.error(JobQueue.displayName, err.name, err.message, err.stack);
          return this.createJobs(operation, params);
        })
      );
  }

  signedlink(operation, { ids, user, category, type, filter }, index) {
    log.info(JobQueue.displayName, 'signedlinks', operation);
    const params = { ids, user, category, type, filter };
    const file   = this.setAWSParams(operation, params, index);
    return from(this.AWS.fetchSignedUrl(STORAGE, file)).pipe(
        map(      file => file.url)
      , catchError(err => {
          if(err && err.name !== 'NoSuchKey') log.error(JobQueue.displayName, err.name, err.message, err.stack);
          return of(null);
        })
      );
  }

  clearcaches(operation, params) {
    const { number } = params;
    const num = Math.ceil(number / max_images_capacity);
    return of(this.setAWSParams(operation, params, null)).pipe(
      flatMap(obj => from(this.AWS.fetchObjectHead(STORAGE, obj.key)))
    , flatMap(() => interval(1000).pipe(take(num)))
    , flatMap(idx => this.clearcache(operation, params, idx))
    , toArray()
    , catchError(err => {
        if(err && !(err.name === 'NoSuchKey' || err.name === 'NotFound'))
          log.error(JobQueue.displayName, err.name, err.message, err.stack);
        return of([]);
      })
    );
  }

  clearcache(operation, { user, category, type }, index) {
    log.info(JobQueue.displayName, 'clearcaches', operation);
    const params = { user, category, type };
    const file = this.setAWSParams(operation, params, index);
    return from(this.AWS.deleteObject(STORAGE, file)).pipe(
        catchError( err => {
          if(err && err.name !== 'NoSuchKey') 
            log.error(JobQueue.displayName, err.name, err.message, err.stack);
          return of(null);
        })
      );
  }

  download(operation, { ids, user, category, type, filter }) {
    log.info(JobQueue.displayName, 'download', operation);
    const params = { ids, user, category, type, filter };
    return of(this.setAWSParams(operation, params, null)).pipe(
        flatMap( obj   => from(this.AWS.fetchObject(STORAGE, obj)))
      , flatMap( data  => from(this.FSS.createFile({ data })))
      , flatMap( file  => from(this.FSS.fetchFileList(file)))
      , map(     file  => this.setFSSParams(operation, params, null, file))
      , flatMap( file  => !R.isNil(file) 
          ? from(this.FSS.fetchFile(file)).pipe(flatMap(file  => from(this.FSS.finalize(file)))) 
          : throwError({ name: 'Proceeding job:', message: 'File not found.', stack: operation }))
      , map(     file  => this.setAWSParams(operation, params, null, file))
      , flatMap( obj   => from(this.AWS.deleteObject(STORAGE, obj)))
      , map(     file  => file.data.buffer)
      , catchError(err => {
          if(err && err.name !== 'NoSuchKey') 
            log.error(JobQueue.displayName, err.name, err.message, err.stack);
          return this.createJobs(operation, params);
        })
      );
  }
  
  setFSSParams(operation, { user, category, type }, index, file) {
    const { subpath, files } = file;
    const _index    = !R.isNil(index) ? index.toString() : '0';
    const header    = user + '-' + category;
    const isZip     = R.test(/.*\.zip$/);
    const _files    = R.filter(filename => isZip(filename) && this.FSS.isFile({ filename }), files);
    const setFile   = num => !R.isNil(num) ? ({ subpath, filename: header + '-' + type + '-' + _index + '-' + num + '.zip' }) : null;
    const maxValue  = array => !R.isEmpty(array) ? Math.max(...array) : null;
    const setVal    = objs => objs[5];
    const isFile    = objs => objs[1] === user && objs[2] === category && objs[3] === type && objs[4] === _index;
    const regZip    = R.match(/(.*)-(.*)-(.*)-(.*)-(.*)\.zip$/);
    const getFile   = R.compose(setFile, maxValue, R.map(setVal), R.filter(isFile), R.map(regZip));
    return !R.isEmpty(_files) ? getFile(_files) : null;
  }

  setAWSParams(operation, { user, category, type }, index, file) {
    const _index    = !R.isNil(index) ? index.toString() : '0';
    const header    = user + '-' + category;
    const key       = std.crypto_sha256(header + '-' + _index, type, 'hex') + '.zip';
    const name      = header + '-' + type + '-' + _index + '-' + Date.now() + '.zip' ;
    return !R.isNil(file) ? { key, name, file } : { key, name };
  }
}
JobQueue.displayName = 'JobQueue';
