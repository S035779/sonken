import dotenv               from 'dotenv';
import webpack              from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config               from '../webpack.development.js';
import fs                   from 'fs';
import url                  from 'url';
import path                 from 'path';
import express              from 'express';
import proxy                from 'http-proxy-middleware';
import serveStatic          from 'serve-static';
import log                  from './utils/logutils';

const displayName = 'dev-server';
log.config('console', 'color', displayName, 'TRACE');

const http_port = config.devServer.port || 8080;
const http_host = config.devServer.host || '0.0.0.0'
const api_path  = process.env.API_PATH  || '/api';
const api_host  = process.env.API_HOST  || '127.0.0.1';
const api_port  = process.env.API_PORT  || 8082
const api_url   = url.format({ protocol: 'http', port: api_port, hostname: api_host });
const ssr_path  = '*';
const ssr_host  = process.env.SSR_HOST  || '127.0.0.1';
const ssr_port  = process.env.SSR_PORT  || 8081;
const ssr_url   = url.format({ protocol: 'http', port: ssr_port, hostname: ssr_host });
const app = express();
const compiler = webpack(config);

app.use(log.connect());
app.use(webpackDevMiddleware(compiler, { publicPath: config.output.publicPath }));
app.use(webpackHotMiddleware(compiler, { log: log.debug, path: '/__what', hartbeat: 2000 }));
app.use(api_path, proxy({ target: api_url, changeOrigin: true }));
app.use(ssr_path, proxy({ target: ssr_url, changeOrigin: true }));

app.listen(http_port, http_host, err => {
  if(err) return log.error(err.name, err.message, err.stack);
  log.info(`listening on ${http_host}:${http_port}`);
});
