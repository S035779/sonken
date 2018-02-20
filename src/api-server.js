import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import FeedParser from 'Routes/FeedParser/FeedParser';
import { logs as log } from 'Utilities/logutils';

dotenv.config()
const env = process.env.NODE_ENV || 'development';
const http_port = process.env.API_PORT || 8082;
const http_host = process.env.API_HOST || '127.0.0.1';

if (env === 'development') {
  log.config('console', 'color', 'api-server', 'TRACE');
} else if (env === 'staging') {
  log.config('file', 'basic', 'api-server', 'DEBUG');
} else if (env === 'production') {
  log.config('file', 'json', 'api-server', 'INFO');
}

const app = express();
const router = express.Router();
app.use(log.connect());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const feed = (req, res, next) => {
  const { user, url, category } = req.body;
  const feed = FeedParser.of();
  feed.parseRss({ url, category }).subscribe(
    data => { res.json(data); }
    , err => {
      res.status(500).send({ name: err.name, message: err.message });
      log.error(err.name, ':', err.message);
    }
    , () => { log.info('Complete to parse XML.'); }  
  );
};

const notImplemented = (req, res, next) => {
  next(new Error('not implemented'));
};

router.route('/note')
.get(notImplemented)
.put(notImplemented)
.post(feed)
.delete(notImplemented);
app.use('/api', router);
http.createServer(app).listen(http_port, http_host, () => {
  log.info(`HTTP Server listening on ${http_host}:${http_port}`);
});
