import dotenv                       from 'dotenv';
import * as R                       from 'ramda';
import { from, throwError, of }     from 'rxjs';
import { map, flatMap, catchError } from 'rxjs/operators';
import FeedParser                   from 'Routes/FeedParser/FeedParser';
import job                          from 'Utilities/jobutils';
import log                          from 'Utilities/logutils';
import fss                          from 'Utilities/fssutils';
import aws                          from 'Utilities/awsutils';
import std                          from 'Utilities/stdutils';

const config = dotenv.config();
if(config.error) throw config.error();

const CACHE = process.env.CACHE;
const AWS_ACCESS_KEY  = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY  = process.env.AWS_SECRET_KEY;
const AWS_REGION_NAME = process.env.AWS_REGION_NAME;
const STORAGE         = process.env.STORAGE;
const aws_keyset  = { access_key: AWS_ACCESS_KEY, secret_key: AWS_SECRET_KEY, region: AWS_REGION_NAME };

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
    log.info(JobQueue.displayName, 'Request', operation);
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
          const { ids , number } = idss;
          const setParam = obj => R.merge(data, { ids: obj, number, created: new Date });
          const setData = obj => ({ operation, params: setParam(obj) });
          const datas = R.map(setData, ids);
          return job.enqueue(JobQueue.displayName, operation, datas);
        }
      case 'create/job':
        {
          const { operation, ids, data } = options;
          const { id, number } = ids;
          const params = R.merge(data, { id, number, created: new Date })
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

  createJobs(operation, options) {
    log.info(JobQueue.displayName, 'createjobs', operation);
    switch(operation) {
      case 'download/images':
      case 'download/items':
        {
          const { user, category, type, filter } = options;
          const conditions = { 
            lastFinishedAt: { $exists: false }
          , 'data.params.user': user
          , 'data.params.category': category
          , 'data.params.type': type
          };
          const setIds = R.map(obj => obj._id);
          const splitIds = R.splitEvery(20);
          const setLen = R.length;
          const setParams = objs => ({ ids: splitIds(objs), number: setLen(objs) });
          return from(this.getJobs(operation, conditions)).pipe(
              flatMap(objs => R.isEmpty(objs) 
                ? this.feed.fetchJobNotes({ users: [ user ], categorys: [ category ] })
                : throwError({ name: 'Exists job:', message: 'Proceeding job...', stack: operation }))
            , map(setIds)
            , map(setParams)
            , flatMap(obj => from(this.addJobs(operation, obj, { user, category, type, filter })))
            , catchError(err => {
                if(err) log.warn(JobQueue.displayName, err.name, err.message, err.stack);
                return of('');
              })
            );
        }
      case 'download/item':
      case 'download/image':
        {
          const { user, category, id, filter } = options;
          const conditions = {
            lastFinishedAt: { $exists: false }
          , 'data.params.user': user
          , 'data.params.category': category
          , 'data.params.id': id
          };
          const setId = obj => obj._id;
          const setParam = obj => ({ id: obj, number: 1 });
          return from(this.getJobs(operation, conditions)).pipe(
              flatMap(objs => R.isEmpty(objs) 
                ? this.feed.fetchJobNote({ user, id })
                : throwError({ name: 'Exists job:', message: 'Proceeding job...', stack: operation }))
            , map(setId)
            , map(setParam)
            , flatMap(obj => from(this.addJob(operation, obj, { user, category, filter })))
            , catchError(err => {
                if(err) log.warn(JobQueue.displayName, err.name, err.message, err.stack);
                return of('');
              })
            );
        }
      default:
        return throwError('not Implemented.');
    }
  }

  signedlink(operation, { id, user, category, type, filter }) {
    log.info(JobQueue.displayName, 'signedlink', operation);
    const params = { id, user, category, type, filter };
    const setParam = file => this.setAWSParams(operation, params, file);
    return from(this.AWS.fetchObject(STORAGE, setParam())).pipe(
        flatMap(data => from(this.FSS.createFile({ data })))
      , flatMap(file => from(this.FSS.fetchFileList(file)))
      , map(file => this.setFSSParams(operation, params, file))
      , flatMap(file => !R.isNil(file) 
          ? from(this.AWS.fetchSignedUrl(STORAGE, setParam(file))) 
          : throwError({ name: 'Proceeding job:', message: 'File not found.', stack: operation }))
      , flatMap(file => from(this.FSS.finalize(file)))
      , map(file => file.url)
      , catchError(err => {
          if(err && err.name !== 'NoSuchKey') log.warn(JobQueue.displayName, err.name, err.message, err.stack);
          return this.createJobs(operation, params);
        })
      );
  }
  
  download(operation, { id, user, category, type, filter }) {
    log.info(JobQueue.displayName, 'download', operation);
    const params = { id, user, category, type, filter };
    const setParam = file => this.setAWSParams(operation, params, file);
    return from(this.AWS.fetchObject(STORAGE, setParam())).pipe(
        flatMap(data => from(this.FSS.createFile({ data })))
      , flatMap(file => from(this.FSS.fetchFileList(file)))
      , map(file => this.setFSSParams(operation, params, file))
      , flatMap(file => !R.isNil(file) 
          ? from(this.FSS.fetchFile(file)) 
          : throwError({ name: 'Proceeding job:', message: 'File not found.', stack: operation }))
      , flatMap(file => from(this.FSS.finalize(file)))
      , flatMap(file => from(this.AWS.deleteObject(STORAGE, setParam(file))))
      , map(file => file.data.buffer)
      , catchError(err => {
          if(err && err.name !== 'NoSuchKey') log.warn(JobQueue.displayName, err.name, err.message, err.stack);
          return this.createJobs(operation, params);
        })
      );
  }
  
  setFSSParams(operation, { id, user, category, type }, file) {
    const { subpath, files } = file;
    const header    = user + '-' + category;
    let   __id__;
    switch(operation) {
      case 'download/items':
      case 'download/images':
        __id__ = type;
        break;
      case 'download/item':
      case 'download/image':
        __id__ = id;
        break;
      default:
        return null;
    }
    const _files    = R.filter(filename => this.FSS.isFile({ filename }) && R.test(/.*\.zip$/, filename), files);
    const maxValue  = array => !R.isEmpty(array) ? Math.max(...array) : null;
    const setFile   = num => !R.isNil(num) ? ({ subpath, filename: header + '-' + __id__ + '-' + num + '.zip' }) : null;
    const setVal    = objs => objs[4];
    const isFile    = objs => objs[1] === user && objs[2] === category && objs[3] === __id__;
    const regZip    = R.match(/(.*)-(.*)-(.*)-(.*)\.zip$/);
    const getFile   = R.compose(setFile, maxValue, R.map(setVal), R.filter(isFile), R.map(regZip));
    return !R.isEmpty(_files) ? getFile(_files) : null;
  }

  setAWSParams(operation, { id, user, category, type }, file) {
    const header    = user + '-' + category;
    let __id__;
    switch(operation) {
      case 'download/items':
      case 'download/images':
          __id__ = type;
          break;
      case 'download/item':
      case 'download/image':
          __id__ = id;
          break;
      default:
        return null;
    }
    const key  = std.crypto_sha256(header, __id__, 'hex') + '.zip';
    const name = header + '-' + __id__ + '-' + Date.now() + '.zip' ;
    return !R.isNil(file) ? { key, name, file } : { key, name };
  }
}
JobQueue.displayName = 'JobQueue';
