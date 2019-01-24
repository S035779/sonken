import * as R           from 'ramda';
import { from }         from 'rxjs';
import { map }          from 'rxjs/operators';
import google           from 'google-search-scraper';
//import osmosis          from 'osmosis';
import PromiseThrottle  from 'promise-throttle';
import searchIndex      from 'Utilities/amzindex';
import log              from 'Utilities/logutils';

class Google {
  constructor() {
    this.promiseThrottle = new PromiseThrottle({ requestsPerSecond: 0.05, promiseImplementation: Promise });
  }

  static of() {
    return new Google();
  }

  request(searchs) {
    return new Promise((resolve, reject) => {
      if(!searchs) return reject({ name: 'NotQuery', message: 'request query was not found.', stack: searchs }); 
      const urls = [];
      const limit = 10;
      const query = R.join(' ', searchs);
      log.info(Google.displayName, 'Request', query);
      google.search({ query, limit }, (err, url) => {
        if (err) reject(err)
        urls.push(url);
        if(urls.length === limit) resolve(urls);
      });
    });
  }

  //request(searchs) {
  //  return new Promise((resolve, reject) => {
  //    osmosis
  //      .get('www.google.com')
  //      .set({ })
  //  });
  //}

  trequest(searchs) {
    return this.promiseThrottle.add(this.request.bind(this, searchs));
  }

  fetchItemSearch(keywords, categoryid) {
    const searchs = ['site:https://www.amazon.co.jp/', this.setKeywords(keywords), this.setSearchIndex(categoryid)];
    const setAsins = urls => {
      const results = [];
      const re = /^https:\/\/www\.amazon\.co\.jp\/.*\/dp\/(\w{10})/i;
      urls.forEach(url => {
        if(R.test(re, url)) {
          const result = R.match(re, url);
          const asin = { ASIN: result[1] };
          results.push(asin); 
        }
      });
      return results;
    };
    return from(this.trequest(searchs)).pipe(
        map(setAsins)
      , map(R.tap(log.trace.bind(this)))
      );
  }

  setSearchIndex(categoryid) {
    const keys       = R.keys(searchIndex);
    const values     = key => R.prop(key, searchIndex);
    const isCategory = key => R.contains(Number(categoryid), values(key));
    const isIndex    = R.filter(isCategory);
    const setIndex   = R.compose(R.head, isIndex);
    return setIndex(keys);
  }

  setKeywords(keywords) {
    let results = '';
    if(keywords && typeof keywords === 'string') {
      results = keywords;
    } else if(keywords && Array.isArray(keywords)) {
      results = R.join(' ', keywords);
    }
    return results;
  }
}
Google.displayName = '[GGL]';
export default Google;
