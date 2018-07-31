import dotenv           from 'dotenv';
import R                from 'ramda';
import async            from 'async';
import Yahoo            from 'Utilities/Yahoo';
import std              from 'Utilities/stdutils';
import { logs as log }  from 'Utilities/logutils';
import FeedParser       from 'Routes/FeedParser/FeedParser';

const displayName = 'job-worker';

const yahoo = Yahoo.of();
const feed = FeedParser.of();

dotenv.config();
const node_env = process.env.NODE_ENV || 'development';
const pages = process.env.JOB_UPD_PAGES || 2;

if (node_env === 'development') {
  log.config('console', 'color', displayName, 'TRACE');
} else
if (node_env === 'staging') {
  log.config('file', 'basic', displayName, 'DEBUG');
} else
if (node_env === 'production') {
  log.config('file', 'json', displayName, 'INFO');
}

const request = (operation, { url, user, id, items }) => {
  //log.debug(displayName, operation, user, id, url, items);
  switch(operation) {
    case 'search':
    case 'seller':
      return yahoo.fetchHtml({ url })
        .map(obj => ({ updated: new Date(), items: obj.item }))
        .flatMap(obj => feed.updateHtml({ user, id, html: obj }));
    case 'closedsearch':
      return yahoo.fetchClosedMerchant({ url, pages })
        .map(obj => ({ updated: new Date(), items: obj.item }))
        .flatMap(obj => feed.updateHtml({ user, id, html: obj }));
    case 'closedsellers':
      return yahoo.fetchClosedSellers({ url, pages })
        .map(obj => ({ updated: new Date(), items: obj.item }))
        .flatMap(obj => feed.updateHtml({ user, id, html: obj }));
    case 'rss':
      return yahoo.fetchRss({ url })
        .map(obj => ({ updated: new Date() , items: obj.item }))
        .flatMap(obj => feed.updateRss({ user, id, rss: obj }));
    case 'images':
      return yahoo.fetchImages({ items });
    default:
      return null;
  }
};

const worker = ({ user, id, url, items }, callback) => {
  const api = std.parse_url(url);
  const path = R.split('/', api.pathname);
  const isClosedSellers = api.pathname === '/jp/show/rating';
  const operation = isClosedSellers ? 'closedsellers' : path[1];
  const fetchAuction = request(operation, { url, user, id });
  const fetchImages  = request('images', { items });
  if(fetchAuction) {
    fetchAuction
      .flatMap(fetchImages)
      .subscribe(
        obj => log.info('[JOB]', 'data parse is proceeding...')
      , err => log.error('[JOB]', err.name, ':', err.message, ':', err.stack)
      , ()  => callback()
      );
  } 
};

const main = () => {
  const queue = async.queue(worker, 1);
  queue.drain = () => log.info('[JOB]', 'Completed to work.');
  process.on('message', task => {
    //log.debug('[JOB]', 'got message. pid:', process.pid);
    if(task) queue.push(task, err => {
      if(err) log.error('[JOB]', err.name, ':', err.message);
      log.info('[JOB]', 'finished work. pid:', process.pid);
    });
  });

  process.on('disconnect', () => {
    log.error('[JOB]', 'worker disconnected.')
    shutdown(null, process.exit);
  });
};
main();

process.on('SIGUSR2', () => shutdown(null, process.exit));
process.on('SIGINT',  () => shutdown(null, process.exit));
process.on('SIGTERM', () => shutdown(null, process.exit));
process.on('uncaughtException', err => shutdown(err, process.exit));
process.on('warning', err => message(err));
process.on('exit',    (code, signal) => message(null, code, signal));

const message = (err, code, signal) => {
  if(err) log.error('[JOB]', err.name, ':', err.message, ':', err.stack);
  else    log.info('[JOB]', `worker exit. (s/c): ${signal || code}`);
};

const shutdown = (err, cbk) => {
  if(err) log.error('[JOB]', err.name, ':', err.message, ':', err.stack);
  log.info('[JOB]', 'worker terminated.');
  log.info('[LOG]', 'log4js #4 terminated.');
  log.close(() => cbk());
};
