import dotenv           from 'dotenv';
import path             from 'path';
import os               from 'os';
import child_process    from 'child_process';
import async            from 'async';
import { Note }         from 'Models/feed';
import std              from 'Utilities/stdutils';
import { logs as log }  from 'Utilities/logutils';

dotenv.config();
const env = process.env.NODE_ENV || 'development';
const cpu_num = os.cpus().length;
const job = path.join(__dirname, 'dist', 'wrk.node.js');

if(env === 'development') {
  log.config('console', 'color',  'job-worker', 'TRACE' );
} else
if(env === 'staging') {
  log.config('file',    'basic',  'job-worker', 'DEBUG' );
} else
if(env === 'production') {
  log.config('file',    'json',   'job-worker', 'INFO'  );
}

const fork = () => {
  const cps = child_process.fork(job);
  cps.on('message', mes =>
    log.info('[JOB]', 'got message.', mes));
  cps.on('error',   err =>
    log.error('[JOB]', err.name, ':', err.message));
  cps.on('disconnect', () =>
    log.info('[JOB]', 'worker disconnected.'));
  cps.on('exit', (code, signal) =>
    log.warn('[JOB]', `worker terminated. (s/c): ${signal || code}`));
  cps.on('close', (code, signal) =>
    log.warn('[JOB]', `worker exit. (s/c): ${signal || code}`));
  log.info('[JOB]', 'forked worker pid', ':', cps.pid);
  return cps;
};

let pids = [];
let idx = 0;
const worker = (task, callback) => {
  idx = idx < cpu_num ? idx : 0;
  log.debug('[JOB]', 'task', task.id, idx, cpu_num);
  if(pids[idx] === undefined || !pids[idx].connected) pids[idx] = fork();
  pids[idx].send(task, err => {
    if(err) log.error('[JOB]', err.name, ':', err.message);
    idx = idx + 1;
    callback();
  });
};

const main = () => {
  log.info('[JOB]', 'start job worker.')
  const task0 = {
    id: '00000000'
  , api: '/search', path: '/search'
  , query: {
      n: 50
    , p: 'nintendo SWITCH'
    }
  };

  const task1 = {
    id: '00000001'
  , api: '/seller', path: '/masatake_12_6'
  , query: {
      n: 50
    , sid: 'masatake_12_6'
    }
  };

  const task2 = {
    id: '00000002'
  , api: '/rss', path: ''
  , query: {
      n: 50
    , p: 'nintendo SWITCH'
    }
  };

  const task3 = {
    id: '00000003'
  , api: '/rss', path: ''
  , query: {
      n: 50
    , sid: 'masatake_12_6'
    }
  };

  const queue = async.queue(worker, cpu_num);
  queue.drain = () => log.info('[JOB]', 'send to request work.');
  std.invoke(() => {
    queue.push(task3, err => {
      if(err) log.error('[JOB]', err.name, ':', err.message);
    });
  }, 0, 1000*60*5);
};
main();

process.on('SIGUSR2', () => shutdown(null, process.exit));
process.on('SIGINT',  () => shutdown(null, process.exit));
process.on('SIGTERM', () => shutdown(null, process.exit));
process.on('uncaughtException', err => shutdown(err, process.exit));
process.on('warning', err => message(err));
process.on('exit',    (code, signal) => message(null, code, signal));

const message = (err, code, signal) => {
  if(err) log.warn('[JOB]', err.name, ':',  err.message);
  else    log.info('[JOB]', `process exit. (s/c): ${signal || code}`);
};

const shutdown = (err, cbk) => {
  if(err) log.error('[JOB]', err.name, ':', err.message);
  log.info('[JOB]', 'scheduler terminated.');
  log.info('[LOG]', 'log4js #3 terminated.');
  log.close(() => {
    cbk()
  });
};
