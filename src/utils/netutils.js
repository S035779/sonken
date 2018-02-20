import std from './stdutils';
import { logs as log }  from './logutils';

/*
 * Simple HTTP GET request
 *
 * @param {string} url - 
 * @param {object} query -
 * @param {function} callback -
 */
const get = function(url, query, callback) {  
  url = require('url').parse(url);
  let hostname  = url.hostname
    , port      = url.port || 80
    , path      = url.pathname;
  if (query) path += '?' + require('querystring').stringify(query);
  const client = require('http');
  const req = client.get({
    host: hostname
    , port: port
    , path: path
  }, function(res) {
    const stat = res.statusCode;
    const head = res.headers;
    res.setEncoding('utf8');
    let body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      switch (stat) {
        case 101: case 102: case 103: case 104: case 105: case 106:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break; 
        case 200: case 201: case 202: case 204:
          process.stdout.write('-');
          callback(null, head, body);
          break;
        case 301: case 302:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break; 
        case 400: case 401: case 402: case 403: case 404:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          process.stdout.write('x');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          get(url, callback);
          break;
        default:
          process.stdout.write('?');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break;
      }
    });
  });
  req.on('error', function(err) {
    log.error(`Problem with HTTP Request: ${err.code}`);
    callback({ error: { name: err.code, message: err.message }});
  });
};
module.exports.get = get;

/*
 * Simple HTTP GET request
 *
 * @param {string} url - 
 * @param {object} query -
 * @param {function} callback -
 */
const getJSON = function(url, query, callback) {  
  url = require('url').parse(url);
  let hostname  = url.hostname
    , port      = url.port || 80
    , path      = url.pathname;
  if (query) path += '?' + require('querystring').stringify(query);
  const client = require('http');
  const req = client.get({
    host: hostname
    , port: port
    , path: path
  }, function(res) {
    const stat = res.statusCode;
    const head = res.headers;
    res.setEncoding('utf8');
    let body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      switch (stat) {
        case 101: case 102: case 103: case 104: case 105: case 106:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: JSON.parse(body) }});
          break; 
        case 200: case 201: case 202: case 204:
          process.stdout.write('-');
          callback(null, head, JSON.parse(body));
          break;
        case 301: case 302:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: JSON.parse(body) }});
          break; 
        case 400: case 401: case 402: case 403: case 404:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          process.stdout.write('x');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          get(url, callback);
          break;
        default:
          process.stdout.write('?');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: JSON.parse(body) }});
          break;
      }
    });
  });
  req.on('error', function(err) {
    log.error(`Problem with HTTP Request: ${err.code}`);
    callback({ error: { name: err.code, message: err.message }});
  });
};
module.exports.getJSON = getJSON;

/*
 * HTTPS GET request
 *
 * @param {string} url - 
 * @param {object} query -
 * @param {function} callback -
 */
const get2 = function(url, query, callback) {  
  url = require('url').parse(url);
  let hostname  = url.hostname
    , port      = url.port || 443
    , path      = url.pathname;
  if (query) path += '?' + require('querystring').stringify(query);
  const client = require('https');
  const req = client.get({
    host: hostname
    , port: port
    , path: path
  }, function(res) {
    const stat = res.statusCode;
    const head = res.headers;
    res.setEncoding('utf8');
    let body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      switch (stat) {
        case 101: case 102: case 103: case 104: case 105: case 106:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break; 
        case 200: case 201: case 202: case 204:
          process.stdout.write('-');
          callback(null, head, body);
          break;
        case 301: case 302:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break; 
        case 400: case 401: case 402: case 403: case 404:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          process.stdout.write('x');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          get2(url, callback);
          break;
        default:
          process.stdout.write('?');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break;
      }
    });
  });
  req.on('error', function(err) {
    log.error(`Problem with HTTP Request: ${err.code}`);
    callback({ error: { name: err.code, message: err.message }});
  });
};
module.exports.get2 = get2;

/*
 * HTTPS GET request
 *
 * @param {string} url - 
 * @param {object} query -
 * @param {function} callback -
 */
