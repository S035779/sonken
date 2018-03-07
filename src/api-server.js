import dotenv           from 'dotenv';
import path             from 'path';
import http             from 'http';
import express          from 'express';
import session          from 'express-session';
import connect          from 'connect-mongo';
import mongoose         from 'mongoose';
import bodyParser       from 'body-parser';
import { logs as log }  from 'Utilities/logutils';
import feed             from 'Routes/feed';
import profile          from 'Routes/profile';

dotenv.config()
const env = process.env.NODE_ENV || 'development';
const http_port = process.env.API_PORT || 8082;
const http_host = process.env.API_HOST || '127.0.0.1';
const mdb_url = process.env.MDB_URL || 'mongodb://localhost:27017';
const app = express();
const router = express.Router();
const db = mongoose.createConnection();
const SessionStore = connect(session);

if (env === 'development') {
  log.config('console', 'color', 'api-server', 'TRACE');
} else if (env === 'staging') {
  log.config('file', 'basic', 'api-server', 'DEBUG');
} else if (env === 'production') {
  log.config('file', 'json', 'api-server', 'INFO');
}
db.on('open',  () => log.info( '[MDB]', 'session connected.'));
db.on('close', () => log.info( '[MDB]', 'session disconnected.'));
db.on('error', () => log.error('[MDB]', 'session connection error.'));
db.openUri(mdb_url + '/session');

app.use(log.connect());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'koobkooCedoN'
, store: new SessionStore({ mongooseConnection: db })
, cookie: {
    httpOnly: false
  , maxAge: 60 * 60 * 1000
  }
, resave: false
, saveUninitialized: true
}))


router.route('/user')
.get(profile.fetchUser())
.put(profile.createUser())
.post(profile.updateUser())
.delete(profile.deleteUser());

router.route('/authenticate')
.get(profile.notImplemented())
.put(profile.notImplemented())
.post(profile.authenticate())
.delete(profile.signout());

router.route('/traded')
.get(feed.fetchTradedNotes())
.put(feed.createTrade())
.post(feed.notImplemented())
.delete(feed.deleteTrade());

router.route('/bided')
.get(feed.fetchBidedNotes())
.put(feed.createBids())
.post(feed.notImplemented())
.delete(feed.deleteBids());

router.route('/starred')
.get(feed.fetchStarredNotes())
.put(feed.createStar())
.post(feed.notImplemented())
.delete(feed.deleteStar());

router.route('/listed')
.get(feed.fetchListedNotes())
.put(feed.createList())
.post(feed.notImplemented())
.delete(feed.deleteList());

router.route('/item')
.get(feed.notImplemented())
.put(feed.notImplemented())
.post(feed.notImplemented())
.delete(feed.deleteItem());

router.route('/readed')
.get(feed.fetchReadedNotes())
.put(feed.createRead())
.post(feed.notImplemented())
.delete(feed.deleteRead());

router.route('/notes')
.get(feed.fetchNotes())
.put(feed.notImplemented())
.post(feed.notImplemented())
.delete(feed.notImplemented());

router.route('/note')
.get(feed.fetchNote())
.put(feed.createNote())
.post(feed.updateNote())
.delete(feed.deleteNote());

app.use('/api', router);
const server = http.createServer(app);
server.listen(http_port, http_host, () => {
  log.info('[API]', `listening on ${http_host}:${http_port}`);
});

process.on('SIGUSR2', () => shutdown(null, process.exit));
process.on('SIGINT',  () => shutdown(null, process.exit));
process.on('SIGTERM', () => shutdown(null, process.exit));
process.on('uncaughtException', err => shutdown(err, process.exit));
process.on('warning', err => messages(err));
process.on('exit',    (code, signal) => message(null, code, signal));

const messages = (err, code, signal) => {
  if(err) log.warn('[API]', err.name, ':',  err.message);
  else    log.info('[API]', `process exit. (s/c): ${signal || code}`);
};

const shutdown = (err, cbk) => {
  if(err) log.error('[API]', err.name, ':', err.message);
  mongoose.disconnect(() => {
    log.info('[API]', 'MDB[session #2] terminated.');
    server.close(() => {
      log.info('[API]', 'express terminated.');
      log.info('[API]', 'log4js terminated.');
      log.close(() => {
        cbk()
      });
    });
  });
};
