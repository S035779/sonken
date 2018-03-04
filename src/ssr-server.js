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
const mdb_uri = process.env.MDB_URI || 'mongodb://localhost:27017/test';

if (env === 'development') {
  log.config('console', 'color', 'ssr-server', 'TRACE');
} else if (env === 'staging') {
  log.config('file', 'basic', 'ssr-server', 'DEBUG');
} else if (env === 'production') {
  log.config('file', 'json', 'ssr-server', 'INFO');
}

const app = express();
const connection = mongoose.createConnection(mdb_uri);
const SessionStore = connect(session);
app.use(log.connect());
app.use(favicon(path.join(__dirname, 'dist', 'favicon.ico')));
app.use(session({
  secret: 'koobkooCedoN'
, store: new SessionStore({ mongooseConnection: connection })
, cookie: {
    httpOnly: false
  , maxAge: 60 * 60 * 1000
  }
, resave: false
, saveUninitialized: true
}));
app.use(ReactSSRenderer.of().request());

http.createServer(app).listen(http_port, http_host, () => {
  log.info(`HTTP Server listening on ${http_host}:${http_port}`);
});
