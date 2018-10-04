import sourceMapSupport from 'source-map-support';
import dotenv           from 'dotenv';
import path             from 'path';
import os               from 'os';
import child_process    from 'child_process';
import * as R           from 'ramda';
import { map, flatMap } from 'rxjs/operators';
import async            from 'async';
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
const updatedInterval = process.env.JOB_UPD_MIN || 10;
const numsOfChildProc = process.env.JOB_NUM_MAX || 1;
process.env.NODE_PENDING_DEPRECATION = 0;

const displayName = '[JOB]';

if(node_env === 'development') {
  log.config('console', 'color', 'job-server', 'TRACE' );
} else
if(node_env === 'staging') {
  log.config('file',    'basic', 'job-server', 'DEBUG' );
} else
if(node_env === 'production') {
  log.config('file',    'json',  'job-server', 'INFO'  );
}

const feed        = FeedParser.of();
const profile     = UserProfiler.of();
const cpu_num     = os.cpus().length;
const job_num     = numsOfChildProc < cpu_num ? numsOfChildProc : cpu_num;
const job         = path.resolve(__dirname, 'dist', 'wrk.node.js');
log.info(displayName, 'worker:', job);

let pids = [];
let idx  = 0;

const fork = () => {
  const cps = child_process.fork(job);
  cps.on('message',            mes => log.info(displayName, 'got message.', mes));
  cps.on('error',              err => log.error(displayName, err.name, err.message));
  cps.on('disconnect',          () => log.info(displayName, 'worker disconnected.'));
  cps.on('exit',    (code, signal) => log.warn(displayName, `worker terminated. (s/c): ${signal || code}`));
  cps.on('close',   (code, signal) => log.warn(displayName, `worker exit. (s/c): ${signal || code}`));
  log.info(displayName, 'forked worker pid', ':', cps.pid);
  return cps;
};

const operation = url => {
  const api       = std.parse_url(url);
  const path      = R.split('/', api.pathname);
  return api.pathname === '/jp/show/rating' ? 'closedsellers' : path[1];
};

const request = queue => {
  const queuePush = obj => {
    if(obj) queue.push(obj, err => {
      if(err) log.error(displayName, err.name, err.message, err.stack);
    });
  }; 
  const setQueue    = obj => ({ 
    user: obj.user, id: obj._id, url: obj.url, operation: operation(obj.url), created: Date.now()
  });
  const setQueues   = R.map(setQueue);
  const setNote     = objs => feed.fetchAllNotes({ users: objs });
  const hasApproved = R.filter(obj => obj.approved);
  const setUsers    = R.map(obj => obj.user);
  const hasUrl      = R.filter(obj => obj.url !== '');
  const interval    = updatedInterval * 1000 * 60;
  const isOldItem   = obj => interval < Date.now() - new Date(obj.updated).getTime();
  const hasOldItem  = R.filter(isOldItem);
  const isOpened    = obj => operation(obj.url) === 'seller' || operation(obj.url) === 'search';
  const hasOpened   = R.filter(isOpened);
  return profile.fetchUsers({ adimn: 'Administrator' }).pipe(
      map(hasApproved)
    , map(setUsers)
    , flatMap(setNote)
    , map(R.flatten)
    , map(hasUrl)
    , map(hasOldItem)
    , map(hasOpened)
    , map(setQueues)
    , map(std.invokeMap(queuePush, 0, 1000 * executeInterval, null))
    );
};

const worker = (task, callback) => {
  idx = idx < job_num ? idx : 0;
  //log.debug(displayName, 'task(id/idx#/cpu#)', task.id, idx, cpu_num);
  if(pids[idx] === undefined || !pids[idx].connected) pids[idx] = fork();
  pids[idx].send(task, err => {
    if(err) log.error(displayName, err.name, err.message, err.stack);
    callback();
  });
  idx = idx + 1;
};

const main = () => {
  log.info(displayName, 'Start JOB Server.')
  const queue = async.queue(worker, cpu_num);
  queue.drain = () => log.info(displayName, 'all jobs have been processed.');

  std.invoke(() => request(queue).subscribe(
    obj => log.debug(displayName, 'finished proceeding job...', obj)
  , err => log.error(displayName, err.name, err.message, err.stack)
  , ()  => log.info(displayName, 'post jobs completed.')
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
