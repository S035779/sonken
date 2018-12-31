import Agenda from 'agenda';
import log    from 'Utilities/logutils';

const mdb_url = process.env.MDB_URL || 'mongodb://localhost:27017';
const params = {
  db: { 
    address: mdb_url + '/queue'
  , collection: 'jobs'
  , options: {
      useNewUrlParser: true
    , reconnectTries: Number.MAX_VALUE  // Never stop trying to reconnect
    , reconnectInterval: 500            // Reconnect every 500ms
    }
  }
, processEvery: '10 seconds'
, maxConcurrency: 100
, lockLimit: 100
, defaultLockLifetime: 10000
, sort: { nextRunAt: 1, priority: -1 }
};

const queue = (workerName, concurrent) => {
  return new Promise((resolve, reject) => {
    const agenda = new Agenda(params);
    agenda.name(workerName);
    if(concurrent !== 0) {
      agenda
        .defaultConcurrency(concurrent)
        .defaultLockLimit(concurrent);
    }
    agenda.on('ready', () => {
      //log.info(workerName, 'mongo connection successfully.');
      resolve(agenda);
    });
    agenda.on('error', err => {
      log.error(workerName, 'mongo connection error.', err);
      reject(err);
    });
  });
};

const enqueue = (workerName, jobName, datas) => {
  return queue(workerName)
    .then(async queue => {

      await queue.start();
      //log.debug(workerName, '>>> start');

      for (let data of datas) {
        await queue.create(jobName, data).save();
        //log.debug(workerName, '>>> job added', data);
      }

      return queue;
    }).then(queue => queue.stop());
};

const dequeue = (workerName, jobName, concurrent, callback) => {
  return queue(workerName, concurrent)
    .then(async queue => {
      queue.define(jobName, { lockLifetime: 10000 }, (obj, done) => {
        //log.info(workerName, '<<< job (data/next/lock)', obj.attrs.data, ' / ', obj.attrs.nextRunAt, ' / ', obj.attrs.lockedAt);
        callback(obj.attrs.data, done);
      });

      await queue.start();
      //log.debug(workerName, '>>> start');

      await queue.cancel({ name: jobName });
      //log.debug(workerName, '>>> cancel');

      const objs = await queue.jobs({ name: jobName })
      log.info(workerName, '>>> jobs length:', objs.length);

      //queue.on('start:'     + jobName, job =>         log.debug('start:',     job.attrs.lockedAt,   job.attrs.lastRunAt));
      //queue.on('complete:'  + jobName, job =>         log.debug('complete:',  job.attrs.lastRunAt,  job.attrs.lastFinishedAt));
      queue.on('success:'   + jobName, job =>         log.info( 'success:',   job.attrs.lastRunAt,  job.attrs.lastFinishedAt));
      queue.on('fail:'      + jobName, (err, job) =>  log.error('fail:',      job.attrs.failedAt,   job.attrs.failReason));

      return queue;
    });
}

const queueList = (workerName, conditions) => {
  //log.debug(workerName, 'QueueList', { workerName, conditions });
  return queue(workerName)
    .then(async queue => {
      await queue.start();
      const jobs = await queue.jobs(conditions);
      return { queue, data: jobs }; 
    }).then(obj => {
      obj.queue.stop();
      return obj.data;
    });
};

const queueDelete = (workerName, conditions) => {
  return queue(workerName)
    .then(async queue => {
      await queue.start();
      await queue.cancel(conditions);
      return queue;
    }).then(queue => queue.stop());
};
export default { queue, enqueue, dequeue, queueList, queueDelete };
