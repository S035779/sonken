import dotenv           from 'dotenv';
import fs               from 'fs';
import fsExtra          from 'fs-extra';
import path             from 'path';
import * as R           from 'ramda';
import { from }         from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import FeedParser       from 'Routes/FeedParser/FeedParser';
import job              from 'Utilities/jobutils';
import log              from 'Utilities/logutils';

const config = dotenv.config();
if(config.error) throw config.error();

const CACHE = process.env.CACHE;

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
          const setParam = obj => R.merge(params, { ids: obj, created: new Date });
          const setData  = obj => ({ operation, params: obj });
          const datas = R.compose(R.map(setData), R.map(setParam))(idss);
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

  createJobs(data) {
    const { user, category } = data.params;
    const observable = objs => this.addJobs(data.operation, objs, data);
    return this.feed.fetchJobNotes({ users: [ user ], categorys: [ category ] }).pipe(
      map(R.map(obj => obj._id))
    , map(R.splitEvery(20))
    , flatMap(objs => from(observable(objs)))
    , map(() => null)
    );
  }

  fetchFile(filename) {
    const file = path.resolve(__dirname, '../../', CACHE, filename);
    const dir = path.resolve(__dirname, '../../', CACHE);
    return new Promise((resolve, reject) => {
      fs.readFile(file, (err, buffer) => {
        if(err) return reject(err);
        fs.unlink(file, err => {
          if(err) return reject(err);
          fsExtra.emptyDir(dir, err => {
            if(err) return reject(err);
            console.log(dir);
            resolve(buffer);
          });
        });
      });
    });
  }

  getFilename(data) {
    const { user, category } = data.params;
    const dir = path.resolve(__dirname, '../../', CACHE);
    return new Promise((resolve, reject) => {
      fs.readdir(dir, (err, files) => {
        if(err) return reject(err);
        const isFile = R.length(files);
        if(isFile) {
          const numList = R.compose(
            R.map(objs => objs[3])
          , R.filter(objs => objs[1] === user && objs[2] === category)
          , R.map(R.match(/(.*)-(.*)-(.*)\.zip$/))
          , R.filter(obj => fs.statSync(dir + '/' + obj).isFile() && /.*\.zip$/.test(obj))
          )(files);
          const maxValue = Math.max(...numList);
          const filename = user + '-' + category + '-' + maxValue + '.zip';
          return resolve(filename);
        } 
        return resolve(null);
      });
    });
  }

  download(data) {
    log.info(JobQueue.displayName, 'Download', data);
    return from(this.getFilename(data)).pipe(
      flatMap(obj => obj ? from(this.fetchFile(obj)) : this.createJobs(data))
    );
  }
}
JobQueue.displayName = 'JobQueue';
