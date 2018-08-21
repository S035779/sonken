import sourceMapSupport from 'source-map-support';
import dotenv           from 'dotenv';
import * as R           from 'ramda';
import { flatMap, map } from 'rxjs/operators';
import async            from 'async';
import FeedParser       from 'Routes/FeedParser/FeedParser';
import Yahoo            from 'Utilities/Yahoo';
import std              from 'Utilities/stdutils';
import log              from 'Utilities/logutils';
//import fs             from 'fs';
import aws              from 'Utilities/awsutils';

sourceMapSupport.install();
const config = dotenv.config();
if(config.error) throw config.error();

const node_env  = process.env.NODE_ENV      || 'development';
const pages     = process.env.JOB_UPD_PAGES || 2;
process.env.NODE_PENDING_DEPRECATION=0;

const displayName = '[WRK]';

if (node_env === 'development') {
  log.config('console', 'color', 'job-worker', 'TRACE');
} else
if (node_env === 'staging') {
  log.config('file', 'basic', 'job-worker', 'DEBUG');
} else
if (node_env === 'production') {
  log.config('file', 'json', 'job-worker', 'INFO');
}

const yahoo = Yahoo.of();
const feed = FeedParser.of();
const Aws   = aws.of({ 
  access_key: process.env.AWS_ACCESS_KEY
, secret_key: process.env.AWS_SECRET_KEY
, region:     process.env.AWS_REGION_NAME
});

const createWriteStream = (storage, filename) => {
  const operator = Aws.createWriteStream(storage, filename);
  //const operator = fs.createWriteStream(path.resolve(storage, filename)); 
  return operator;
}

const request = (operation, { url, user, id, items }) => {
  const setNote = obj => ({ updated: new Date(), items: obj.item });
  const putHtml = obj => feed.updateHtml({ user, id, html: obj });
  //const putRss  = obj => feed.updateRss({ user, id, rss: obj });
  const operator = createWriteStream;
  switch(operation) {
    case 'search':
    case 'seller':
      return yahoo.jobHtml({ url }).pipe(map(setNote), flatMap(putHtml));
    case 'closedsearch':
      return yahoo.jobClosedMerchant({ url, pages }).pipe(map(setNote), flatMap(putHtml));
    case 'closedsellers':
      return yahoo.jobClosedSellers({ url, pages }).pipe(map(setNote), flatMap(putHtml));
    //case 'rss':
    //  return yahoo.jobRss({ url }).pipe(map(setNote), flatMap(putRss));
    case 'images':
      return yahoo.jobImages({ items, operator });
    default:
      return null;
  }
};

const worker = ({ url, user, id, items }, callback) => {
  let operation = '';
  let observable = null;
  if(url) {
    const api = std.parse_url(url);
    const path = R.split('/', api.pathname);
    const isClosedSellers = api.pathname === '/jp/show/rating';
    operation  = isClosedSellers ? 'closedsellers' : path[1];
    observable = request(operation, { url, user, id });
  } else if(items) {
    operation  = 'images';
    observable = request(operation, { items });
  }
  if(observable) observable.subscribe(
    obj => log.info(displayName, operation, 'is proceeding... pid:', process.pid)
  , err => log.error(displayName, err.name, err.message, err.stack, 'pid:', process.pid)
  , ()  => callback()
  );
};

const main = () => {
  const queue = async.queue(worker, 1);
  queue.drain = () => log.info(displayName, 'completed to work.');
  process.on('message', task => {
    log.info(displayName, 'got message. pid:', process.pid, task);
    if(task) queue.push(task, err => {
      if(err) log.error(displayName, err.name, err.message, err.stack, 'pid:', process.pid);
      log.info(displayName, 'finished work. pid:', process.pid);
    });
  });

  process.on('disconnect', () => {
    log.error(displayName, 'worker disconnected. pid:', process.pid)
    shutdown(null, process.exit);
  });
};
main();

const rejections = new Map();
const reject = (err, promise) => {
  const { name, message, stack } = err;
  log.warn(displayName, 'unhandledRejection', name, message, stack || promise);
  rejections.set(promise, err);
};
const shrink = promise => {
  log.warn(displayName, 'rejectionHandled', rejections, promise);
  rejections.delete(promise);
};

const message = (err, code, signal) => {
  if(err) log.error(displayName, err.name, err.message, err.stack, 'pid:', process.pid);
  else    log.info(displayName, `worker exit. (s/c): ${signal || code}`);
};

const shutdown = (err, cbk) => {
  if(err) log.error(displayName, err.name, err.message, err.stack, 'pid:', process.pid);
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
