import dotenv           from 'dotenv';
import path             from 'path';
import http             from 'http';
import express          from 'express';
import favicon          from 'serve-favicon';
import session          from 'express-session';
import connect          from 'connect-mongo';
import mongoose         from 'mongoose';
import ReactSSRenderer  from 'Routes/ReactSSRenderer/ReactSSRenderer';
import { logs as log }  from 'Utilities/logutils';

dotenv.config()
const env = process.env.NODE_ENV || 'development';
const http_port = process.env.SSR_PORT || 8081;
const http_host = process.env.SSR_HOST || '127.0.0.1';
const mdb_url = process.env.MDB_URL || 'mongodb://localhost:27017';
const app = express();
const db = mongoose.createConnection();
const SessionStore = connect(session);

if (env === 'development') {
  log.config('console', 'color', 'ssr-server', 'TRACE');
} else if (env === 'staging') {
  log.config('file', 'basic', 'ssr-server', 'DEBUG');
} else if (env === 'production') {
  log.config('file', 'json', 'ssr-server', 'INFO');
}
db.on('open',  () => log.info( '[MDB]', 'session #1 connected.'));
db.on('close', () => log.info( '[MDB]', 'session #1 disconnected.'));
db.on('error', () => log.error('[MDB]', 'session #1 connection error.'));
db.openUri(mdb_url + '/session');

app.use(log.connect());
app.use(favicon(path.join(__dirname, 'dist', 'favicon.ico')));
app.use(session({
  secret: 'koobkooCedoN'
, store: new SessionStore({ mongooseConnection: db })
, cookie: {
    httpOnly: false
  , maxAge: 60 * 60 * 1000
  }
, resave: false
, saveUninitialized: true
}));
app.use(ReactSSRenderer.of().request());
const server = http.createServer(app);
server.listen(http_port, http_host, () => {
  log.info('[SSR]', `listening on ${http_host}:${http_port}`);
});

process.on('SIGUSR2', () => shutdown(null, process.exit));
process.on('SIGINT',  () => shutdown(null, process.exit));
process.on('SIGTERM', () => shutdown(null, process.exit));
process.on('uncaughtException', err => shutdown(err, process.exit));
process.on('warning', err => message(err));
process.on('exit',    (code, signal) => message(null, code, signal));

const message = (err, code, signal) => {
  if(err) log.warn('[SSR]', err.name, ':',  err.message);
  else    log.info('[SSR]', `process exit. (s/c): ${signal || code}`);
};

const shutdown = (err, cbk) => {
  if(err) log.error('[SSR]', err.name, ':', err.message);
  mongoose.disconnect(() => {
    log.info('[MDB]', 'session #1 terminated.');
    server.close(() => {
      log.info('[WWW]', 'express #1 terminated.');
      log.info('[LOG]', 'log4js #1 terminated.');
      log.close(() => {
        cbk()
      });
    });
  });
};
