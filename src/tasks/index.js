import dotenv           from 'dotenv';
import async            from 'async';
import osmosis          from 'osmosis';
//import { Note, Readed, Traded, Bided, Starred, Listed }
//                        from 'Models/feed';
import std              from 'Utilities/stdutils';
import { logs as log }  from 'Utilities/logutils';

dotenv.config();
const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  log.config('console', 'color', 'wrk-proces', 'TRACE');
} else if (env === 'staging') {
  log.config('file', 'basic', 'wrk-proces', 'DEBUG');
} else if (env === 'production') {
  log.config('file', 'json', 'wrk-proces', 'INFO');
}

const worker = (task, callback) => {
  log.debug('[WRK]', 'got message.', task.name)
  osmosis
  .get('https://auctions.yahoo.co.jp/search/search?p=nintendo+SWITCH')
  .find('div.a1wrp')
  .set({
    'title': 'h3 > a'
  , 'url': 'h3 > a@href'
  }).data(item => console.log(item));
  callback();
};

const main = () => {
  const queue = async.queue(worker, 1);
  queue.drain = () => log.info('[WRK]', 'Completed to work.');

  process.on('message', mes => {
    queue.push(mes, err => {
      if(err) log.error('[WRK]', err.name, ':', err.message);
      log.debug('[WRK]', 'got work.', mes.name);
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
