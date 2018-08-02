import * as R from 'ramda';
import http   from 'http';
import https  from 'https';
import std    from 'Utilities/stdutils';

const min = 2000;
const max = 5000;
const throttle = () => Math.floor(Math.random() * (max +1 - min) +min);

/*
 * Simple HTTP GET request
 *
 * @param {string} url - 
 * @param {object} options -
 * @param {function} callback -
 */
const get = function(url, { search, operator, filename }, callback) {  
  const _url = std.parse_url(url);
  let hostname  = _url.hostname
    , protocol  = _url.protocol
    , port      = _url.port
    , path      = _url.pathname
    , query     = _url.query;
  if (query) {
    path += '?' + query;
  } else if(search) {
    path += '?' + std.urlencode_rfc3986(search);
  }
  const client = protocol === 'http:' ? http : https;
  const req = client.get({ hostname, port, path }, res => {
    const stat = res.statusCode;
    const head = res.headers;
    let body = '';
    if(operator) {
      res.pipe(operator);
      body = filename;
    } else {
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
    }
    res.on('end', () => {
      if(operator) operator.close();
      switch (stat) {
        case 101: case 102: case 103: case 104: case 105: case 106:
          callback({ name: stat, message: body });
          break; 
        case 200: case 201: case 202: case 204:
          callback(null, head, body );
          break;
        case 301: case 302:
          callback({ name: stat, message: body });
          break; 
        case 400: case 401: case 402: case 403: case 404:
          callback({ name: stat, message: body });
          break; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          setTimeout(() => get(url, { search, operator }, callback), throttle());
          break;
        default:
          callback({ name: stat, message: body });
          break;
      }
    });
  });
  req.on('error', err => callback({ name: err.code, message: err.message }));
};

/*
 * Simple HTTP GET request
 *
 * @param {string} url - 
 * @param {object} options -
 * @param {function} callback -
 */
const getJSON = function(url, options, callback) {  
  url = require('url').parse(url);
  let hostname  = url.hostname
    , port      = url.port || 80
    , path      = url.pathname
    , query     = url.query;
  if (query) {
    path += '?' + query;
  } else if(options) {
    path += '?' + require('querystring').stringify(options);
  }
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
          callback({ name: stat, message: JSON.parse(body) });
          break; 
        case 200: case 201: case 202: case 204:
          callback(null, head, JSON.parse(body));
          break;
        case 301: case 302:
          callback({ name: stat, message: JSON.parse(body) });
          break; 
        case 400: case 401: case 402: case 403: case 404:
          callback({ name: stat, message: JSON.parse(body) });
          break; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          setTimeout(() => getJSON(url, options, callback), throttle());
          break;
        default:
          callback({ name: stat, message: JSON.parse(body) });
          break;
      }
    });
  });
  req.on('error', function(err) {
    callback({ name: err.code, message: err.message });
  });
};

/*
 * HTTPS GET request
 *
 * @param {string} url - 
 * @param {object} options -
 * @param {function} callback -
 */
const get2 = function(url, options, callback) {  
  url = require('url').parse(url);
  let hostname  = url.hostname
    , port      = url.port || 443
    , path      = url.pathname
    , query     = url.query;
  if (query) {
    path += '?' + query;
  } else if(options) {
    path += '?' + require('querystring').stringify(options);
  }
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
          callback({ name: stat, message: body });
          break; 
        case 200: case 201: case 202: case 204:
          callback(null, head, body);
          break;
        case 301: case 302:
          callback({ name: stat, message: body });
          break; 
        case 400: case 401: case 402: case 403: case 404:
          callback({ name: stat, message: body });
          break; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          setTimeout(() => get2(url, options, callback), throttle());
          break;
        default:
          callback({ name: stat, message: body });
          break;
      }
    });
  });
  req.on('error', function(err) {
    callback({ name: err.code, message: err.message });
  });
};

/*
 * HTTP/HTTPS request
 *
 * @param {string} url - 
 * @param {object} options -
 * @param {function} callback -
 */
