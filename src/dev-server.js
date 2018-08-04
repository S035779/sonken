import webpack              from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config               from '../webpack.development.js';
import fs                   from 'fs';
import url                  from 'url';
import path                 from 'path';
import http                 from 'http';
import express              from 'express';
import proxy                from 'http-proxy-middleware';
import serveStatic          from 'serve-static';
import log                  from './utils/logutils';

const displayName = 'dev-server';
const port = config.devServer.port || 8080;
const host = config.devServer.host || '0.0.0.0'
log.config('console', 'color', displayName, 'TRACE');

const compiler = webpack(config);
const app = express();
app.use(log.connect());

app.use(webpackDevMiddleware(compiler, { publicPath: config.output.publicPath }));
app.use(webpackHotMiddleware(compiler));

app.use('/api', proxy({ target: 'http://localhost:8082', changeOrigin: true }));
app.use('/\*',  proxy({ target: 'http://localhost:8081', changeOrigin: true }));

http.createServer(app).listen(port, host, () => {
  log.info('[DEV]', `listening on ${host}:${port}`);
});
