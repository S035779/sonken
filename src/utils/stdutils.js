import crypto from 'crypto';
import { URL, URLSearchParams } from 'url';

const env = process.env.PLATFORM;
const isNode = env === 'local';
const color_code = {
  Reset:      isNode ? "\x1b[0m" : ''
, Bright:     isNode ? "\x1b[1m" : ''
, Dim:        isNode ? "\x1b[2m" : ''
, Underscore: isNode ? "\x1b[4m" : ''
, Blink:      isNode ? "\x1b[5m" : ''
, Reverse:    isNode ? "\x1b[7m" : ''
, Hidden:     isNode ? "\x1b[8m" : ''

, FgBlack:    isNode ? "\x1b[30m" : ''
, FgRed:      isNode ? "\x1b[31m" : ''
, FgGreen:    isNode ? "\x1b[32m" : ''
, FgYellow:   isNode ? "\x1b[33m" : ''
, FgBlue:     isNode ? "\x1b[34m" : ''
, FgMagenta:  isNode ? "\x1b[35m" : ''
, FgCyan:     isNode ? "\x1b[36m" : ''
, FgWhite:    isNode ? "\x1b[37m" : ''

, BgBlack:    isNode ? "\x1b[40m" : ''
, BgRed:      isNode ? "\x1b[41m" : ''
, BgGreen:    isNode ? "\x1b[42m" : ''
, BgYellow:   isNode ? "\x1b[43m" : ''
, BgBlue:     isNode ? "\x1b[44m" : ''
, BgMagenta:  isNode ? "\x1b[45m" : ''
, BgCyan:     isNode ? "\x1b[46m" : ''
, BgWhite:    isNode ? "\x1b[47m" : ''
}

