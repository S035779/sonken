import dotenv                   from 'dotenv';
import * as R                   from 'ramda';
import { from, forkJoin }       from 'rxjs';
import { map, flatMap }         from 'rxjs/operators';
import mongoose                 from 'mongoose';
import { Job }                  from 'Models/queue';
import log                      from 'Utilities/logutils';

const config = dotenv.config();
if(config.error) throw config.error();

const ObjectId = mongoose.Types.ObjectId;

/**
 * FeedPaser class.
 *
 * @constructor
 */
export default class JobQueue {
  static of() {
    return new JobQueue();
  }

  request(request, options) {
    switch(request) {
      case 'fetch/jobs':
        {
          const { jobname, worker } = options;
          const conditions = { jobname, worker };
          return Job.find(conditions).exec();
        }
      case 'fetch/job':
        {
          const { id } = options;
          const conditions = { _id: id };
          return Job.findOne(conditions).exec();
        }
      case 'create/job':
        {
          const { jobname, worker, params }
          const docs = { jobname, worker, params, enqueued: new Date };
          return Job.create(docs);
        }
      case 'update/job':
        {
          const { id, data } = optoins;
          const { dequeued, timeout, delay, status, result } = data;
          const conditions = { _id: id };
          const update = { dequeued, timeout, delay, status, result };
          const params = { upsert: true };
          return Job.update(conditions, update, params).exec();
        }
      case 'delete/job':
        {
          const { id } = optoins;
          const conditions = { _id: id };
          return Job.remove(conditions).exec();
        }
      case 'defrag/jobs':
        {
          const { ids } = options;
          return Job.remove({ _id: { $in: ids.map(id => ObjectId(id)) }}).exec();
        }
      default:
        return new Promise((resolve, reject) => reject({ name: 'error', message: 'request: ' + request }));
    }
  }

  addJob(jobname, worker, params) {
    return this.request('create/job', { jobname, worker, params });
  }

  removeJob(id) {
    return this.request('delete/job', { id })
  }

  replaceJob(id) {
    return this.request('update/job', { id, data })
  }

  getJob(id) {
    return this.request('fetch/job', { id });
  }

  getJobs(jobname, worker) {
    return this.request('fetch/jobs', { jobname, worker })
  }

  garbageJobs(ids) {
    return this.request('defrag/jobs', { ids });
  }
}
JobQueue.displayName = 'JobQueue';
