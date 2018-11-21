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
          const { operation } = options;
          const conditions = { name: operation };
          return job.queueList(JobQueue.displayName, conditions);
        }
      case 'create/jobs':
        {
          const { operation, idss, data } = options;
          const { ids , number } = idss;
          const { user, category, type, filter} = data;
          const setData = obj => ({ operation, params: { user, category, type, filter, ids: obj, number, created: new Date } });
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

  getJobs(operation) {
    return this.request('fetch/jobs', { operation });
  }

  garbageJobs(operation) {
    return this.request('defrag/jobs', { operation });
  }

  cancel({ operation }) {
    return from(this.garbageJobs(operation));
  }

  createJobs(operation, { user, category, type, filter }) {
    log.info(JobQueue.displayName, 'CreateJOB', operation);
    const setIds = R.map(obj => obj._id);
    const setParams = objs => ({ ids: R.splitEvery(20, objs), number: R.length(objs) });
    return from(this.getJobs(operation)).pipe(
        flatMap(objs => R.isEmpty(objs)
          ? this.feed.fetchJobNotes({ users: [ user ], categorys: [ category ] }) : throwError('Proceeding job....'))
      , map(setIds)
      , map(setParams)
      , flatMap(obj => from(this.addJobs(operation, obj, { user, category, type, filter })))
      , catchError(status => {
          log.info(JobQueue.displayName, 'resume', { operation, status });
          return of('');
        })
      );
  }

  downloadLink(operation, { user, category, type, filter }) {
    log.info(JobQueue.displayName, 'DownloadLink', operation);
    return from(this.AWS.fetchObject(STORAGE, this.setAWSParams({ user, category, type }))).pipe(
        flatMap(data => from(this.FSS.createFile({ data })))
      , flatMap(file => from(this.FSS.fetchFileList(file)))
      , map(file => this.setFSSParams({ user, category, type }, file))
      , flatMap(file => !R.isNil(file) 
          ? from(this.AWS.fetchSignedUrl(STORAGE, this.setAWSParams({ user, category, type }, file))) : throwError('File not found.'))
      , flatMap(file => from(this.FSS.finalize(file)))
      , map(file => file.url)
      , catchError(() => this.createJobs(operation, { user, category, type, filter }))
      );
  }
  
  downloadFile(operation, { user, category, type, filter }) {
    log.info(JobQueue.displayName, 'DownloadFile', operation);
    return from(this.AWS.fetchObject(STORAGE, this.setAWSParams({ user, category, type }))).pipe(
        flatMap(data => from(this.FSS.createFile({ data })))
      , flatMap(file => from(this.FSS.fetchFileList(file)))
      , map(file => this.setFSSParams({ user, category, type }, file))
      , flatMap(file => !R.isNil(file) ? from(this.FSS.fetchFile(file)) : throwError('File not found.'))
      , flatMap(file => from(this.FSS.finalize(file)))
      , map(file => file.data.buffer)
      , catchError(() => this.createJobs(operation, { user, category, type, filter }))
      );
  }
  
  setFSSParams({ user, category, type }, file) {
    const { subpath, files } = file;
    const hasArchive  = R.filter(filename => this.FSS.isFile({ filename }) && R.test(/.*\.zip$/, filename));
    const maxValue    = array => !R.isEmpty(array) ? Math.max(...array) : null;
    const setFile = num => !R.isNil(num) ? ({ subpath, filename: user + '-' + category + '-' + type + '-' + num + '.zip' }) : null;
    const getFile = obj => !R.isEmpty(obj) ? R.compose(
      setFile
    , maxValue
    , R.map(objs => objs[4])
    , R.filter(objs => objs[1] === user && objs[2] === category && objs[3] === type)
    , R.map(R.match(/(.*)-(.*)-(.*)-(.*)\.zip$/))
    )(obj) : null;
    return R.compose(getFile, hasArchive)(files);
  }

  setAWSParams({ user, category, type }, file) {
    const key    = std.crypto_sha256(user + '-' + category, type, 'hex') + '.zip';
    const name   = user + '-' + category + '-' + type + '-' + Date.now() + '.zip' ;
    const result = file ? { key, name, file } : { key, name };
    return result;
  }
}
JobQueue.displayName = 'JobQueue';
