import dotenv             from 'dotenv';
import { from }           from 'rxjs';
import { map, flatMap }   from 'rxjs/operators';
import * as R             from 'ramda';
import FeedParser         from 'Routes/FeedParser/FeedParser';
import job                from 'Utilities/jobutils';
//import log                from 'Utilities/logutils';

const config = dotenv.config();
if(config.error) throw config.error();

const worker_name = 'wks-worker';

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
    //log.info(JobQueue.displayName, 'Request', { request, options });
    switch(request) {
      case 'fetch/jobs':
        {
          const { jobname } = options;
          const conditions = { name: jobname };
          return job.queue(JobQueue.displayName)
            .then(async queue => {
              await queue.start();
              await queue.jobs(conditions);
              await queue.stop();
              return queue;
            });
        }
      case 'create/jobs':
        {
          const { jobname, idss, data } = options;
          const { operation, params } = data;
          const setParam = obj => R.merge(params, { ids: obj, created: new Date });
          const _params = R.map(setParam, idss);
          //log.trace(JobQueue.displayName, 'Datas', _params);
          return job.queue(JobQueue.displayName)
            .then(async queue => {
              await queue.start();
              for(let obj of _params) {
                await queue.now(jobname, { operation, params: obj });
              }
              await queue.stop();
              return queue;
            });
        }
      case 'create/job':
        {
          const { jobname, data } = options;
          return job.queue(JobQueue.displayName)
            .then(async queue => {
              await queue.start();
              await queue.now(jobname, data);
              await queue.stop();
              return queue;
            });
        }
      case 'defrag/jobs':
        {
          const { jobname } = options;
          return job.queue(JobQueue.displayName)
            .then(async queue => {
              await queue.start();
              await queue.cancel({ name: jobname });
              await queue.stop();
              return queue;
            });
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

  cancel() {
    return from(this.garbageJobs(worker_name));
  }

  download(data) {
    //log.info(JobQueue.displayName, 'Download', data);
    const { user, category } = data.params;
    const observable = objs => this.addJobs(worker_name, objs, data);
    return this.feed.fetchJobNotes({ users: [ user ], categorys: [ category ] }).pipe(
      map(R.map(obj => obj._id))
    , map(R.splitEvery(20))
    , flatMap(objs => from(observable(objs)))
    , map(() => data)
    //, map(R.tap(console.log))
    );
  }
}
JobQueue.displayName = 'JobQueue';
