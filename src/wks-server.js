import sourceMapSupport from 'source-map-support';
import dotenv           from 'dotenv';
import path             from 'path';
import os               from 'os';
import child_process    from 'child_process';
import * as R           from 'ramda';
import { map, flatMap } from 'rxjs/operators';
import Agenda           from 'agenda';
import FeedParser       from 'Routes/FeedParser/FeedParser';
import UserProfiler     from 'Routes/UserProfiler/UserProfiler';
import std              from 'Utilities/stdutils';
import log              from 'Utilities/logutils';

sourceMapSupport.install();
const config = dotenv.config();
if(config.error) throw config.error;

const node_env        = process.env.NODE_ENV    || 'development';
const monitorInterval = process.env.JOB_MON_MIN || 5;
const executeInterval = process.env.JOB_EXE_SEC || 1;
const updatedInterval = process.env.JOB_UPD_MIN || 5;
const numChildProcess = process.env.JOB_NUM_MAX || 1;
const numUpdatedItems = process.env.JOB_UPD_NUM || 100;
const mdb_url         = process.env.MDB_URL     || 'mongodb://localhost:27017';
process.env.NODE_PENDING_DEPRECATION = 0;

const displayName = '[WKS]';

if(node_env === 'development') {
  log.config('console', 'color', 'wks-server', 'TRACE');
} else
if(node_env === 'staging') {
  log.config('file', 'basic', 'wks-server', 'DEBUG');
} else
if(node_env === 'production') {
  log.config('file', 'json',  'wks-server', 'INFO');
}

const jobName = 'job-worker';
const options = {
  db: { address: mdb_url + '/queue', collection: 'jobs', options: { useNewUrlParser: true } }
, name: 'wks-worker'
, processEvery: '5 seconds'
, maxConcurrency: 20
, defaultConcurrency: 5 
, lockLimit: 0
, defaultLockLimit: 0
, defaultLockLifetime: 5000
, sort: { nextRunAt: 1, priority: -1 }
};
const agenda = new Agenda(options);
const feed = FeedParser.of();
const profile = UserProfiler.of();
const cpu_num = os.cpus().length;
const job_num = numChildProcess <= cpu_num ? numChildProcess : cpu_num;
const job = path.resolve(__dirname, 'dist', 'wrk.node.js');
log.info(displayName, 'cpu#:', cpu_num);
log.info(displayName, 'job#:', job_num);
log.info(displayName, 'worker:', job);

const fork = () => {
  const cps = child_process.fork(job);
  cps.on('message', mes => log.info(displayName, 'got message.', mes));
  cps.on('error', err => log.error(displayName, err.name, err.message));
  cps.on('disconnect', () => log.info(displayName, 'worker disconnected.'));
  cps.on('exit', (code, signal) => log.warn(displayName, `worker terminated. (s/c): ${signal || code}`));
  cps.on('close', (code, signal) => log.warn(displayName, `worker exit. (s/c): ${signal || code}`));
  log.info(displayName, 'forked worker pid', ':', cps.pid);
  return cps;
};

const request = agenda => {
  const queuePush = obj => {
    if(obj) agenda.now(obj, err => err ? log.error(displayName, err.name, err.message, err.stack) : null);
  }; 
  const setQueue    = obj => ({
    operation:  'download/items'
  , user:       obj.user
  , params:     { ids: obj.ids, category: obj.category, filter: obj.filter, type: obj.type }
  , created:    Date.now()
  });
  return profile.fetchJobUsers({ adimn: 'Administrator' }).pipe(
      flatMap(objs => feed.fetchJobNotes({
        users: objs
      , categorys: ['closedmarchant', 'closedsellers']
      , skip: 0, limit: Math.ceil((updatedInterval * 60) / ((numUpdatedItems / 100) * 2)), sort: 'desc'
      , filter: { isItems: true, isImages: true, expire: Date.now() - numUpdatedItems * 60 * 1000 }
      }))
    , map(R.map(setQueue))
    , map(std.invokeMap(queuePush, 0, 1000 * executeInterval, null))
    );
};

let idx=0, pids=[];
const worker = () => {
  idx = idx < job_num ? idx : 0;
  log.info(displayName, 'Process is fork. idx:', idx);
  if(pids[idx] === undefined || !pids[idx].connected) {
    log.info(displayName, 'Process is forked. idx:', idx);
    pids[idx] = fork();
  }
  idx = idx + 1;
};

const main = async () => {
  log.info(displayName, 'start fetch works server.')
  await agenda.start();
  await worker();
  await std.invoke(() => request(agenda).subscribe(
    obj => log.debug(displayName, 'finished proceeding works...', obj)
  , err => log.error(displayName, err.name, err.message, err.stack)
  , ()  => log.info(displayName, 'post works completed.')
  ), 0, 1000 * 60 * monitorInterval);
  const jobs = await agenda.jobs({ name: jobName });
  await log.debug('jobs:', jobs.length);
};
main();

const rejections = new Map();
const reject = (err, promise) => {
  const { name, message, stack } = err;
  log.error(displayName, 'unhandledRejection', name, message, stack || promise);
  rejections.set(promise, err);
};
const shrink = promise => {
  log.warn(displayName, 'rejectionHandled', rejections, promise);
  rejections.delete(promise);
};

const message = (err, code, signal) => {
  if(err) log.warn(displayName, err.name,  err.message, err.stack);
  else    log.info(displayName, `process exit. (s/c): ${signal || code}`);
};

const shutdown = (err, cbk) => {
  if(err) log.error(displayName, err.name, err.message, err.stack);
  log.info(displayName, 'scheduler terminated.');
  log.info(displayName, 'log4js #3 terminated.');
  agenda.stop(() => log.close(() => cbk()));
};

agenda.on('ready', () => log.info(displayName, 'mongo connection successfully.'));
agenda.on('error', err => log.error(displayName, 'mongo connection error.', err));
process.on('SIGUSR2', () => shutdown(null, process.exit));
process.on('SIGINT',  () => shutdown(null, process.exit));
process.on('SIGTERM', () => shutdown(null, process.exit));
process.on('uncaughtException', err => shutdown(err, process.exit));
process.on('unhandledRejection', (err, promise) => reject(err, promise));
process.on('rejectionHandled', promise => shrink(promise));
process.on('warning', err => message(err));
process.on('exit', (code, signal) => message(null, code, signal));
