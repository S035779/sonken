import sourceMapSupport from 'source-map-support';
import dotenv           from 'dotenv';
import path             from 'path';
import http             from 'http';
import express          from 'express';
import favicon          from 'serve-favicon';
import session          from 'express-session';
import connect          from 'connect-mongo';
import mongoose         from 'mongoose';
import ReactSSRenderer  from 'Routes/ReactSSRenderer/ReactSSRenderer';
import log              from 'Utilities/logutils';
import app              from 'Utilities/apputils';
import Icon             from 'Assets/image/favicon.ico';

sourceMapSupport.install();
const config = dotenv.config();
if(config.error) throw new Error(config.error);

const env       = process.env.NODE_ENV || 'development';
const http_port = process.env.SSR_PORT || 8081;
const http_host = process.env.SSR_HOST || '127.0.0.1';
const mdb_url   = process.env.MDB_URL  || 'mongodb://localhost:27017';
process.env.NODE_PENDING_DEPRECATION = 0;

const displayName   = '[SSR]';

if (env === 'development') {
  log.config('console', 'color', 'ssr-server', 'TRACE');
} else if (env === 'staging') {
  log.config('file', 'basic', 'ssr-server', 'DEBUG');
} else if (env === 'production') {
  log.config('file', 'json', 'ssr-server', 'INFO');
}

const db            = mongoose.createConnection();
const web           = express();
const SessionStore  = connect(session);
db.on('open',  () => log.info( '[MDB]', 'session #1 connected.'));
db.on('close', () => log.info( '[MDB]', 'session #1 disconnected.'));
db.on('error', () => log.error('[MDB]', 'session #1 connection error.'));
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
db.openUri(mdb_url + '/session', {
  reconnectTries: Number.MAX_VALUE  // Never stop trying to reconnect
, reconnectInterval: 500            // Reconnect every 500ms
});

web.use(log.connect());
web.use(app.compression({ threshold: '1kb' }));
web.use(favicon(path.resolve('dist', '.' + Icon)));
web.use(session({
  secret: 'koobkooCedoN'
, store: new SessionStore({ mongooseConnection: db })
, cookie: { httpOnly: false, maxAge: 60 * 60 * 1000 }
, resave: false
, saveUninitialized: true
}));
web.use(ReactSSRenderer.of().request());

const server = http.createServer(web);
server.listen(http_port, http_host, () => log.info(displayName, `listening on ${http_host}:${http_port}`));

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
  if(err) log.warn(displayName, err.name, err.message, err.stack);
  else    log.info(displayName, `process exit. (s/c): ${signal || code}`);
};

const shutdown = (err, cbk) => {
  if(err) log.error(displayName, err.name, err.message, err.stack);
  mongoose.disconnect(() => {
    log.info(displayName, 'session #1 terminated.');
    server.close(() => {
      log.info(displayName, 'express #1 terminated.');
      log.info(displayName, 'log4js #1 terminated.');
      log.close(() => cbk(0));
    });
  });
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
