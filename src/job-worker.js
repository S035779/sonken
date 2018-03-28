import dotenv           from 'dotenv';
import R                from 'ramda';
import Rx               from 'rxjs/Rx';
import { Note, Readed, Traded, Bided, Starred, Listed }
                        from 'Models/feed';
import std              from 'Utilities/stdutils';
import { logs as log }  from 'Utilities/logutils';

dotenv.config();
const env = process.env.NODE_ENV || 'development';

if(env === 'development') {
  log.config('console', 'color',  'job-worker', 'TRACE' );
} else
if(env === 'staging') {
  log.config('file',    'basic',  'job-worker', 'DEBUG' );
} else
if(env === 'production') {
  log.config('file',    'json',   'job-worker', 'INFO'  );
}

const request = (operation, options) => {
  let observable;
  switch(operation) {
    case 'of':
      observable = of(options);
      break;
    case 'schedule':
      observable = schedule(options);
      break;
    case 'from':
      observable = from(options);
      break;
    case 'bindCallback':
      observable = bindCallback(options);
      break;
    case 'bindNodeCallback':
      observable = bindNodeCallback(options);
      break;
    case 'bufferTime':
      observable = bufferTime(options);
    case 'subject':
      observable = subject(options);
  }
  result(observable);
}

const result = (observable) => {
  log.trace('[JOB]', 'just befor subscribe');
  observable.subscribe(
    val => log.debug('[JOB]', 'got value', val)
  , err => log.error('[JOB]', err.name, ':', err.message)
  , ()  => log.info( '[JOB]', 'Complete to worker job.')
  );
  log.trace('[JOB]', 'just after subscribe');
}

const of = () => {
  return Rx.Observable.of('Hello World');
}

const schedule = () => {
  return Rx.Observable.range(1,5)
    .do(val => log.trace('[JOB]', 'set value', val))
    .observeOn(Rx.Scheduler.async);
}

const from = () => {
  return Rx.Observable.from([ 1, 2, 3 ])
    .map(val => val * 2);
}

const bindCallback = () => {
  const fn = (message, callback) => callback('Hello ' + message);
  return Rx.Observable.bindCallback(fn)('World');
}

const bindNodeCallback = () => {
  const fn = require('fs').readdir;
  return Rx.Observable.bindNodeCallback(fn)('./');
}

const bufferTime = () => {
  return Rx.Observable.interval(100)
    .bufferTime(300);
}

const subject = () => {
  const subject = new Rx.Subject();
  return subject;
}

const worker = () => {
  log.info('[JOB]', 'starting worker job.')
  //request('of', {});
  //request('schedule', {});
  //request('from', {});
  //request('bindCallback', {});
  //request('bindNodeCallback', {});
  //request('bufferTime', {});
  request('subject', {});
};
//worker();

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
  log.info('[JOB]', 'worker #1 terminated.');
  log.info('[LOG]', 'log4js #3 terminated.');
  log.close(() => {
    cbk()
  });
};
