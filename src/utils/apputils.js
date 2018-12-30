import * as R           from 'ramda';
import fs               from 'fs';
import zlib             from 'zlib';
import compressible     from 'compressible';
import onheaders        from 'on-headers';
import vary             from 'vary';
import accepts          from 'accepts';
import bytes            from 'bytes';
import log              from 'Utilities/logutils';

const displayName = 'apputils';

const manifest = filepath => {
  try {
    log.info(displayName, 'Manifest file', filepath);
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    const err = { name: 'NotFound', message: 'Manifest file not found.' };
    throw new Error(err);
  }
}

const compression = options => {
  const _options = options || {};
  const filter = _options.filter || isCompress;
  const threshold = _options.threshold ? bytes.parse(_options.threshold) : 1024;

  return (req, res, next) => {
    let stream, ended = false, listeners = [], length;
    const _write  = res.write;
    const _end    = res.end;
    const _on     = res.on;
    res.flush = function() { if(stream) stream.flush(); };
    res.write = function(chunk, encoding) {
      if(ended) return false;
      if(!this._header) this._implicitHeader();
      const _buffer = Buffer.from(chunk, encoding)
      return !R.isNil(stream) ? stream.write(_buffer) : _write.call(this, chunk, encoding)
    };
    res.end  = function(chunk, encoding) {
      if(ended) return false;
      if(!this._header) {
        if(!this.getHeader('Content-Length')) length = chunkLength(chunk, encoding);
        this._implicitHeader();
      }
      if(R.isNil(stream)) return _end.call(this, chunk, encoding);
      ended = true;
      const _buffer = Buffer.from(chunk, encoding);
      return !R.isNil(chunk) ? stream.end(_buffer) : stream.end();
    };
    res.on   = function(type, listener) {
      if(!R.isNil(listeners) || type !== 'drain') return _on.call(this, type, listener);
      if(!R.isNil(stream)) return stream.on(type, listener);
      listeners.push([ type, listener ]);
      return this;
    };

    const nocompress = msg => {
      log.debug(displayName, 'no compression', msg);
      addListener(res, _on, listeners);
      listeners = null;
    };

    const isThreshold = (req, res) => {
      const contentLength = Number(res.getHeader('Content-Length'));
      return contentLength < threshold || length < threshold;
    };

    onheaders(res, () => {
      log.info(displayName, 'compression', 'onHeaders');
      if(!filter(req, res))                 return nocompress('filtered');
      if(!isTransform(req, res))            return nocompress('no transform');
      vary(res, 'Accept-Encoding');
      if(!isThreshold(req, res))            return nocompress('size below threshold');
      const encoding = res.getHeader('Content-Encoding') || 'identity';
      if(encoding !== 'identity')           return nocompress('already encoded');
      if(req.method === 'HEAD')             return nocompress('HEAD request');
      const accept = accepts(req);
      let method = accept.encoding(['gzip', 'deflate', 'identity']);
      if(method === 'deflate' && accept.encoding(['gzip'])) method = accept.encoding(['gzip', 'identity']);
      if(!method || method === 'identity')  return nocompress('not acceptable');
      stream = method === 'gzip' ? zlib.createGzip(_options) : zlib.createDeflate(_options);
      addListener(stream, stream.on, listeners);
      res.setHeader('Content-Encoding', method);
      res.removeHeader('Content-Length');
      stream.on('data', chunk => { if(_write.call(res, chunk) === false) stream.pause(); });
      stream.on('end', () => _end.call(res));
      _on.call(res, 'drain', () => stream.resume());
    });
    next();
  };
}

const chunkLength = (chunk, encoding) => {
  if(R.isNil(chunk)) return  0; 
  return Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding);
};

const isCompress = (req, res) => {
  const contentType = res.getHeader('Content-Type');
  if(R.isNil(contentType) || !compressible(contentType)) {
    log.debug(displayName, 'not compressible', contentType);
    return false;
  }
  return true;
};

const isTransform = (req, res) => {
  const cacheControl = res.getHeader('Cache-Control');
  return !R.isNil(cacheControl) || !R.test(/(?:^|,)\s*?no-transform\s*?(?:,|$)/, cacheControl)
};

const addListener = (stream, on, listeners) => {
  for(let i = 0; i < listeners.length; i++) on.apply(stream, listeners[i]);
};

export default { compression, manifest };
