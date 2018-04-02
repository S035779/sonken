import dotenv           from 'dotenv';
import async            from 'async';
import Yahoo            from 'Utilities/Yahoo';
import std              from 'Utilities/stdutils';
import { logs as log }  from 'Utilities/logutils';

const yahoo = Yahoo.of();

dotenv.config();
const env = process.env.NODE_ENV || 'development';
const base_url = 'https://auctions.yahoo.co.jp';

if (env === 'development') {
  log.config('console', 'color', 'wrk-proces', 'TRACE');
} else if (env === 'staging') {
  log.config('file', 'basic', 'wrk-proces', 'DEBUG');
} else if (env === 'production') {
  log.config('file', 'json', 'wrk-proces', 'INFO');
}

const worker = ({ id, api, path, query }, callback) => {
  let observable;
  const url = base_url + api + path + '?' + std.urlencode(query);
  switch(api) {
    case '/search':
    case '/seller':
      observable = yahoo.fetchHtml({ url });
      break;
    case '/rss':
      observable = yahoo.fetchRss({ url });
      break;
  }
  observable.subscribe(
    obj => log.debug('[WRK]', obj)
  , err => log.error('[WRK]', err.name, ':', err.message)
  , ()  => callback()
  );
};

const main = () => {
  const queue = async.queue(worker, 1);
  queue.drain = () => log.info('[WRK]', 'Completed to work.');

  process.on('message', task => {
    log.debug('[WRK]', 'got message.', task.id);
    queue.push(task, err => {
      if(err) log.error('[WRK]', err.name, ':', err.message);
      log.info('[WRK]', 'finished work.');
    });
  });

  process.on('disconnect', () => {
    log.error('[WRK]', 'worker disconnected.')
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
  if(err) log.error('[WRK]', err.name, ':',  err.message);
  else    log.info('[WRK]', `worker exit. (s/c): ${signal || code}`);
};

const shutdown = (err, cbk) => {
  if(err) log.error('[WRK]', err.name, ':', err.message);
  log.info('[WRK]', 'worker terminated.');
  log.info('[LOG]', 'log4js #4 terminated.');
  log.close(() => {
    cbk()
  });
};
