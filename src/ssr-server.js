import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import path from 'path';
import ReactSSRenderer from 'Routes/ReactSSRenderer/ReactSSRenderer';
import routes from 'Routes';
import { logs as log } from 'Utilities/logutils';

dotenv.config()
const env = process.env.NODE_ENV || 'development';
const http_port = process.env.API_PORT || 8081;
const http_host = process.env.API_HOST || '127.0.0.1';
if (env === 'development') {
  log.config('console', 'color', 'ssr-server', 'TRACE');
} else if (env === 'staging') {
  log.config('file', 'basic', 'ssr-server', 'DEBUG');
} else if (env === 'production') {
  log.config('file', 'json', 'ssr-server', 'INFO');
}

const app = express();
app.use(log.connect());
app.use(favicon(path.join(__dirname, 'dist', 'favicon.ico')));
app.use(ReactSSRenderer.of().request());
/*
const router = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
router.route('/feed')
.get((req, res, next) => { next(new Error('not implemented')); })
.put((req, res, next) => { next(new Error('not implemented')); })
.post((req, res, next) => { routes.feed(req, res, next) })
.delete((req, res, next) => { next(new Error('not implemented')); });
app.use('/api', router);
*/
http.createServer(app).listen(http_port, http_host, () => {
  log.info(`HTTP Server listening on ${http_host}:${http_port}`);
});