const getJSON2 = function(url, query, callback) {  
  url = require('url').parse(url);
  let hostname  = url.hostname
    , port      = url.port || 443
    , path      = url.pathname;
  if (query) path += '?' + require('querystring').stringify(query);
  const client = require('https');
  const req = client.get({
    host: hostname
    , port: port
    , path: path
  }, function(res) {
    const stat = res.statusCode;
    const head = res.headers;
    res.setEncoding('utf8');
    let body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      switch (stat) {
        case 101: case 102: case 103: case 104: case 105: case 106:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: JSON.parse(body) }});
          break; 
        case 200: case 201: case 202: case 204:
          process.stdout.write('-');
          callback(null, head, JSON.parse(body));
          break;
        case 301: case 302:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: JSON.parse(body) }});
          break; 
        case 400: case 401: case 402: case 403: case 404:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: JSON.parse(body) }});
          break; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          process.stdout.write('x');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          get2(url, callback);
          break;
        default:
          process.stdout.write('?');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: JSON.parse(body) }});
          break;
      }
    });
  });
  req.on('error', function(err) {
    log.error(`Problem with HTTP Request: ${err.code}`);
    callback({ error: { name: err.code, message: err.message }});
  });
};
module.exports.getJSON2 = getJSON2;

/*
 * HTTPS POST request with NV data as the request body
 *
 * @param {string} url - 
 * @param {object} auth -
 * @param {object} body -
 * @param {function} callback -
 */
const post2 = function(url, auth, body, callback) {
  url = require('url').parse(url);
  let hostname  = url.hostname
    , port      = url.port || 443
    , path      = url.pathname
    , query     = url.query;
  if (query) path += '?' + query;
  let type = '';
  if (body == null) body = '';
  if (body instanceof Buffer)         type = 'application/octet-stream';
  else if (typeof body === 'string')  type = 'text/plain; charset=UTF-8';
  else if (typeof body === 'object') {
    body = std.urlencode(body);
    type = 'application/x-www-form-urlencoded';
  }
  const headers = {
    'Accept':             'application/json'
    , 'Accept-Language':  'ja_JP'
    , 'Content-Length':   Buffer.byteLength(body)
    , 'Content-Type':     type
    , 'User-Agent':       'Node-Script/1.0'
  };
  if(auth && auth.hasOwnProperty('user') && auth.hasOwnProperty('pass')) {
    headers['Authorization'] = 'Basic ' 
      + std.encode_base64(auth.user + ':' : auth.pass);
  } else if (auth && auth.hasOwnProperty('bearer')) {
    headers['Authorization'] =' Bearer ' 
      + auth.bearer;
  }
  const client = require('https');
  const req = client.request({
    hostname: hostname,
    port: port,
    path: path,
    method: 'POST',
    headers: headers
  }, function(res) {
    const stat = res.statusCode;
    const head = res.headers;
    res.setEncoding('utf8');
    let body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      switch (stat) {
        case 101: case 102: case 103: case 104: case 105: case 106:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break; 
        case 200: case 201: case 202: case 204:
          process.stdout.write('-');
          callback(null, head, body);
          break;
        case 301: case 302:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break; 
        case 400: case 401: case 402: case 403: case 404:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          return; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          process.stdout.write('x');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          postData2(url, auth, body, callback);
          break;
        default:
          process.stdout.write('?');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break;
      }
    });
  });
  req.on('error', function(err) {
    log.error(`Problem with HTTP Request: ${err.code}`);
    callback({ error: { name: err.code, message: err.message }});
  });
  req.write(body);
  req.end();
};
module.exports.post2 = post2;
/*
 * Simple HTTP POST request with data as the request body
 *
 * @param {string} url - 
 * @param {object} body -
 * @param {function} callback -
 */
const postData = function(url, body, callback) {
  url = require('url').parse(url);
  let hostname  = url.hostname
    , port      = url.port || 80
    , path      = url.pathname
    , query     = url.query;
  if (query) path += '?' + query;
  let type = '';
  if (body == null) body = '';
  if (body instanceof Buffer)          type = 'application/octet-stream';
  else if (typeof body === 'string')   type = 'text/plain; charset=UTF-8';
  else if (typeof body === 'object') {
    body = require('querystring').stringify(body);
    type = 'application/x-www-form-urlencoded';
  }
  const client = require('http');
  const req = client.request({
    hostname: hostname,
    port: port,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': type,
      'Content-Length': Buffer.byteLength(body)
    }
  }, function(res) {
    const stat = res.statusCode;
    const head = res.headers;
    res.setEncoding('utf8');
    let body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      switch (stat) {
        case 101: case 102: case 103: case 104: case 105: case 106:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break; 
        case 200: case 201: case 202: case 204:
          process.stdout.write('-');
          callback(null, head, body);
          break;
        case 301: case 302:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break; 
        case 400: case 401: case 402: case 403: case 404:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          return; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          process.stdout.write('x');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          postData(url, body, callback);
          break;
        default:
          process.stdout.write('?');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break;
      }
    });
  });
  req.on('error', function(err) {
    log.error(`Problem with HTTP Request: ${err.code}`);
    callback({ error: { name: err.code, message: err.message }});
  });
  req.write(body);
  req.end();
};
module.exports.postData = postData;

