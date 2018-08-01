import sourceMapSupport from 'source-map-support';
import dotenv           from 'dotenv';
import * as R           from 'ramda';
import { flatMap, map } from 'rxjs/operators';
import async            from 'async';
import Yahoo            from 'Utilities/Yahoo';
import std              from 'Utilities/stdutils';
import { logs as log }  from 'Utilities/logutils';
import FeedParser       from 'Routes/FeedParser/FeedParser';

sourceMapSupport.install();
const config = dotenv.config();
if(config.error) throw config.error();

const node_env  = process.env.NODE_ENV      || 'development';
const pages     = process.env.JOB_UPD_PAGES || 2;
process.env.NODE_PENDING_DEPRECATION=0;

const displayName = '[JOB]';

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

const request = (operation, { url, user, id, items }) => {
  //log.debug(displayName, operation, user, id, url, !!items);
  const setNote = obj => ({ updated: new Date(), items: obj.item });
  const putHtml = obj => feed.updateHtml({ user, id, html: obj });
  const putRss  = obj => feed.updateRss({ user, id, rss: obj });
  switch(operation) {
    case 'search':
    case 'seller':
      return yahoo.fetchHtml({ url })
        .pipe(map(setNote), flatMap(putHtml));
    case 'closedsearch':
      return yahoo.fetchClosedMerchant({ url, pages })
        .pipe(map(setNote), flatMap(putHtml));
    case 'closedsellers':
      return yahoo.fetchClosedSellers({ url, pages })
        .pipe(map(setNote), flatMap(putHtml));
    case 'rss':
      return yahoo.fetchRss({ url })
        .pipe(map(setNote), flatMap(putRss));
    case 'images':
      return yahoo.fetchImages({ items });
    default:
      return null;
  }
};

const worker = ({ user, id, url, items }, callback) => {
  if(items) {
    const fetchImages = request('images', { items });
    fetchImages.subscribe(
        obj => log.info(displayName, 'image download is proceeding...')
      , err => log.error(displayName, err.name, err.message, err.stack)
      , ()  => callback()
      );
  } else {
    const api = std.parse_url(url);
    const path = R.split('/', api.pathname);
    const isClosedSellers = api.pathname === '/jp/show/rating';
    const operation = isClosedSellers ? 'closedsellers' : path[1];
    const fetchAuction = request(operation, { url, user, id });
    fetchAuction.subscribe(
        obj => log.info(displayName, 'data parse is proceeding...')
      , err => log.error(displayName, err.name, err.message, err.stack)
      , ()  => callback()
      );
  }
};

const main = () => {
  const queue = async.queue(worker, 1);
  queue.drain = () => log.info(displayName, 'Completed to work.');
  process.on('message', task => {
    //log.debug(displayName, 'got message. pid:', process.pid);
    if(task) queue.push(task, err => {
      if(err) log.error(displayName, err.name, err.message);
      log.info(displayName, 'finished work. pid:', process.pid);
    });
  });

  process.on('disconnect', () => {
    log.error(displayName, 'worker disconnected.')
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
