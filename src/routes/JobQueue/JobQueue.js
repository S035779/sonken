import dotenv                       from 'dotenv';
import * as R                       from 'ramda';
import { from, throwError }         from 'rxjs';
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
    log.info(JobQueue.displayName, 'Request', { operation, options });
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
    const setIds = R.map(obj => obj._id);
    const setParams = objs => ({ ids: R.splitEvery(20, objs), number: R.length(objs) });
    return this.feed.fetchJobNotes({ users: [ user ], categorys: [ category ] }).pipe(
      map(setIds)
    , map(setParams)
    , flatMap(obj => from(this.addJobs(operation, obj, { user, category, type, filter })))
    );
  }

  downloadLink(operation, { user, category, type, filter }) {
    const params = this.setAWSParams(user, category, type);
    log.info(JobQueue.displayName, 'DownloadLink', { operation, params });
    return from(this.AWS.fetchObject(STORAGE, params)).pipe(
        flatMap(obj => from(this.FSS.createFile({ subpath: '', data: obj })))
      , flatMap(()  => from(this.FSS.fetchFileList()))
      , map(objs    => this.setFSSParams({ user, category, type }, objs))
      , flatMap(obj => !R.isNil(obj) ? from(this.AWS.fetchSignedUrl(STORAGE, params)) : throwError('File not found.'))
      , map(R.tap(console.log))
      , flatMap(obj => from(this.FSS.removeFile({ subpath: '', data: { name: obj } })))
      , catchError(() => this.createJobs(operation, { user, category, type, filter }))
      );
  }
  
  downloadFile(operation, { user, category, type, filter }) {
    const params = this.setAWSParams(user, category, type);
    log.info(JobQueue.displayName, 'DownloadFile', { operation, params });
    return from(this.AWS.fetchObject(STORAGE, params)).pipe(
        flatMap(obj => from(this.FSS.createFile({ subpath: '', data: obj })))
      , flatMap(()  => from(this.FSS.fetchFileList()))
      , map(objs    => this.setFSSParams({ user, category, type }, objs))
      , flatMap(obj => !R.isNil(obj) ? from(this.FSS.fetchFile(obj)) : throwError('File not found.'))
      , map(R.tap(console.log))
      , flatMap(obj => from(this.FSS.removeFile({ subpath: '', data: { name: obj } })))
      , catchError(() => this.createJobs(operation, { user, category, type, filter }))
      );
  }
  
  setFSSParams({ user, category, type }, filelist) {
    const hasArchive  = R.filter(obj => this.FSS.isFile(obj) && /.*\.zip$/.test(obj));
    const maxValue    = array => !R.isEmpty(array) ? Math.max(...array) : null;
    const setFilename = num => !R.isNil(num) ? ({ filename: user + '-' + category + '-' + type + '-' + num + '.zip' }) : null;
    const getFilename = obj => !R.isEmpty(obj) ? R.compose(
      setFilename
    , maxValue
    , R.map(objs => objs[4])
    , R.filter(objs => objs[1] === user && objs[2] === category && objs[3] === type)
    , R.map(R.match(/(.*)-(.*)-(.*)-(.*)\.zip$/))
    )(obj) : null;
    return R.compose(
      getFilename
    , hasArchive
    )(filelist);
  }

  setAWSParams(user, category, type) {
    const setKey    = (_user, _category, _type) => std.crypto_sha256(_user + '-' + _category, _type, 'hex') + '.zip';
    const setName   = (_user, _category, _type) => _user + '-' + _category + '-' + _type + '-' + Date.now() + '.zip' ;
    const setParams = (_user, _category, _type) => ({ key: setKey(_user, _category, _type), name: setName(_user, _category, _type) });
    return setParams(user, category, type);
  }
}
JobQueue.displayName = 'JobQueue';