/*
 * HTTPS POST request with urlencoded data as the request body
 *
 * @param {string} url - 
 * @param {object} auth -
 * @param {object} body -
 * @param {function} callback -
 */
const postData2 = function(url, auth, body, callback) {
  url = require('url').parse(url);
  let hostname  = url.hostname
    , port      = url.port || 443
    , path      = url.pathname
    , query     = url.query;
  if (query) path += '?' + query;
  let type = '';
  if (body == null) body = '';
  if (body instanceof Buffer)         type = 'application/octet-stream';
  else if (typeof body === 'string')  type = 'text/plain; charset=UTF-8';
  else if (typeof body === 'object') {
    body = require('querystring').stringify(body);
    type = 'application/x-www-form-urlencoded';
  }
  const headers = {
    'Accept':             'application/json'
    , 'Accept-Language':  'ja_JP'
    , 'Content-Length':   Buffer.byteLength(body)
    , 'Content-Type':     type
  };
  if(auth && auth.hasOwnProperty('user') && auth.hasOwnProperty('pass')) {
    headers['Authorization'] = 'Basic ' 
      + std.encode_base64(auth.user + ':' : auth.pass);
  } else if (auth && auth.hasOwnProperty('bearer')) {
    headers['Authorization'] =' Bearer ' 
      + auth.bearer;
  }
  const client = require('https');
  const req = client.request({
    hostname: hostname,
    port: port,
    path: path,
    method: 'POST',
    headers: headers
  }, function(res) {
    const stat = res.statusCode;
    const head = res.headers;
    res.setEncoding('utf8');
    let body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      switch (stat) {
        case 101: case 102: case 103: case 104: case 105: case 106:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break; 
        case 200: case 201: case 202: case 204:
          process.stdout.write('-');
          callback(null, head, body);
          break;
        case 301: case 302:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break; 
        case 400: case 401: case 402: case 403: case 404:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          return; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          process.stdout.write('x');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          postData2(url, auth, body, callback);
          break;
        default:
          process.stdout.write('?');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break;
      }
    });
  });
  req.on('error', function(err) {
    log.error(`Problem with HTTP Request: ${err.code}`);
    callback({ error: { name: err.code, message: err.message }});
  });
  req.write(body);
  req.end();
};
module.exports.postData2 = postData2;

/*
 * HTTPS POST request with json as the request body
 *
 * @param {string} url - 
 * @param {object} auth -
 * @param {object} body -
 * @param {function} callback -
 */
const postJson2 = function(url, auth, body, callback) {
  url = require('url').parse(url);
  let hostname  = url.hostname
    , port      = url.port || 443
    , path      = url.pathname
    , query     = url.query;
  if (query) path += '?' + query;
  let type = '';
  if (body == null) body = '';
  if (body instanceof Buffer)          type = 'application/octet-stream';
  else if (typeof body === 'string')   type = 'text/plain; charset=UTF-8';
  else if (typeof body === 'object') {
    body = JSON.stringify(body);
    type = 'application/json';
  }
  const headers = {
    'Accept':             'application/json'
    , 'Accept-Language':  'ja_JP'
    , 'Content-Length':   Buffer.byteLength(body)
    , 'Content-Type':     type
  };
  if(auth && auth.hasOwnProperty('user') && auth.hasOwnProperty('pass')) {
    headers['Authorization'] =
      'Basic ' +  std.encode_base64(auth.user + ':' : auth.pass);
  } else if (auth && auth.hasOwnProperty('bearer')) {
    headers['Authorization'] =
      'Bearer ' + auth.bearer;
  }
  const client = require('https');
  const req = client.request({
    hostname: hostname,
    port: port,
    path: path,
    method: 'POST',
    headers: headers 
  }, function(res) {
    const stat = res.statusCode;
    const head = res.headers;
    res.setEncoding('utf8');
    let body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      switch (stat) {
        case 101: case 102: case 103: case 104: case 105: case 106:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break; 
        case 200: case 201: case 202: case 204:
          process.stdout.write('-');
          callback(null, head, body);
          break;
        case 301: case 302:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break; 
        case 400: case 401: case 402: case 403: case 404:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          return; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          process.stdout.write('x');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          postJson2(url, auth, body, callback);
          break;
        default:
          process.stdout.write('?');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          callback({ error: { name: stat, message: body }});
          break;
      }
    });
  });
  req.on('error', function(err) {
    log.error(`Problem with HTTP Request: ${err.code}`);
    callback({ error: { name: err.code, message: err.message }});
  });
  req.write(body);
  req.end();
};
module.exports.postJson2 = postJson2;
