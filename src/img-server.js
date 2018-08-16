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
process.env.NODE_PENDING_DEPRECATION=0;

const displayName = '[IMG]';

if(node_env === 'development') {
  log.config('console', 'color', 'img-server', 'TRACE' );
} else
if(node_env === 'staging') {
  log.config('file',    'basic', 'img-server', 'DEBUG' );
} else
if(node_env === 'production') {
  log.config('file',    'json',  'img-server', 'INFO'  );
}

const feed        = FeedParser.of();
const profile     = UserProfiler.of();
const cpu_num     = os.cpus().length;
const job         = path.resolve(__dirname, 'dist', 'wrk.node.js');

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

const request = queue => {
  const queuePush = obj => {
    if(obj) queue.push(obj, err => {
      if(err) log.error(displayName, err.name, err.message, err.stack);
    });
  }; 
  const isOldItem = obj => {
    const now = Date.now();
    const upd = new Date(obj.updated).getTime();
    const int = updatedInterval * 1000 * 60;
    return now - upd > int;
  };
  const setQueue = obj => obj ? { items: obj.items } : null;
  const setNote = objs => feed.fetchAllNotes({ users: objs });
  return profile.fetchUsers({ adimn: 'Administrator' }).pipe(
      map(R.filter(obj => obj.approved))
    , map(R.map(obj => obj.user))
    , flatMap(setNote)
    , map(R.flatten)
    , map(R.filter(obj => obj.url !== ''))
    , map(R.filter(isOldItem))
    , map(R.map(setQueue))
    , map(std.invokeMap(queuePush, 0, 1000 * executeInterval, null))
    );
};

const worker = (task, callback) => {
  idx = idx < cpu_num ? idx : 0;
  //log.debug(displayName, 'task(id/idx#/cpu#)', task.id, idx, cpu_num);
  if(pids[idx] === undefined || !pids[idx].connected) pids[idx] = fork();
  pids[idx].send(task, err => {
    if(err) log.error(displayName, err.name, err.message, err.stack);
    callback();
  });
  idx = idx + 1;
};

const main = () => {
  log.info(displayName, 'start fetch images server.')
  const queue = async.queue(worker, cpu_num);
  queue.drain = () => log.info(displayName, 'send to request fetch images.');

  std.invoke(() => request(queue).subscribe(
    obj => log.trace(displayName, 'fetch images request is proceeding...')
  , err => log.error(displayName, err.name, err.message, err.stack)
  , ()  => log.info(displayName, 'fetch images request completed.')
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