import sourceMapSupport from 'source-map-support';
import dotenv           from 'dotenv';
import path             from 'path';
import os               from 'os';
import child_process    from 'child_process';
import * as R           from 'ramda';
import { map, flatMap } from 'rxjs/operators';
import Async            from 'async';
import FeedParser       from 'Routes/FeedParser/FeedParser';
import UserProfiler     from 'Routes/UserProfiler/UserProfiler';
import std              from 'Utilities/stdutils';
import log              from 'Utilities/logutils';

sourceMapSupport.install();
const config = dotenv.config();
if(config.error) throw new Error(config.error);

const node_env        = process.env.NODE_ENV    || 'development';
const monitorInterval = process.env.JOB_MON_MIN || 5;
const executeInterval = process.env.JOB_EXE_SEC || 1;
const updatedInterval = process.env.JOB_UPD_MIN || 5;
const numChildProcess = process.env.JOB_NUM_MAX || 1;
const numUpdatedItems = process.env.JOB_UPD_NUM || 100;

const perPageItemTime = 60; // sec. (interval per page)
const perPageItemNums = 100; // items per page.
const procNoteLmtNums = Math.ceil((updatedInterval * 60) / ((numUpdatedItems / perPageItemNums) * perPageItemTime));

process.env.NODE_PENDING_DEPRECATION = 0;

const displayName = '[IMG]';

if(node_env === 'development') {
  log.config('console', 'color', 'img-server', 'TRACE');
} else
if(node_env === 'staging') {
  log.config('file', 'basic', 'img-server', 'DEBUG');
} else
if(node_env === 'production') {
  log.config('file', 'json',  'img-server', 'INFO');
}

const feed = FeedParser.of();
const profile = UserProfiler.of();
const cpu_num = os.cpus().length;
const job_num = numChildProcess <= cpu_num ? numChildProcess : cpu_num;
const job = path.resolve('dist', 'wrk.node.js');
log.info(displayName, 'cpu#:', cpu_num);
log.info(displayName, 'job#:', job_num);
log.info(displayName, 'worker:', job);

const fork = () => {
  const cps = child_process.fork(job);
  cps.on('message', mes => {
    log.info(displayName, 'got message.', mes);
    if(mes.name === 'drain') {
      const queue = Async.queue(worker, cpu_num);
      queue.drain = () => log.info(displayName, 'all images have been processed.');
      request(queue).subscribe(
        obj => log.debug(displayName, 'finished proceeding images...', obj)
      , err => log.error(displayName, err.name, err.message, err.stack)
      , ()  => log.info(displayName, 'post images completed.')
      );
    }
  });
  cps.on('error', err => log.error(displayName, err.name, err.message));
  cps.on('disconnect', () => log.info(displayName, 'worker disconnected.'));
  cps.on('exit', (code, signal) => log.warn(displayName, `worker terminated. (s/c): ${signal || code}`));
  cps.on('close', (code, signal) => log.warn(displayName, `worker exit. (s/c): ${signal || code}`));
  log.info(displayName, 'forked worker pid', ':', cps.pid);
  return cps;
};

const request = queue => {
  const queuePush = obj => {
    if(obj) queue.push(obj, err => err ? log.error(displayName, err.name, err.message, err.stack) : null);
  }; 
  const setQueue = obj => ({ operation: 'images', user: obj.user, id: obj._id, created: Date.now() });
  return profile.fetchJobUsers({ adimn: 'Administrator' }).pipe(
      flatMap(objs => feed.fetchJobNotes({
        users: objs
      , categorys: ['closedsellers', 'closedmarchant']
      , skip: 0
      , limit: procNoteLmtNums
      , sort: 'asc'
      , filter: { isItems: true, isNotImages: true }
      }))
    , map(R.map(setQueue))
    , map(std.invokeMap(queuePush, 0, 1000 * executeInterval, null))
    );
};

let idx=0, pids=[];
const worker = (task, callback) => {
  idx = idx < job_num ? idx : 0;
  log.info(displayName, 'Process is fork. _id/idx:', task.id, idx);
  if(pids[idx] === undefined || !pids[idx].connected) {
    log.info(displayName, 'Process is forked. _id/idx:', task.id, idx);
    pids[idx] = fork();
  }
  pids[idx].send(task, err => {
    if(err) log.error(displayName, err.name, err.message, err.stack);
    callback();
  });
  idx = idx + 1;
};

const main = () => {
  log.info(displayName, 'start fetch images server.')
  const queue = Async.queue(worker, cpu_num);
  queue.drain = () => log.info(displayName, 'all images have been processed.');
  std.invoke(() => request(queue).subscribe(
    obj => log.debug(displayName, 'finished proceeding images...', obj)
  , err => log.error(displayName, err.name, err.message, err.stack)
  , ()  => log.info(displayName, 'post images completed.')
  ), 0, 1000 * 60 * monitorInterval);
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
  log.close(() => cbk());
};

process.on('SIGUSR2', () => shutdown(null, process.exit));
process.on('SIGINT',  () => shutdown(null, process.exit));
process.on('SIGTERM', () => shutdown(null, process.exit));
process.on('uncaughtException', err => shutdown(err, process.exit));
process.on('unhandledRejection', (err, promise) => reject(err, promise));
process.on('rejectionHandled', promise => shrink(promise));
process.on('warning', err => message(err));
process.on('exit', (code, signal) => message(null, code, signal));
