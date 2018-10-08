import sourceMapSupport           from 'source-map-support';
import dotenv                     from 'dotenv';
import * as R                     from 'ramda';
import { throwError }             from 'rxjs';
import { flatMap, map }           from 'rxjs/operators';
import async                      from 'async';
import FeedParser                 from 'Routes/FeedParser/FeedParser';
import Yahoo                      from 'Utilities/Yahoo';
import log                        from 'Utilities/logutils';
import aws                        from 'Utilities/awsutils';

sourceMapSupport.install();
const config = dotenv.config();
if(config.error) throw config.error();
const node_env  = process.env.NODE_ENV    || 'development';
const numbers   = process.env.JOB_UPD_NUM || 1000;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_REGION_NAME = process.env.AWS_REGION_NAME;
const aws_keyset = { access_key: AWS_ACCESS_KEY, secret_key: AWS_SECRET_KEY, region: AWS_REGION_NAME };
process.env.NODE_PENDING_DEPRECATION = 0;

const displayName = `[WRK] (${process.pid})`;

if (node_env === 'development') {
  log.config('console', 'color', 'job-worker', 'TRACE');
} else
if (node_env === 'staging') {
  log.config('file', 'basic', 'job-worker', 'DEBUG');
} else
if (node_env === 'production') {
  log.config('file', 'json', 'job-worker', 'INFO');
}

const request = (operation, { url, user, id, items }) => {
  const yahoo = Yahoo.of();
  const feed  = FeedParser.of();
  const setNote = obj => ({ updated: new Date(), items: obj.item });
  const putHtml = obj => feed.updateHtml({ user, id, html: obj });
  const putRss  = obj => feed.updateRss({ user, id, rss: obj });
  const setIds  = R.map(obj => obj._id);
  switch(operation) {
    case 'search':
    case 'seller':
      return yahoo.jobHtml({ url }).pipe(map(setNote), flatMap(putHtml));
    case 'closedsearch':
      return yahoo.jobClosedMerchant({ url, pages: Math.ceil(numbers / 100) })
        .pipe(map(setNote), flatMap(putHtml));
    case 'closedsellers':
      return yahoo.jobClosedSellers({ url, pages: Math.ceil(numbers / 25) })
        .pipe(map(setNote), flatMap(putHtml));
    case 'rss':
      return yahoo.jobRss({ url }).pipe(map(setNote), flatMap(putRss));
    case 'images':
      return yahoo.jobImages({
        items, operator: (storage, filename) => aws.of(aws_keyset).createWriteStream(storage, filename)
      });
    case 'defrag':
      return feed.defragItems({ user, ids: setIds(items) });
    default:
      return throwError('Unknown operation!');
  }
};

const worker = ({ url, user, id, items, operation }, callback) => {
  log.info(displayName, 'Started. _id/ope:', id, operation);
  const start_time = Date.now();
  request(operation, { url, user, id, items }).subscribe(
    obj => log.info(displayName, 'Proceeding... _id/ope/status:', id, operation, obj)
  , err => log.error(displayName, err.name, err.message, err.stack)
  , ()  => {
      const end_time = Date.now();
      const time_lap = (end_time - start_time) / 1000;
      log.info(displayName, `Completed. _id: ${id}, time: ${time_lap} sec.`);
      callback();
  });
};

const main = () => {
  const queue = async.queue(worker);
  const wait        = () => queue.length();
  const runs        = () => queue.running();
  const idle        = () => queue.idle() ? '[idle]' : '[busy]';
  //const paused      = () => queue.paused ? '[paused]' : '[resume]';
  //const started     = () => queue.stated ? '[start]'  : '[stop]';
  //const list        = () => queue.workersList();
  queue.concurrency = 1;
  queue.buffer      = 1;
  queue.saturated   = () => log.debug(displayName, '== Saturated.   wait/runs:', wait(), runs(), idle());
  queue.unsaturated = () => log.debug(displayName, '== Unsaturated. wait/runs:', wait(), runs(), idle());
  queue.empty       = () => log.debug(displayName, '== Last.        wait/runs:', wait(), runs(), idle());
  queue.drain       = () => log.debug(displayName, '== Drain.       wait/runs:', wait(), runs(), idle());
  queue.error       = (err, task) => log.error(displayName, err.name, err.message, task);
  process.on('disconnect', () => shutdown(null, process.exit));
  process.on('message', task => {
    if(task) {
      log.info(displayName, 'Received. _id/ope:', task.id, task.operation);
      queue.push(task, err => err 
        ? log.error(displayName, err.name, err.message, err.stack) 
        : log.info(displayName, 'Finished. _id/ope:', task.id, task.operation)
      );
      queue.remove(({ data }) => {
        if(Date.now() - new Date(data.created).getTime() > (24 * 60 * 60 * 1000)) {
          log.info(displayName, 'Removed. _id/ope:', data.id, data.operation);
          return true;
        }
        return false;
      });
    }
  });
};
main();

const rejections = new Map();
const reject = (err, promise) => {
  log.warn(displayName, 'unhandledRejection', err.name, err.message, err.stack || promise);
  rejections.set(promise, err);
};
const shrink = promise => {
  log.warn(displayName, 'rejectionHandled', rejections, promise);
  rejections.delete(promise);
};

const message = (err, code, signal) => {
  if(err) log.error(displayName, err.name, err.message, err.stack);
  else    log.info(displayName, `worker exit. (s/c): ${signal || code}`);
};

const shutdown = (err, cbk) => {
  if(err) log.error(displayName, err.name, err.message, err.stack);
  log.info(displayName, 'worker terminated.');
  log.info(displayName, 'log4js #4 terminated.');
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
