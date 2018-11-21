import sourceMapSupport from 'source-map-support';
import dotenv           from 'dotenv';
import http             from 'http';
import express          from 'express';
import session          from 'express-session';
import connect          from 'connect-mongo';
import mongoose         from 'mongoose';
import bodyParser       from 'body-parser';
import cookieParser     from 'cookie-parser';
import job              from 'Routes/job';
import feed             from 'Routes/feed';
import profile          from 'Routes/profile';
import faq              from 'Routes/faq';
import mail             from 'Routes/mail';
import log              from 'Utilities/logutils';

sourceMapSupport.install();
const config = dotenv.config();
if(config.error) throw config.error;

const env           = process.env.NODE_ENV || 'development';
const http_port     = process.env.API_PORT || 8082;
const http_host     = process.env.API_HOST || '127.0.0.1';
const mdb_url       = process.env.MDB_URL  || 'mongodb://localhost:27017';
process.env.NODE_PENDING_DEPRECATION = 0;

const displayName   = '[API]';

if (env === 'development') {
  log.config('console', 'color', 'api-server', 'TRACE');
} else if (env === 'staging') {
  log.config('file', 'basic', 'api-server', 'DEBUG');
} else if (env === 'production') {
  log.config('file', 'json', 'api-server', 'INFO');
}

const db            = mongoose.createConnection();
const app           = express();
const router        = express.Router();
const SessionStore  = connect(session);

db.on('open',  () => log.info( '[MDB]', 'session #2 connected.'));
db.on('close', () => log.info( '[MDB]', 'session #2 disconnected.'));
db.on('error', () => log.error('[MDB]', 'session #2 connection error.'));
db.openUri(mdb_url + '/session', { useNewUrlParser: true });

app.use(log.connect());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'koobkooCedoN'
, store: new SessionStore({ mongooseConnection: db })
, cookie: { httpOnly: false, maxAge: 60 * 60 * 1000 }
, resave: false
, saveUninitialized: true
}));
app.use(cookieParser());

app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, proxy-revalidate');
  next();
});

router.route('/inquiry')
.get(profile.notImplemented())
.put(profile.inquiry())
.post(profile.notImplemented())
.delete(profile.notImplemented());

router.route('/preference')
.get(profile.fetchPreference())
.put(profile.createPreference())
.post(profile.updatePreference())
.delete(profile.deletePreference());

router.route('/selected')
.get(mail.fetchSelectedMails())
.put(mail.createSelect())
.post(mail.notImplemented())
.delete(mail.deleteSelect());

router.route('/mails')
.get(mail.fetchMails())
.put(mail.uploadFile())
.post(mail.notImplemented())
.delete(mail.notImplemented());

router.route('/mail')
.get(mail.fetchMail())
.put(mail.createMail())
.post(mail.updateMail())
.delete(mail.deleteMail());

router.route('/posted')
.get(faq.fetchPostedFaqs())
.put(faq.createPost())
.post(faq.notImplemented())
.delete(faq.deletePost());

router.route('/faqs')
.get(faq.fetchFaqs())
.put(faq.uploadFile())
.post(faq.notImplemented())
.delete(faq.notImplemented());

router.route('/faq')
.get(faq.fetchFaq())
.put(faq.createFaq())
.post(faq.updateFaq())
.delete(faq.deleteFaq());

router.route('/users')
.get(profile.fetchUsers())
.put(profile.sendmail())
.post(profile.createApproval())
.delete(profile.deleteApproval());

router.route('/user')
.get(profile.fetchUser())
.put(profile.createUser())
.post(profile.updateUser())
.delete(profile.deleteUser());

router.route('/login')
.get(profile.fetchUser())
.put(profile.createUser())
.post(profile.updateUser())
.delete(profile.deleteUser());

router.route('/authenticate')
.get(profile.autologin())
.put(profile.notImplemented())
.post(profile.authenticate())
.delete(profile.signout());

router.route('/traded')
.get(feed.fetchTradedNotes())
.put(feed.createTrade())
.post(feed.downloadTrade())
.delete(feed.deleteTrade());

router.route('/bided')
.get(feed.fetchBidedNotes())
.put(feed.createBids())
.post(feed.downloadBids())
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

router.route('/readed')
.get(feed.fetchReadedNotes())
.put(feed.createRead())
.post(feed.notImplemented())
.delete(feed.deleteRead());

router.route('/deleted')
.get(feed.fetchDeletedNotes())
.put(feed.createDelete())
.post(feed.notImplemented())
.delete(feed.deleteDelete());

router.route('/added')
.get(feed.fetchAddedNotes())
.put(feed.createAdd())
.post(feed.notImplemented())
.delete(feed.deleteAdd());

router.route('/file')
.get(feed.downloadNotes())
.put(feed.uploadNotes())
.post(feed.downloadItems())
.delete(feed.notImplemented());

router.route('/worker')
.get(job.notImplemented())
.put(job.downloadLink())
.post(job.downloadFile())
.delete(job.notImplemented());

router.route('/notes')
.get(feed.fetchNotes())
.put(feed.notImplemented())
.post(feed.notImplemented())
.delete(feed.notImplemented());

router.route('/image')
.get(feed.notImplemented())
.put(feed.notImplemented())
.post(feed.downloadImages())
.delete(feed.notImplemented())

router.route('/categorys')
.get(feed.fetchCategorys())
.put(feed.notImplemented())
.post(feed.notImplemented())
.delete(feed.notImplemented());

router.route('/note')
.get(feed.fetchNote())
.put(feed.createNote())
.post(feed.updateNote())
.delete(feed.deleteNote());

router.route('/category')
.get(feed.fetchCategory())
.put(feed.createCategory())
.post(feed.updateCategory())
.delete(feed.deleteCategory());

app.use('/api', router);
const server = http.createServer(app);
server.listen(http_port, http_host, () => {
  log.info(displayName, `listening on ${http_host}:${http_port}`);
});

const rejections = new Map();
const reject = (err, promise) => {
  const { name, message, stack } = err;
  log.error(displayName, 'unhandledRejection', name, message, stack || promise);
  rejections.set(promise, err);
};
const shrink = promise => {
  log.warn(displayName, 'rejectionHandled', rejections);
  rejections.delete(promise);
};

const message = (err, code, signal) => {
  if(err) log.warn(displayName, err.name,  err.message, err.stack);
  else    log.info(displayName, `process exit. (s/c): ${signal || code}`);
};

const shutdown = (err, cbk) => {
  if(err) log.error(displayName, err.name, err.message, err.stack);
  mongoose.disconnect(() => {
    log.info(displayName, 'session #2 terminated.');
    server.close(() => {
      log.info(displayName, 'express #2 terminated.');
      log.info(displayName, 'log4js #2 terminated.');
      log.close(() => cbk());
    });
  });
};

process.on('SIGUSR2', () => shutdown(null, process.exit));
process.on('SIGINT',  () => shutdown(null, process.exit));
process.on('SIGTERM', () => shutdown(null, process.exit));
process.on('uncaughtException', err => shutdown(err, process.exit));
process.on('unhandledRejection', (err, promise) => reject(err, promise));
process.on('rejectionHandled', promise => shrink(promise));
process.on('warning', err => message(err));
process.on('exit', (code, signal) => message(null, code, signal));
