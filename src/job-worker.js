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
const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  log.config('console', 'color', displayName, 'TRACE');
} else
if (env === 'staging') {
  log.config('file', 'basic', displayName, 'DEBUG');
} else
if (env === 'production') {
  log.config('file', 'json', displayName, 'INFO');
}

const request = (api, { user, id }) => {
  const url = api.toString();
  const path = R.split('/', api.pathname);
  const operation = api.pathname === '/jp/show/rating' ? 'closedsellers' : path[1];
  log.debug(displayName, operation, user, id, url);
  switch(operation) {
    case 'search':
    case 'seller':
      return yahoo.fetchHtml({ url })
        .map(     obj => ({ updated: new Date(), items: obj.item }))
        .flatMap( obj => feed.updateHtml({ user, id, html: obj }));
    case 'closedsearch':
      return yahoo.fetchClosedMerchant({ url })
        .map(     obj => ({ updated: new Date(), items: obj.item }))
        .flatMap( obj => feed.updateHtml({ user, id, html: obj }));
    case 'closedsellers':
      return yahoo.fetchClosedSellers({ url, pages: 10 })
        .map(     obj => ({ updated: new Date(), items: obj.item }))
        .flatMap( obj => feed.updateHtml({ user, id, html: obj }));
    case 'rss':
      return yahoo.fetchRss({ url })
        .map(     obj => ({ updated: new Date() , items: obj.item }))
        .flatMap( obj => feed.updateRss({ user, id, rss: obj }));
    default:
      return null;
  }
};

const worker = ({ user, id, api, options }, callback) => {
  const _api = std.parse_url(api);
  const search = options ? R.merge(_api.search, options) : _api.search;
  _api.search  = std.parse_query(search).toString();
  const observable = request(_api, { user, id });
  if(observable) observable.subscribe(
      obj => log.debug('[JOB]', 'data parse is proceeding...')
    , err => log.error('[JOB]', err.name, ':', err.message, ':', err.stack)
    , ()  => callback());
};

const main = () => {
  const queue = async.queue(worker, 1);
  queue.drain = () => log.info('[JOB]', 'Completed to work.');

  process.on('message', task => {
    log.debug('[JOB]', 'got message. pid:', process.pid);
    if(task) queue.push(task, err => {
      if(err) log.error('[JOB]', err.name, ':', err.message, ':', err.stack);
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
