import dotenv           from 'dotenv';
import path             from 'path';
import os               from 'os';
import child_process    from 'child_process';
import R                from 'ramda';
import async            from 'async';
import std              from 'Utilities/stdutils';
import { logs as log }  from 'Utilities/logutils';
import FeedParser       from 'Routes/FeedParser/FeedParser';
import UserProfiler     from 'Routes/UserProfiler/UserProfiler';

const config = dotenv.config();
if(config.error) throw config.error;

const displayName = 'job-server';
const env             = process.env.NODE_ENV    || 'development';
const monitorInterval = process.env.JOB_MON_MIN || 5;
const executeInterval = process.env.JOB_EXE_SEC || 1;
const updatedInterval = process.env.JOB_UPD_MIN || 10;
if(env === 'development') {
  log.config('console', 'color', displayName, 'TRACE' );
} else
if(env === 'staging') {
  log.config('file',    'basic', displayName, 'DEBUG' );
} else
if(env === 'production') {
  log.config('file',    'json',  displayName, 'INFO'  );
}

const feed        = FeedParser.of();
const profile     = UserProfiler.of();
const cpu_num     = os.cpus().length;
const job         = path.join(__dirname, 'dist', 'wrk.node.js');

let pids = [];
let idx  = 0;

const fork = () => {
  const cps = child_process.fork(job);
  cps.on('message',           mes => log.info('[JOB]', 'got message.', mes));
  cps.on('error',             err => log.error('[JOB]', err.name, ':', err.message));
  cps.on('disconnect',         () => log.info('[JOB]', 'worker disconnected.'));
  cps.on('exit',   (code, signal) => log.warn('[JOB]', `worker terminated. (s/c): ${signal || code}`));
  cps.on('close',  (code, signal) => log.warn('[JOB]', `worker exit. (s/c): ${signal || code}`));
  log.info('[JOB]', 'forked worker pid', ':', cps.pid);
  return cps;
};

const request = queue => {
  const queuePush = obj => {
    if(obj) queue.push(obj, err => {
      if(err) log.error('[JOB]', err.name,':', err.message,':', err.stack);
    });
  }; 
  const isOldItem = obj => {
    const now = Date.now();
    const upd = new Date(obj.updated).getTime();
    const int = updatedInterval * 1000 * 60;
    log.debug(displayName, now, upd, int, now - upd > int);
    return now - upd > int;
  };
  const setQueue = obj => obj ? { user: obj.user, id: obj._id, api: obj.url } : null;
  const exe = 1000 * executeInterval;
  return profile.fetchUsers({ adimn: 'Administrator' })
    .map(R.filter(obj => obj.approved))
    .map(R.map(obj => obj.user))
    .flatMap(objs => feed.fetchAllNotes({ users: objs }))
    .map(R.flatten)
    .map(R.filter(obj => obj.url !== ''))
    .map(R.filter(isOldItem))
    .map(R.map(setQueue))
    .map(std.invokeMap(queuePush, 0, exe, null))
  ;
};

const worker = (task, callback) => {
  idx = idx < cpu_num ? idx : 0;
  log.debug('[JOB]', 'task(id/idx#/cpu#)', task.id, idx, cpu_num);
  if(pids[idx] === undefined || !pids[idx].connected) pids[idx] = fork();
  pids[idx].send(task, err => {
    if(err) log.error('[JOB]', err.name,':', err.message,':', err.stack);
    callback();
  });
  idx = idx + 1;
};

const main = () => {
  log.info('[JOB]', 'start job worker.')
  const queue = async.queue(worker, cpu_num);
  queue.drain = () => log.info('[JOB]', 'send to request work.');
  std.invoke(() => request(queue).subscribe(
    obj => log.debug('[JOB]', 'fetch notes is proceeding...')
  , err => log.error('[JOB]', err.name, ':', err.message, ':', err.stack)
  , ()  => log.info('[JOB]', 'Completed to fetch notes.')
  ), 0, 1000 * 60 * monitorInterval);
};
main();

process.on('SIGUSR2', () => shutdown(null, process.exit));
process.on('SIGINT',  () => shutdown(null, process.exit));
process.on('SIGTERM', () => shutdown(null, process.exit));
process.on('uncaughtException', err => shutdown(err, process.exit));
process.on('warning',           err => message(err));
process.on('exit',   (code, signal) => message(null, code, signal));

const message = (err, code, signal) => {
  if(err) log.warn('[JOB]', err.name,':',  err.message,':', err.stack);
  else    log.info('[JOB]', `process exit. (s/c): ${signal || code}`);
};

const shutdown = (err, cbk) => {
  if(err) log.error('[JOB]', err.name, ':', err.message, ':', err.stack);
  log.info('[JOB]', 'scheduler terminated.');
  log.info('[LOG]', 'log4js #3 terminated.');
  log.close(() => cbk());
};
