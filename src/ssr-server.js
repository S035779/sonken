import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import favicon from 'serve-favicon';
import path from 'path';
import ReactSSRenderer from 'Routes/ReactSSRenderer/ReactSSRenderer';
import { logs as log } from 'Utilities/logutils';

dotenv.config()
const env = process.env.NODE_ENV || 'development';
const http_port = process.env.SSR_PORT || 8081;
const http_host = process.env.SSR_HOST || '127.0.0.1';

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

http.createServer(app).listen(http_port, http_host, () => {
  log.info(`HTTP Server listening on ${http_host}:${http_port}`);
});
