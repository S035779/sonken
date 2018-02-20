import fs from 'fs';
import { parseString } from 'xml2js';
import R from 'ramda';
import Rx from 'rx';
import std from 'Utilities/stdutils';
import net from 'Utilities/netutils';
import { logs as log } from 'Utilities/logutils';

const pspid = 'FeedParser';

const path = __dirname + '/../xml/'
const files = [
  'data.xml'
];

/**
 * FeedPaser class.
 *
 * @constructor
 * @param {string} length - Length of shippment.
 * @param {string} height - Weight of shippment.
 * @param {string} from - Shipping source.
 */
class FeedParser {
  constructor() {
  }

  static of() {
    return new FeedParser();
  }

  request(request, options) {
    switch(request) {
      case 'fetch/rss':
        return new Promise((resolve, reject) => {
          net.get2(options.url
          , null, (err, head, body) => {
            if(err) reject(err);
            resolve(body);
          });
        });
        break;
      case 'fetch/file':
        return new Promise((resolve, reject) => {
          fs.readFile(path + options.file
          , { encoding: 'utf-8' }
          , (err, data) => {
            if(err) reject(err);
            resolve(data);
          });
        });
        break;
      case 'parse/xml':
        return new Promise((resolve, reject) => {
          parseString(options.xml, {}
          , (err, data) => {
            if(err) reject(err);
            resolve(data);
          }); 
        });
        break;
      default:
        return new Promise((resolve, reject) => {
          reject(options);
        });
        break;
    }
  }

  getRss(url) {
    return this.request('fetch/rss', { url });
  }

  getFile(file) {
    return this.request('fetch/file', { file });
  }

  getXml(xml) {
    return this.request('parse/xml', { xml });
  }

  fetchRss(url) {
    return Rx.Observable.fromPromise(this.getRss(url));
  }

  forFile(files) {
    const promises = R.map(this.getFile.bind(this), files);
    return Rx.Observable.forkJoin(promises);
  }

  forXml(xmls) {
    const promises = R.map(this.getXml.bind(this), xmls);
    return Rx.Observable.forkJoin(promises);
  }

  parseXml(xml) {
    return Rx.Observable.fromPromise(this.getXml(xml));
  }

  parseRss({ url, category }) {
    return this.fetchRss(url)
      .flatMap(obj => this.parseXml(obj))
      .map(R.tap(this.logTrace.bind(this)));
  }

  parseFile() {
    return this.forFile(files)
      .flatMap(file => this.forXml(file))
      .map(this.setXmls.bind(this))
      .map(R.tap(this.logTrace.bind(this)));
  }

  logTrace(message) {
    log.trace(`${pspid}>`, 'Trace:', message);
  }

  setXmls(objs) {
    return { rss: objs };
  }
};
export default FeedParser;