export default {
  toRGBa(str, a) {
    const r = parseInt(str.substr(1,2), 16);
    const g = parseInt(str.substr(3,2), 16);
    const b = parseInt(str.substr(5,2), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  },

  logError(caller, name, message) {
    const date = color_code['FgRed']
      + `[${this.getLocalISOTimeStamp(new Date)}]`;
    const head = color_code['Reset']
      + name;
    console.error(date ,'[ERROR]', caller, '-',head, ':', message);
  },

  logWarn(caller, name, message) {
    const date = color_code['FgYellow']
      + `[${this.getLocalISOTimeStamp(new Date)}]`;
    const head = color_code['Reset']
      + name;
    console.warn(date ,'[WARN]', caller, '-',head, ':', message);
  },

  logDebug(caller, name, message) {
    const date = color_code['FgCyan']
      + `[${this.getLocalISOTimeStamp(new Date)}]`;
    const head = color_code['Reset']
      + name;
    console.log(date ,'[DEBUG]', caller, '-',head, ':', message);
  },

  logTrace(caller, name, message) {
    const date = color_code['FgBlue']
      + `[${this.getLocalISOTimeStamp(new Date)}]`;
    const head = color_code['Reset']
      + name;
    console.trace(date, '[TRACE]', caller, '-', head, ':', message);
  },

  logInfo(caller, name, message) {
    const date = color_code['FgGreen']
      + `[${this.getLocalISOTimeStamp(new Date)}]`;
    const head = color_code['Reset']
      + name;
    console.info(date, '[INFO]', caller, '-', head, ':', message);
  },

  logTime(caller, name, message) {
    const date = color_code['FgMagenta']
      + `[${this.getLocalISOTimeStamp(new Date)}]`;
    const head = color_code['Reset']
      + name;
    switch(name) {
      case 'start':
        console.time(caller);
        break;
      case 'stop':
        console.timeEnd(caller);
        break;
      case 'log':
        console.timeLog(caller, date, '[TIME]', caller, '-', head, ':', message);
        break;
    }
  },

  is(type, obj) {
    const clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
  },

  /**
   * Copy the enumerable properties of p to o, and return o.
   * If o and p have a property by the same name, o's property is 
   * overwritten. This function does not handle getters and setters 
   * or copy attributes.
   *
   * @param {object} o
   * @param {object} p
   * @returns {object}
   */
  extend(o, p) {
    for(let prop in p) {            // For all props in p.
      o[prop] = p[prop];        // Add the property to o.
    }
    return o;
  },

  /**
   * Copy the enumerable properties of p to o, and return o.
   * If o and p have a property by the same name, o's property is 
   * left alone. This function does not handle getters and setters 
   * or copy attributes.
   *
   * @param {object} o
   * @param {object} p
   * @returns {object}
   */
  merge(o, p) {
    for(let  prop in p) {            // For all props in p.
      if (o.hasOwnProperty[prop]) continue;
                                // Except those already in o.
      o[prop] = p[prop];        // Add the property to o.
    }
    return o;
  },

  /**
   * Remove properties from o if there is not a property with the 
   * same name in p. Return o.
   *
   * @param {object} o
   * @param {object} p
   * @returns {object}
   */
  restrict(o, p) {
    for(let prop in o) {            // For all props in o
      if (!(prop in p)) delete o[prop];
                                // Delete if not in p
    }
    return o;
  },

  /**
   * For each property of p, delete the property with the same name 
   * from o. Return o.
   *
   * @param {object} o
   * @param {object} p
   * @returns {object}
   */
  subtract(o, p) {
    for(let prop in p) {            // For all props in p
      delete o[prop];           // Delete from o (deleting a
                                // nonexistent prop is harmless)
    }
    return o;
  },

  /**
   * Return a new object that holds the properties of both o and p.
   * If o and p have properties by the same name, the values 
   * from o are used.
   *
   * @param {object} o
   * @param {object} p
   * @returns {object}
   */
  union(o,p) {
    return extend(extend({},o), p);
  },

  /**
   * Return a new object that holds only the properties of o that 
   * also appear in p. This is something like the intersection of o 
   * and p, but the values of the properties in p are discarded
   *
   * @param {object} o
   * @param {object} p
   * @returns {object}
   */
  intersection(o,p) { 
    return restrict(extend({}, o), p); 
  },

  /**
   * Return an array that holds the names of the enumerable own 
   * properties of o.
   *
   * @param {object} o
   * @returns {array}
   */
  keys(o) {
    if (typeof o !== "object") throw TypeError();
                                // Object argument required
    let result = [];            // The array we will return
    for(let prop in o) {        // For all enumerable properties
      if (o.hasOwnProperty(prop)) 
                                // If it is an own property
        result.push(prop);      // add it to the array.
    }
    return result;              // Return the array.
  },

  /**
   * and
   *
   * @param {array} o
   * @param {array} p
   * @returns {array}
   */
  and(o, p) {
    if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    const _p = p.filter(function(x){ return x });
    const result = _o.concat(_p)
     .filter(function(x, i, y){ 
       return y.indexOf(x) !== y.lastIndexOf(x); })
     .filter(function(x, i, y){ 
       return y.indexOf(x) === i; });
    return result;
  },

  /**
   * del
   *
   * @param {array} o
   * @param {array} p
   * @returns {array}
   */
  del(o, p) {
    if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    const _p = p.filter(function(x){ return x });
    const result =
     _o.filter(function(x, i, y) { return _p.indexOf(x) === -1; });
    return result;
  },

  /**
   * add
   *
   * @param {array} o
   * @param {array} p
   * @returns {array}
   */
  add(o, p) {
    if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    const _p = p.filter(function(x){ return x });
    const result =
     _p.filter(function(x, i, y) { return _o.indexOf(x) === -1; });
    return result;
  },

  /**
   * dif
   *
   * @param {array} o
   * @param {array} p
   * @returns {array}
   */
  dif(o, p) {
    if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    const _p = p.filter(function(x){ return x });
    const result =
      _o.filter(function(x, i, y) { return _p.indexOf(x) === -1; })
     .concat(
        _p.filter(function(x, i, y) { 
          return _o.indexOf(x) === -1; })
      );
    return result;
  },

  /**
   * dup
   *
   * @param {array} o
   * @param {array} p
   * @returns {array}
   */
  dup(o, p) {
    if (!Array.isArray(o) || !Array.isArray(p)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    const _p = p.filter(function(x){ return x });
    const result = _o.concat(_p)
     .filter(function(x, i, y){ return y.indexOf(x) === i; });
    return result;
  },

  /**
   * dst.
   *
   * @param {array} o
   * @returns {array}
   */
  dst(o) { 
    if (!Array.isArray(o)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    const _p = _o.sort(function(s, t){
      const a=s.toString().toLowerCase();
      const b=t.toString().toLowerCase();
      if(a<b) return -1;
      if(a>b) return 1;
      return 0;
    });
    const result = _p.filter(function(x, i, y) {
      if(i===0) return true;
      return x!==y[i-1];
    })
    return result;
  },

  /**
   * oder by string.
   *
   * @param {array} o
   * @returns {array}
   */
  sortStr(o) { 
    if (!Array.isArray(o)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    return _o.sort(function(s, t){
      const a=s.toString().toLowerCase();
      const b=t.toString().toLowerCase();
      if(a<b) return -1;
      if(a>b) return 1;
      return 0;
    });
  },

  /**
   * sort by number,
   *
   * @param {array} o
   * @returns {array}
   */
  sortNum(o) { 
    if (!Array.isArray(o)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    return _o.sort(function(a, b){
      if(a<b) return -1;
      if(a>b) return 1;
      return 0;
    });
  },

  /**
   * sort value by object key string,
   *
   * @param {array} o
   * @param {string} k
   * @returns {array}
   */
  sortObjStr(o, k) { 
    if (!Array.isArray(o)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    return _o.sort(function(s, t){
      const a=s[k].toString().toLowerCase();
      const b=t[k].toString().toLowerCase();
      if(a<b) return -1;
      if(a>b) return 1;
      return 0;
    });
  },

  /**
   * sort value by object key unicode.,
   *
   * @param {array} o
   * @param {string} k
   * @returns {array}
   */
  sortObjUni(o, k) {
    if (!Array.isArray(o)) throw TypeError();
    const _o = o.filter(function(x){ return x });
    return _o.sort(function(s, t) {
      const a=s[k];
      const b=t[k];
      if(a<b) return -1;
      if(a>b) return 1;
    });
  },

  /**
   * getTimeStamp
   *
   * @returns {string}
   */
  getTimeStamp() {
    const dt = new Date();
    return dt.toISOString();
  },

  /**
   * getLocalTimeStamp
   *
   * @param {string} s
   * @returns {string}
   */
  getLocalTimeStamp(s) {
    const dt = new Date(s);
    const _yr = dt.getFullYear();
    const _mo = dt.getMonth() + 1;
    const _dy = dt.getDate();
    const _tm = dt.toTimeString().split(' ')[0];
    return `${_yr}-${_mo}-${_dy} ${_tm}`;
  },

  /**
   * getLocalDateStamp
   *
   * @param {string} s
   * @returns {string}
   */
  getLocalDateStamp(s) {
    const dt = new Date(s);
    const _mo = dt.getMonth() + 1;
    const _dy = dt.getDate();
    return `${_mo}/${_dy}`;
  },

  /**
   * Schedule an invocation or invovations of fn() in the future.
   * Note that the call to invoke() does not block: it returns 
   * right away.
   *
   * @param {function} fn - If interval is specified but end is 
   *                          omited, then never stop invoking fn.
   *                        If interval and end are omited, then 
   *                          just invoke fn once after start ms.
   *                        If only fn is specified, behave as is 
   *                          start was 0.
   * @param {number} s -  Wait start milliseconds, then call fn().
   * @param {number} i -  Call fn() every interval milliseconds.
   * @param {number} e -  Stopping after a total of start+end 
   *                      milliseconds.
   */
  invoke(fn, s, i, e) {
    if (!s) s = 0;
    setTimeout(fn, s);
    if (arguments.length >= 3) {
      setTimeout(() => {
        const h = setInterval(fn, i);
        if (e) setTimeout(() => { clearInterval(h); }, e);
      }, s);
    }
  },

  invokeMap(fn, s, i, e) {
    const argLen = arguments.length;
    if(!s) s = 0;
    let idx = 0;
    return arr => {
      const arrLen = arr.length;
      const setTime = (obj, idx) => setTimeout(fn.bind(this, obj), i*idx);
      setTimeout(fn.bind(this, arr.shift()), s);
      if (argLen >= 3) {
        setTimeout(() => arr.forEach(setTime), s);
      }
    };
  },

  /**
   * @param {function} fn - monitor callback (return true or false).
   * @param {function} rs - resolve callback (monitor results).
   * @param {function} rj - reject callback (time out).
   * @param {function} ed - complete callback;
   * @param {number} s -  Wait start milliseconds, then call fn().
   * @param {number} i -  Call fn() every interval milliseconds.
   * @param {number} e -  Stopping after a total of start+end 
   *                      milliseconds.
   * 
   *
   */
  invoke2(fn, rs, rj, ed, s, i, e) {
    if (!s) s = 0;
    setTimeout(() => {
      const _a = fn();
      rs(_a);
      if(_a) return ed();
      if(!e) return rj({ name: 'Error', message: 'TIME OUT!' });
    }, s);
    if (arguments.length >= 6) {
      let _b = 0;
      setTimeout(() => {
        const h = setInterval(() => {
          const _a = fn();
          rs(_a);
          if(_a) {
            clearInterval(h);
            return ed();
          }
          if((e-s) <= (i*++_b)) {
            clearInterval(h);
            return rj({ name: 'Error', message: 'TIME OUT!' });
          }
        }, i);
      }, s);
    }
  },

  /**
   * Decode an HTML form as if they were name/value pairs from 
   * the properties of an object, 
   * using application/x-www-form-urlencoded format↲
   */
  decodeFormData(text, sep, eq, isDecode) {
    text = text || location.search.substr(1);
    sep = sep || '&';
    eq = eq || '=';
    const decode = (isDecode) ? decodeURIComponent 
      : function(a) { return a; };
    return text.split(sep).reduce(function(obj, v) {
      const pair = v.split(eq);
      obj[pair[0]] = decode(pair[1]);
      return obj;
    }, {});
  },

  /**
   * Generated a randam characters, using 'Math.random()' method.
   * $length: number of characters to be generated.
   * added [ /*-+.,!#$%&()~|_  ] to makeRandStr.
   */
  rndPassword(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJLKMNOPQRSTUVWXYZ0123456789/*-+.,!#$%&()~|_';
    let str = '';
    for (let i = 0; i < length; ++i) {
      str += chars[ Math.floor( Math.random() * 78 ) ];
    }
    return str;
  },

  /**
   * Generated a randam characters, using 'Math.random()' method.
   * $length: number of characters to be generated.
   */
  rndString(length) {
    const chars =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJLKMNOPQRSTUVWXYZ0123456789';
    let str = '';
    for (let i = 0; i < length; ++i) {
      str += chars[ Math.floor( Math.random() * 62 ) ];
    }
    return str;
  },

  /**
   * Generated a randam characters, using 'Math.random()' method.
   * $length: number of characters to be generated.
   */
  rndInteger(length) {
    const chars = '123456789';
    let str = '';
    for (let i = 0; i < length; ++i) {
      str += chars[ Math.floor( Math.random() * 9 ) ];
    }
    return parseInt(str, 10);
  },

  /**
   * Function that return a character string decoded from Base 64.
   *
   * @param {string} string - Base64 charactor string.
   * @return {string}
   */
  decode_base64(string) {
    const b = Buffer.from(string, 'base64')
    return b.toString();
  },

  /**
   * Function that returns a character string encoded to BASE 64.
   *
   * @param {string} string - Ascii charactor string.
   * @return {string}
   */
  encode_base64(string) {
    const b = Buffer.from(string);
    return b.toString('base64');
  },

  /**
   * Function to combines two functions.
   * 
   * @param {function} join - fork-join function.
   * @param {function} func1 - function.
   * @param {function} func2 - function.
   * @return {function}
   */
  fork(join, func1, func2) {
    return val => join(func1(val), func2(val));
  },

  /**
   * Function to sort the key of the object.
   *
   * @param {object} obj - object.
   * @return {object} 
   */
  ksort(obj){
    const keys = [];
    for (let key in obj) {
      if(obj.hasOwnProperty(key)) keys.push(key);
    }
    keys.sort();
    let res = {};
    keys.forEach((key) => {
      res[key] = obj[key];
    });
    return res;
  },

  /**
   * Function that return a character string encode 
   * from Associative array object.
   * 
   * @param {objct} obj - query parameter object.
   * @return {string}
   */
  urlencode(data) {
    let results = '';
    if (data && typeof data === 'string') {
      results = encodeURIComponent(data);
    } else if(data && typeof data === 'object') {
      let pairs = [];
      for(let name in data) {
        if (!data.hasOwnProperty(name)) continue;
        if (typeof data[name] === "function") continue;
        let value = data[name].toString();
        name = encodeURIComponent(name);
        value = encodeURIComponent(value);
        pairs.push(name + "=" + value);
      }
      results = pairs.join('&');
    } 
    return results;
  },

  /**
   * Function that return a character string encode 
   * from Associative array object.
   * 
   * @param {objct} obj - query parameter object.
   * @return {string}
   */
  urlencode_fake(data) {
    const keys = [];
    for(let key in data) {
      if(data.hasOwnProperty(key)) keys.push(key);
    }
    return keys.map((key, idx) => `${key}=${data[key]}`)
      .map(pair => pair.replace(" ", "+"))
      .join('&');
  },

  /**
   * Function that return a character string encode 
   * from Associative array object.
   * 
   * @param {objct} obj - query parameter object.
   * @return {string}
   */
  urlencode_rfc3986(data) {
    const encode = obj => encodeURIComponent(obj)
      .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
    let results = '';
    if (data && typeof data === 'string') {
      results = encode(data);
    } else if(data && typeof data === 'object') {
      let pairs = [];
      for(let name in data) {
        if (!data.hasOwnProperty(name)) continue;
        if (typeof data[name] === "function") continue;
        let value = data[name].toString();
        name = encode(name);
        value = encode(value);
        pairs.push(name + "=" + value);
      }
      results = pairs.join('&');
    } 
    return results;
  },

  /**
   * Function that returns a character string encoded to sha256 hash. 
   *
   * @param {string} string - string to be converted.
   * @param {string} secret_key - secret key string required for conversion.
   */
  crypto_sha256(string, secret_key, digest) {
    const encode = digest || 'base64';
    return crypto.createHmac('sha256', secret_key).update(string).digest(encode);
  },

  crypto_pbkdf2(pass, salt, length) {
    return new Promise((resolve, reject) => {
      const random = cbk => crypto.randomBytes(128, cbk);
      const pbkdf2 = (slt, cbk) =>
        crypto.pbkdf2(pass, slt, 7000, length, 'sha256', cbk);
      const bin2str = bin => Buffer.from(bin).toString('hex');
      if(salt) {
        pbkdf2(salt, (err, _hash) => {
          if(err) return reject(err);
          resolve({ salt, hash: bin2str(_hash) });
        });
      } else {
        random((err, _salt) => {
          salt = bin2str(_salt);
          pbkdf2(salt, (err, _hash) => {
            if(err) return reject(err);
            resolve({ salt, hash: bin2str(_hash) });
          });
        })
      }
    })
  },

  /**
   * Function that returns instance. 
   *
   * @param {string} url - url character string.
   * @return {object} - return url instance.
   */
  parse_url(url) {
    return new URL(url);
  },

  /**
   * Function that returns instance. 
   *
   * @param {object} query - search query object.
   * @return {object} - return URLSearchParams instance.
   */
  parse_query(query) {
    return new URLSearchParams(query);
  },

  getLocalISOTimeStamp (date) {
    const setDate = [
      date.getFullYear()
    , ('00' + (date.getMonth() + 1)).substr(-2)
    , ('00' + date.getDate()).substr(-2)
    ];
    const setTime = [
      ('00' + date.getHours()).substr(-2)
    , ('00' + date.getMinutes()).substr(-2)
    , ('00' + date.getSeconds()).substr(-2)
    , ('00' + date.getMilliseconds()).substr(-3)
    ];
    return [
      setDate.join('-'), 'T', setTime.join(':')
    ].join('');
  },

  getLocalISOZoneStamp (date) {
    const setOffset = d => {
      const o = d.getTimezoneOffset() / -60;
      return ((0 < o) ? '+' : '-')
        + ('00' + Math.abs(o)).substr(-2) + ':00'; };
    const setDate = [
      date.getFullYear()
    , ('00' + (date.getMonth() + 1)).substr(-2)
    , ('00' + date.getDate()).substr(-2)
    ];
    const setTime = [
      ('00' + date.getHours()).substr(-2)
    , ('00' + date.getMinutes()).substr(-2)
    , ('00' + date.getSeconds()).substr(-2)
    , ('000' + date.getMilliseconds()).substr(-3)
    ];
    return [
      setDate.join('-'), 'T', setTime.join(':'), setOffset(date)
    ].join('');
  },

  /*
   * ex) formatDate(new Date('2015/03/04'), 'MMM dt, yyyy [w]');
   * => "Mar 4th, 2015 [Wed]"
   * @param {date} date - date instance.
   * @param {string} format - date format.
   * @return {string} - formated date string.
   */
  formatDate(date, format) {
    return dateFormat.format(date, format);
  },

  formatNumber(num, format) {
    return numFormat.format(num, format);
  },
  
  regexZip(postal_code, country_code) {
    return zipRegex.regex(country_code, postal_code);
  },

  //regexPhone(phone_number, country_code) {
  //  return /^[\d,-]+$/.test(phone_number);
  //}

  regexNumber(number) {
    return /^[\d,-]+$/.test(number);
  },

  regexEmail(address) {
    return /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(address);
  }

};

const numFormat = {
  fmt: {
    ddddd: function(num) { return ('0000' + num).slice(-5); },
    dddd: function(num) { return ('000' + num).slice(-4); },
    ddd: function(num) { return ('00' + num).slice(-3); },
    dd: function(num) { return ('0' + num).slice(-2); },
    t: function(num) { return num
        .toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"); }
  },
  format: function numFormat (num, format) {
    let result = format;
    for (let key in this.fmt)
      result = result.replace(key, this.fmt[key](num));
    return result;
  }
};

/*
 * std.dateFormat(new Date(), 'YYYY/MM/DD hh:mm');
 *
 */ 
const dateFormat = {
  fmt : {
    hh:   function(date) { return ('0' + date.getHours()).slice(-2); },
    h:    function(date) { return date.getHours(); },
    mm:   function(date) { return ('0' + date.getMinutes()).slice(-2); },
    m:    function(date) { return date.getMinutes(); },
    ss:   function(date) { return ('0' + date.getSeconds()).slice(-2); },
    s:    function(date) { return date.getSeconds(); },
    ccc:  function(date) {
      return ('00' + date.getMilliseconds()).slice(-3);
    },
    DD:   function(date) { return ('0' + date.getDate()).slice(-2); },
    D:    function(date) { return date.getDate(); },
    YYYY: function(date) { return date.getFullYear() + ''; },
    YY:   function(date) { return date.getFullYear()-2000 + ''; },
    t:    function(date) {
      return date.getDate()<=3
        ? ["st", "nd", "rd"][date.getDate()-1]: 'th';
    },
    w:    function(date) {
      return [
        "Sun", "$on", "Tue", "Wed", "Thu", "Fri", "Sat"
      ][date.getDay()];
    },
    MMMM: function(date) {
      return [
        "January", "February", "$arch", "April", "$ay", "June", "July"
      , "August", "September", "October", "November", "December"
      ][date.getMonth()];
    },
    MMM:  function(date) {
      return [
        "Jan", "Feb", "$ar", "Apr", "@ay", "Jun", "Jly", "Aug", "Spt"
      , "Oct", "Nov", "Dec"
      ][date.getMonth()];
    },  
    MM:   function(date) {
      return ('0' + (date.getMonth() + 1)).slice(-2);
    },
    M: function(date) { return date.getMonth() + 1; },
    $: function(date) { return 'M'; }
  },
  format:function dateFormat (date, format) {
    let result = format;
    for (let key in this.fmt)
      result = result.replace(key, this.fmt[key](date));
    return result;
  }
};

const zipRegex = {
  reg: {
    "GB":"GIR[ ]?0AA|((AB|AL|B|BA|BB|BD|BH|BL|BN|BR|BS|BT|CA|CB|CF|CH|CM|CO|CR|CT|CV|CW|DA|DD|DE|DG|DH|DL|DN|DT|DY|E|EC|EH|EN|EX|FK|FY|G|GL|GY|GU|HA|HD|HG|HP|HR|HS|HU|HX|IG|IM|IP|IV|JE|KA|KT|KW|KY|L|LA|LD|LE|LL|LN|LS|LU|M|ME|MK|ML|N|NE|NG|NN|NP|NR|NW|OL|OX|PA|PE|PH|PL|PO|PR|RG|RH|RM|S|SA|SE|SG|SK|SL|SM|SN|SO|SP|SR|SS|ST|SW|SY|TA|TD|TF|TN|TQ|TR|TS|TW|UB|W|WA|WC|WD|WF|WN|WR|WS|WV|YO|ZE)(\\d[\\dA-Z]?[ ]?\\d[ABD-HJLN-UW-Z]{2}))|BFPO[ ]?\\d{1,4}",
    "JE":"JE\\d[\\dA-Z]?[ ]?\\d[ABD-HJLN-UW-Z]{2}",
    "GG":"GY\\d[\\dA-Z]?[ ]?\\d[ABD-HJLN-UW-Z]{2}",
    "IM":"IM\\d[\\dA-Z]?[ ]?\\d[ABD-HJLN-UW-Z]{2}",
    "US":"\\d{5}([ \\-]\\d{4})?",
    "CA":"[ABCEGHJKLMNPRSTVXY]\\d[ABCEGHJ-NPRSTV-Z][ ]?\\d[ABCEGHJ-NPRSTV-Z]\\d",
    "DE":"\\d{5}",
    "JP":"\\d{3}-\\d{4}",
    "FR":"\\d{2}[ ]?\\d{3}",
    "AU":"\\d{4}",
    "IT":"\\d{5}",
    "CH":"\\d{4}",
    "AT":"\\d{4}",
    "ES":"\\d{5}",
    "NL":"\\d{4}[ ]?[A-Z]{2}",
    "BE":"\\d{4}",
    "DK":"\\d{4}",
    "SE":"\\d{3}[ ]?\\d{2}",
    "NO":"\\d{4}",
    "BR":"\\d{5}[\\-]?\\d{3}",
    "PT":"\\d{4}([\\-]\\d{3})?",
    "FI":"\\d{5}",
    "AX":"22\\d{3}",
    "KR":"\\d{3}[\\-]\\d{3}",
    "CN":"\\d{6}",
    "TW":"\\d{3}(\\d{2})?",
    "SG":"\\d{6}",
    "DZ":"\\d{5}",
    "AD":"AD\\d{3}",
    "AR":"([A-HJ-NP-Z])?\\d{4}([A-Z]{3})?",
    "AM":"(37)?\\d{4}",
    "AZ":"\\d{4}",
    "BH":"((1[0-2]|[2-9])\\d{2})?",
    "BD":"\\d{4}",
    "BB":"(BB\\d{5})?",
    "BY":"\\d{6}",
    "BM":"[A-Z]{2}[ ]?[A-Z0-9]{2}",
    "BA":"\\d{5}",
    "IO":"BBND 1ZZ",
    "BN":"[A-Z]{2}[ ]?\\d{4}",
    "BG":"\\d{4}",
    "KH":"\\d{5}",
    "CV":"\\d{4}",
    "CL":"\\d{7}",
    "CR":"\\d{4,5}|\\d{3}-\\d{4}",
    "HR":"\\d{5}",
    "CY":"\\d{4}",
    "CZ":"\\d{3}[ ]?\\d{2}",
    "DO":"\\d{5}",
    "EC":"([A-Z]\\d{4}[A-Z]|(?:[A-Z]{2})?\\d{6})?",
    "EG":"\\d{5}",
    "EE":"\\d{5}",
    "FO":"\\d{3}",
    "GE":"\\d{4}",
    "GR":"\\d{3}[ ]?\\d{2}",
    "GL":"39\\d{2}",
    "GT":"\\d{5}",
    "HT":"\\d{4}",
    "HN":"(?:\\d{5})?",
    "HU":"\\d{4}",
    "IS":"\\d{3}",
    "IN":"\\d{6}",
    "ID":"\\d{5}",
    "IL":"\\d{5}",
    "JO":"\\d{5}",
    "KZ":"\\d{6}",
    "KE":"\\d{5}",
    "KW":"\\d{5}",
    "LA":"\\d{5}",
    "LV":"\\d{4}",
    "LB":"(\\d{4}([ ]?\\d{4})?)?",
    "LI":"(948[5-9])|(949[0-7])",
    "LT":"\\d{5}",
    "LU":"\\d{4}",
    "MK":"\\d{4}",
    "MY":"\\d{5}",
    "MV":"\\d{5}",
    "MT":"[A-Z]{3}[ ]?\\d{2,4}",
    "MU":"(\\d{3}[A-Z]{2}\\d{3})?",
    "MX":"\\d{5}",
    "MD":"\\d{4}",
    "MC":"980\\d{2}",
    "MA":"\\d{5}",
    "NP":"\\d{5}",
    "NZ":"\\d{4}",
    "NI":"((\\d{4}-)?\\d{3}-\\d{3}(-\\d{1})?)?",
    "NG":"(\\d{6})?",
    "OM":"(PC )?\\d{3}",
    "PK":"\\d{5}",
    "PY":"\\d{4}",
    "PH":"\\d{4}",
    "PL":"\\d{2}-\\d{3}",
    "PR":"00[679]\\d{2}([ \\-]\\d{4})?",
    "RO":"\\d{6}",
    "RU":"\\d{6}",
    "SM":"4789\\d",
    "SA":"\\d{5}",
    "SN":"\\d{5}",
    "SK":"\\d{3}[ ]?\\d{2}",
    "SI":"\\d{4}",
    "ZA":"\\d{4}",
    "LK":"\\d{5}",
    "TJ":"\\d{6}",
    "TH":"\\d{5}",
    "TN":"\\d{4}",
    "TR":"\\d{5}",
    "TM":"\\d{6}",
    "UA":"\\d{5}",
    "UY":"\\d{5}",
    "UZ":"\\d{6}",
    "VA":"00120",
    "VE":"\\d{4}",
    "ZM":"\\d{5}",
    "AS":"96799",
    "CC":"6799",
    "CK":"\\d{4}",
    "RS":"\\d{6}",
    "ME":"8\\d{4}",
    "CS":"\\d{5}",
    "YU":"\\d{5}",
    "CX":"6798",
    "ET":"\\d{4}",
    "FK":"FIQQ 1ZZ",
    "NF":"2899",
    "FM":"(9694[1-4])([ \\-]\\d{4})?",
    "GF":"9[78]3\\d{2}",
    "GN":"\\d{3}",
    "GP":"9[78][01]\\d{2}",
    "GS":"SIQQ 1ZZ",
    "GU":"969[123]\\d([ \\-]\\d{4})?",
    "GW":"\\d{4}",
    "HM":"\\d{4}",
    "IQ":"\\d{5}",
    "KG":"\\d{6}",
    "LR":"\\d{4}",
    "LS":"\\d{3}",
    "MG":"\\d{3}",
    "MH":"969[67]\\d([ \\-]\\d{4})?",
    "MN":"\\d{6}",
    "MP":"9695[012]([ \\-]\\d{4})?",
    "MQ":"9[78]2\\d{2}",
    "NC":"988\\d{2}",
    "NE":"\\d{4}",
    "VI":"008(([0-4]\\d)|(5[01]))([ \\-]\\d{4})?",
    "PF":"987\\d{2}",
    "PG":"\\d{3}",
    "PM":"9[78]5\\d{2}",
    "PN":"PCRN 1ZZ",
    "PW":"96940",
    "RE":"9[78]4\\d{2}",
    "SH":"(ASCN|STHL) 1ZZ",
    "SJ":"\\d{4}",
    "SO":"\\d{5}",
    "SZ":"[HLMS]\\d{3}",
    "TC":"TKCA 1ZZ",
    "WF":"986\\d{2}",
    "XK":"\\d{5}",
    "YT":"976\\d{2}",
    "ZZ":"[\\d,-]+"
  },
  regex: function(country_code, postal_code) {
    const reg = this.reg[country_code]
      ? this.reg[country_code] : this.reg['ZZ']
    return new RegExp('^'+reg+'$').test(postal_code); }
};
