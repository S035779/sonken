import fs from 'fs';
import xml2js from 'xml2js';
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

  request(req, opt) {
    switch(req) {
      case 'rss':
        return new Promise((resolve, reject) => {
          net.get2(opt.url, {}, (err, head, body) => {
            if(err) reject(err);
            resolve(body);
          });
        });
        break;
      case 'file':
        return new Promise((resolve, reject) => {
          fs.readFile(path + opt.file, { encoding: 'utf-8' }
            , (err, data) => {
              if(err) reject(err);
              resolve(data);
            });
        });
        break;
      case 'xml':
        return new Promise((resolve, reject) => {
          const parser = new xml2js().Paeser();
          parser.parseString(opt.xml, (err, data) => {
            if(err) reject(err);
            resolve(data);
          }); 
        });
        break;
      default:
        break;
    }
  }

  getRss(url) {
    return this.request('rss', { url });
  }

  getFile(file) {
    return this.request('file', { file });
  }

  getXml(xml) {
    return this.request('xml', { xml });
  }

  forFile(files) {
    const promises = R.map(this.getFile.bind(this), files);
    return Rx.Observable.forkJoin(promises);
  }

  forXml(xmls) {
    const promises = R.map(this.getXml.bind(this), xmls);
    return Rx.Observable.forkJoin(promises);
  }

  parseXml() {
    return this.forFile(files)
      .flatMap(file => this.forXml(file))
      .map(this.setXmls.bind(this))
      .map(R.tap(this.logTrace.bind(this)));
  }

  fetchRss({ url, category }) {
    return Rx.Observable.fromPromise(this.getRss(url))
      .map(R.tap(this.logTrace.bind(this)));
  }

  parseRss({ url, category }) {
  }

  logTrace(message) {
    log.trace(`${pspid}>`, 'Trace:', message);
  }

  setXmls(objs) {
    return { rss: objs };
  }
};
export default FeedParser;
