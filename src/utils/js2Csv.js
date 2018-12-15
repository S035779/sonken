import R from 'ramda';
import std from 'Utilities/stdutils';

class js2Csv {
  constructor(data, keys, header) {
    this.ARRAY  = Symbol('ARRAY');
    this.OBJECT = Symbol('OBJECT');
    this.data = data;
    if (js2Csv.isArray(data)) {
      if (0 === data.length) {
        this.dataType = this.ARRAY;
      } else if (js2Csv.isObject(data[0])) {
        this.dataType = this.OBJECT;
      } else if (js2Csv.isArray(data[0])) {
        this.dataType = this.ARRAY;
      } else {
        throw Error('Error: 未対応のデータ型です(0)');
      }
    } else {
      throw Error('Error: 未対応のデータ型です(1)');
    }
    this.keys = keys;
    this.header = header;
  }

  static of({ csv, keys, header }) {
    const _keys = !R.isNil(keys) ? keys : false;
    const _header = !R.isNil(header) ? header : true;
    return new js2Csv(csv, _keys, _header);
  }

  toString() {
    const keys = this.keys || Array.from(this.extractKeys(this.data))
    const setRecrd = obj => R.map(key => obj[key], keys);
    const setBodys = R.map(setRecrd);
    const setHeads = objs => this.header ? R.concat([keys], objs) : objs;
    const setQuota = R.map(R.map(js2Csv.prepare));
    const setSprta = R.map(R.join(','));
    const setEnter = R.join('\n');
    const setEOL   = str => str + '\n';
    if (this.dataType === this.ARRAY) {
      return R.compose(
        setEOL
      , setEnter
      , setSprta
      , setQuota
      )(this.data);
    } else if (this.dataType === this.OBJECT) {
      return R.compose(
        setEOL
      , setEnter
      , setSprta
      , setQuota
      , setHeads
      , setBodys
      )(this.data);
    }
  }

  parse() {
    return this.toString();
  }

  save(filename = 'data.csv') {
    if (!filename.match(/\.csv$/i)) { filename = filename + '.csv' }
    console.info('filename:', filename)
    console.table(this.data)
    const csvStr = this.toString()
    const bom     = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob    = new Blob([bom, csvStr], {'type': 'text/csv'});
    const url     = window.URL || window.webkitURL;
    const blobURL = url.createObjectURL(blob);
    let a      = document.createElement('a');
    a.download = decodeURI(filename);
    a.href     = blobURL;
    a.type     = 'text/csv';
    a.click();
  }

  extractKeys() {
    return new Set([].concat(...this.data.map((record) =>
      Object.keys(record)
    )));
  }

  static prepare(field) {
    field = R.isNil(field)
      ? ''
      : R.is(Date, field) 
        ? std.formatDate(new Date(field), 'YYYY/MM/DD hh:mm')
        : R.is(Object, field) || R.is(Array, field)
          ? JSON.stringify(field)
          : field;
    return '"' + (''+field).replace(/"/g, '""') + '"'
  }

  static isObject(obj) {
    return '[object Object]' === Object.prototype.toString.call(obj)
  }

  static isArray(obj) {
    return '[object Array]' === Object.prototype.toString.call(obj)
  }
}
js2Csv.displayName = 'js2csv';
export default js2Csv;