const fetch = function(url, { method, header, search, auth, body, type }, callback) {  
  const _url = std.parse_url(url);
  let hostname  = _url.hostname
    , protocol  = _url.protocol
    , port      = _url.port
    , path      = _url.pathname
    , query     = _url.query;
  if(query) {
    path += '?' + query 
  } else if(search) {
    path += '?' + std.urlencode_rfc3986(search);
  }
  let _type = null, _body = null;
  if (body && body instanceof Buffer) {
    _type = 'application/octet-stream';
    _body = body;
  } else if (body && typeof body === 'string') {
    _type = 'text/plain; charset="UTF-8"';
    _body = body;
  } else if (body && typeof body === 'string' && type === 'XML') {
    _type = 'Content-Type: application/xml; charset="UTF-8"';
    _body = body;
  } else if (body && typeof body === 'object' && type === 'NV') {
    _type = 'application/x-www-form-urlencoded';
    _body = std.urlencode_rfc3986(body);
  } else if (body && typeof body === 'object' && type === 'JSON') {
    _type = 'application/json';
    _body = JSON.stringify(body);
  }
  let _auth = null;
  if(auth && auth.hasOwnProperty('bearer')) {
    _auth = 'Bearer ' + auth.bearer;
  }
  const _header = {
    'Accept':           'application/json'
  , 'Accept-Language':  'ja_JP'
  , 'Content-Length':   _body ? 0 :  Buffer.byteLength(_body) 
  , 'Content-Type':     _type
  , 'Authorization':    _auth
  };
  const headers = R.merge(_header, header);
  const client = protocol === 'http:' ? http : https;
  const req = client.request({ hostname, port, path, method, headers, auth }, res => {
    const stat = res.statusCode;
    const head = res.headers;
    res.setEncoding('utf8');
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      switch (stat) {
        case 101: case 102: case 103: case 104: case 105: case 106:
          callback({ name: stat, message: JSON.parse(body) });
          break; 
        case 200: case 201: case 202: case 204:
          callback(null, head, JSON.parse(body));
          break;
        case 301: case 302:
          callback({ name: stat, message: JSON.parse(body) });
          break; 
        case 400: case 401: case 402: case 403: case 404:
          callback({ name: stat, message: JSON.parse(body) });
          break; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          setTimeout(() =>  fetch(url, { method, header, search, auth, body, type }, callback), throttle());
          break;
        default:
          callback({ name: stat, message: JSON.parse(body) });
          break;
      }
    });
  });
  req.on('error', err => callback({ name: err.code, message: err.message }));
  req.write(body);
  req.end();
};

/*
 * HTTPS GET request
 *
 * @param {string} url - 
 * @param {object} options -
 * @param {function} callback -
 */
const getJSON2 = function(url, options, callback) {  
  url = require('url').parse(url);
  let hostname  = url.hostname
    , port      = url.port || 443
    , path      = url.pathname
    , query     = url.query;
  if (query) {
    path += '?' + query;
  } else if(options) {
    path += '?' + require('querystring').stringify(options);
  }
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
          callback({ name: stat, message: JSON.parse(body) });
          break; 
        case 200: case 201: case 202: case 204:
          callback(null, head, JSON.parse(body));
          break;
        case 301: case 302:
          callback({ name: stat, message: JSON.parse(body) });
          break; 
        case 400: case 401: case 402: case 403: case 404:
          callback({ name: stat, message: JSON.parse(body) });
          break; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          setTimeout(() => getJSON2(url, options, callback), throttle());
          break;
        default:
          callback({ name: stat, message: JSON.parse(body) });
          break;
      }
    });
  });
  req.on('error', function(err) {
    callback({ name: err.code, message: err.message });
  });
};

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
          callback({ name: stat, message: body });
          break; 
        case 200: case 201: case 202: case 204:
          callback(null, head, body);
          break;
        case 301: case 302:
          callback({ name: stat, message: body });
          break; 
        case 400: case 401: case 402: case 403: case 404:
          callback({ name: stat, message: body });
          return; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          setTimeout(() => post2(url, auth, body, callback), throttle());
          break;
        default:
          callback({ name: stat, message: body });
          break;
      }
    });
  });
  req.on('error', function(err) {
    callback({ name: err.code, message: err.message });
  });
  req.write(body);
  req.end();
};

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
          callback({ name: stat, message: body });
          break; 
        case 200: case 201: case 202: case 204:
          callback(null, head, body);
          break;
        case 301: case 302:
          callback({ name: stat, message: body });
          break; 
        case 400: case 401: case 402: case 403: case 404:
          callback({ name: stat, message: body });
          return; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          setTimeout(() => postData(url, body, callback), throttle());
          break;
        default:
          callback({ name: stat, message: body });
          break;
      }
    });
  });
  req.on('error', function(err) {
    callback({ name: err.code, message: err.message });
  });
  req.write(body);
  req.end();
};

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
          callback({ name: stat, message: body });
          break; 
        case 200: case 201: case 202: case 204:
          callback(null, head, body);
          break;
        case 301: case 302:
          callback({ name: stat, message: body });
          break; 
        case 400: case 401: case 402: case 403: case 404:
          callback({ name: stat, message: body });
          return;
        case 500: case 501: case 502: case 503: case 504: case 505:
          setTimeout(() => 
            postData2(url, auth, body, callback), throttle());
          break;
        default:
          callback({ name: stat, message: body });
          break;
      }
    });
  });
  req.on('error', function(err) {
    callback({ name: err.code, message: err.message });
  });
  req.write(body);
  req.end();
};

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
          callback({ name: stat, message: body });
          break; 
        case 200: case 201: case 202: case 204:
          callback(null, head, body);
          break;
        case 301: case 302:
          callback({ name: stat, message: body });
          break; 
        case 400: case 401: case 402: case 403: case 404:
          callback({ name: stat, message: body });
          return; 
        case 500: case 501: case 502: case 503: case 504: case 505:
          setTimeout(() => 
            postJson2(url, auth, body, callback), throttle());
          break;
        default:
          callback({ name: stat, message: body });
          break;
      }
    });
  });
  req.on('error', function(err) {
    callback({ name: err.code, message: err.message });
  });
  req.write(body);
  req.end();
};

export default { fetch, get, getJSON, get2, getJSON2, post2, postData, postData2, postJson2 };
