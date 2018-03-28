import dotenv           from 'dotenv';
import { Note, Readed, Traded, Bided, Starred, Listed }
                        from 'Models/feed';
import std              from 'Utilities/stdutils';
import { logs as log }  from 'Utilities/logutils';

dotenv.config();
const env = process.env.NODE_ENV || 'development';
if(env === 'development') log.config('color', 'job-worker', 'TRACE' );
else
if(env === 'staging'    ) log.config('basic', 'job-worker', 'DEBUG' );
else
if(env === 'production' ) log.config('file',  'job-worker', 'INFO'  );

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
  log.info('[JOB]', 'worker terminated.');
  log.info('[LOG]', 'log4js #3 terminated.');
  log.close(() => {
    cbk()
  });
};
