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
          const { operation, data } = options;
          return job.enqueue(JobQueue.displayName, operation, [ data ]);
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

  addJob(operation, data) {
    return this.request('create/job', { operation, data });
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

  createJobs(operation, { id, user, category, type, filter }) {
    log.info(JobQueue.displayName, 'createjobs', operation);
    switch(operation) {
      case 'download/items':
        {
          const conditions = { 
            lastFinishedAt: { $exists: false }
          , 'data.params.user': user
          , 'data.params.category': category
          , 'data.params.type': type
          };
          const setIds = R.map(obj => obj._id);
          const setParams = objs => ({ ids: R.splitEvery(20, objs), number: R.length(objs) });
          const observable = this.feed.fetchJobNotes({ users: [ user ], categorys: [ category ] });
          return from(this.getJobs(operation, conditions)).pipe(
            flatMap(objs => R.isEmpty(objs) ? observable : throwError('Proceeding job...'))
            , map(setIds)
            , map(setParams)
            , flatMap(obj => from(this.addJobs(operation, obj, { user, category, type, filter })))
            , catchError(() => of(''))
            );
        }
      case 'download/images':
        {
          const conditions = {
            lastFinishedAt: { $exists: false }
          , 'data.params.user': user
          , 'data.params.id': id
          };
          const setIds = R.map(obj => obj._id);
          const setParams = obj => ({ id: obj, number: 1 });
          const observable = this.feed.fetchJobNote({ user, id });
          return from(this.getJobs(operation, conditions)).pipe(
            flatMap(objs => R.isEmpty(objs) ? observable : throwError('Proceeding job...'))
            , map(setIds)
            , map(setParams)
            , flatMap(obj => from(this.addJobs(operation, obj, { id, user, filter })))
            , catchError(() => of(''))
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
          ? from(this.AWS.fetchSignedUrl(STORAGE, setParam(file))) : throwError('File not found.'))
      , flatMap(file => from(this.FSS.finalize(file)))
      , map(file => file.url)
      , catchError(() => this.createJobs(operation, params))
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
      , flatMap(file => !R.isNil(file) ? from(this.FSS.fetchFile(file)) : throwError('File not found.'))
      , flatMap(file => from(this.FSS.finalize(file)))
      , flatMap(file => from(this.AWS.deleteObject(STORAGE, setParam(file))))
      , map(file => file.data.buffer)
      , catchError(() => this.createJobs(operation, params))
      );
  }
  
  setFSSParams(operation, { id, user, category, type }, file) {
    const { subpath, files } = file;
    const _files  = R.filter(filename => this.FSS.isFile({ filename }) && R.test(/.*\.zip$/, filename), files);
    const maxValue    = array => !R.isEmpty(array) ? Math.max(...array) : null;
    let setFile, setVal, isFile, regZip;
    switch(operation) {
      case 'download/items':
        {
          setFile = num => !R.isNil(num) ? ({ subpath, filename: user + '-' + category + '-' + type + '-' + num + '.zip' }) : null;
          setVal = objs => objs[4];
          isFile = objs => objs[1] === user && objs[2] === category && objs[3] === type;
          regZip = R.match(/(.*)-(.*)-(.*)-(.*)\.zip$/);
          break;
        }
      case 'download/images':
        {
          setFile = num => !R.isNil(num) ? ({ subpath, filename: user + '-' + id + '-' + num + '.zip' }) : null;
          setVal = objs => objs[3];
          isFile = objs => objs[1] === user && objs[2] === id;
          regZip = R.match(/(.*)-(.*)-(.*)\.zip$/);
          break;
        }
      default:
        return null;
    }
    const getFile = R.compose(setFile, maxValue, R.map(setVal), R.filter(isFile), R.map(regZip));
    return !R.isEmpty(_files) ? getFile(_files) : null;
  }

  setAWSParams(operation, { id, user, category, type }, file) {
    let key, name;
    switch(operation) {
      case 'download/items':
        {
          key    = std.crypto_sha256(user + '-' + category, type, 'hex') + '.zip';
          name   = user + '-' + category + '-' + type + '-' + Date.now() + '.zip' ;
          break;
        }
      case 'download/images':
        {
          key    = std.crypto_sha256(user, id, 'hex') + '.zip';
          name   = user + '-' + id + '-' + Date.now() + '.zip' ;
          break;
        }
      default:
        return null;
    }
    return !R.isNil(file) ? { key, name, file } : { key, name };
  }
}
JobQueue.displayName = 'JobQueue';
