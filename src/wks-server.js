import sourceMapSupport from 'source-map-support';
import dotenv           from 'dotenv';
import path             from 'path';
import os               from 'os';
import child_process    from 'child_process';
import log              from 'Utilities/logutils';

sourceMapSupport.install();
const config = dotenv.config();
if(config.error) throw new Error(config.error);

const node_env        = process.env.NODE_ENV    || 'development';
const numChildProcess = process.env.JOB_NUM_MAX || 1;
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

const cpu_num = os.cpus().length;
const job_num = numChildProcess <= cpu_num ? numChildProcess : cpu_num;
const job = path.resolve('dist', 'wrk.node.js');
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

const main = () => {
  log.info(displayName, 'start fetch works server.')
  worker();
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

setInterval(() => {
  const used = process.memoryUsage()
  const messages = []
  for (let key in used) messages.push(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  log.info(displayName, 'memory usage', messages.join(', '));
  //if(env === 'development') process.emit('SIGUSR1');
}, 5 * 60 * 1000)

process.on('SIGUSR1', () => import('heapdump').then(h => h.writeSnapshot(path.resolve('tmp', Date.now() + '.heapsnapshot'))));
process.on('SIGUSR2', () => shutdown(null, process.exit));
process.on('SIGINT',  () => shutdown(null, process.exit));
process.on('SIGTERM', () => shutdown(null, process.exit));
process.on('uncaughtException', err => shutdown(err, process.exit));
process.on('unhandledRejection', (err, promise) => reject(err, promise));
process.on('rejectionHandled', promise => shrink(promise));
process.on('warning', err => message(err));
process.on('exit', (code, signal) => message(null, code, signal));
