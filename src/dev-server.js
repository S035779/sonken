import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack.development.js';
import fs from 'fs';
import url from 'url';
import path from 'path';
import https from 'https';
import express from 'express';
import proxy from 'http-proxy-middleware';
import serveStatic from 'serve-static';
import { logs as log } from './utils/logutils';

log.config('console', 'color', 'dev-server', 'TRACE');
const https_port = config.devServer.port || 4443;
const https_host = config.devServer.host || '127.0.0.1'
const ssl_keyset = {
  key: fs.readFileSync(path.join(__dirname, '../ssl/server.key'))
  , cert: fs.readFileSync(path.join(__dirname, '../ssl/server.crt'))
};

const compiler = webpack(config);
const app = express();
app.use(log.connect());

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath }));
app.use(webpackHotMiddleware(compiler));

app.use('/api'
  , proxy({ target: 'http://localhost:8082', changeOrigin: true }));
app.use('/\*'
  , proxy({ target: 'http://localhost:8081', changeOrigin: true }));

https.createServer(ssl_keyset, app).listen(https_port, https_host, () => {
  log.info(`Secure HTTP Server listening on ${https_host}:${https_port}`);
});
