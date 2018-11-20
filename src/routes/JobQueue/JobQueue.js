import dotenv           from 'dotenv';
import * as R           from 'ramda';
import { from }         from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import FeedParser       from 'Routes/FeedParser/FeedParser';
import job              from 'Utilities/jobutils';
import log              from 'Utilities/logutils';
//import fss              from 'Utilities/fssutils';
import aws              from 'Utilities/awsutils';
import std              from 'Utilities/stdutils';

const config = dotenv.config();
if(config.error) throw config.error();

//const CACHE = process.env.CACHE;
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
  }

  static of() {
    return new JobQueue();
  }

  request(request, options) {
    log.info(JobQueue.displayName, 'Request', { request, options });
    switch(request) {
      case 'fetch/jobs':
        {
          const { jobname } = options;
          const conditions = { name: jobname };
          return job.queueList(JobQueue.displayName, conditions);
        }
      case 'create/jobs':
        {
          const { jobname, idss, data } = options;
          const { operation, params } = data;
          const { ids , number } = idss;
          const setParam = obj => R.merge(params, { ids: obj, number, created: new Date });
          const setData  = obj => ({ operation, params: obj });
          const datas = R.compose(R.map(setData), R.map(setParam))(ids);
          return job.enqueue(JobQueue.displayName, jobname, datas);
        }
      case 'create/job':
        {
          const { jobname, data } = options;
          return job.enqueue(JobQueue.displayName, jobname, [ data ]);
        }
      case 'defrag/jobs':
        {
          const { jobname } = options;
          const conditions = { name: jobname };
          return job.queueDelete(JobQueue.displayName, conditions);
        }
      default:
        return new Promise((resolve, reject) => reject({ name: 'error', message: 'request: ' + request }));
    }
  }

  addJobs(jobname, idss, data) {
    return this.request('create/jobs', { jobname, idss, data });
  }

  addJob(jobname, data) {
    return this.request('create/job', { jobname, data });
  }

  getJobs(jobname) {
    return this.request('fetch/jobs', { jobname });
  }

  garbageJobs(jobname) {
    return this.request('defrag/jobs', { jobname });
  }

  cancel(data) {
    return from(this.garbageJobs(data.operation));
  }

  createJobs(data, url) {
    const { user, category } = data.params;
    const observable = obj => this.addJobs(data.operation, obj, data);
    return this.feed.fetchJobNotes({ users: [ user ], categorys: [ category ] }).pipe(
      map(R.map(obj => obj._id))
    , map(objs => ({ ids: objs, number: R.length(objs) }))
    , map(obj => ({ ids: R.splitEvery(20, obj.ids), number: obj.number }))
    , flatMap(obj => from(observable(obj)))
    , map(() => url)
    );
  }

  download(data) {
    log.info(JobQueue.displayName, 'Download', data);
    const { user, category } = data.params;
    //return from(this.checkObjectList(user, category)).pipe(
    //  map(R.tap(console.log))
    //, flatMap(obj => !R.isEmpty(obj) ? from(this.downloadCSVs(user, category)) : this.createJobs(data))
    return from(this.downloadCSVs(user, category)).pipe(
      flatMap(obj => this.createJobs(data, obj))
    );
  }
  
  //_download(data) {
  //  log.info(JobQueue.displayName, 'Download', data);
  //  const { user, category } = data.params;
  //  const FSS = fss.of({ dirpath: '../', dirname: CACHE });
  //  const maxValue = array => !R.isEmpty(array) ? Math.max(...array) : null;
  //  const setFilename = num => !R.isNil(num) ? ({ filename: user + '-' + category + '-' + num + '.zip' }) : null;
  //  const hasArchive = R.filter(obj => FSS.isFile(obj) && /.*\.zip$/.test(obj));
  //  const getFilename = R.compose(
  //    setFilename
  //  , maxValue
  //  , R.map(objs => objs[3])
  //  , R.filter(objs => objs[1] === user && objs[2] === category)
  //  , R.map(R.match(/(.*)-(.*)-(.*)\.zip$/))
  //  );
  //  return from(FSS.fetchFileList()).pipe(
  //      map(obj => hasArchive(obj))
  //    , map(obj => !R.isEmpty(obj) ? getFilename(obj) : null)
  //    , flatMap(obj => !R.isNil(obj) ? from(FSS.fetchFile(obj)) : this.createJobs(data))
  //    , map(R.tap(console.log))
  //    );
  //}
  
  checkObjectList(user, category) {
    const AWS             = aws.of(aws_keyset);
    const checkObjectList = objs => AWS.checkObjectList(STORAGE, objs);
    const setKey          = (_user, _category) => std.crypto_sha256(_user, _category, 'hex') + '.zip';
    const setName         = (_user, _category) => _user + '-' + _category + '-' + std.rndInteger(8) + '.zip' ;
    const setParams       = (_user, _category) => ({ key: setKey(_user, _category), name: setName(_user, _category) });
    return from(checkObjectList([setParams(user, category)]));
  }

  downloadCSVs(user, category) {
    const AWS           = aws.of(aws_keyset);
    const getSignedURL  = obj => AWS.fetchSignedUrl(STORAGE, obj);
    const setKey        = (_user, _category) => std.crypto_sha256(_user, _category, 'hex') + '.zip';
    const setName       = (_user, _category) => _user + '-' + _category + '-' + std.rndInteger(8) + '.zip' ;
    const setParams     = (_user, _category) => ({ key: setKey(_user, _category), name: setName(_user, _category) });
    return from(getSignedURL(setParams(user, category)));
  }
}
JobQueue.displayName = 'JobQueue';
