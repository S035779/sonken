import * as R           from 'ramda';
import { from }         from 'rxjs';
import { map }          from 'rxjs/operators';
import osmosis          from 'osmosis';
import PromiseThrottle  from 'promise-throttle';
import searchIndex      from 'Utilities/amzindex';
import std              from 'Utilities/stdutils';
import log              from 'Utilities/logutils';

class Google {
  constructor() {
    this.promiseThrottle = new PromiseThrottle({ requestsPerSecond: 0.1, promiseImplementation: Promise });
  }

  static of() {
    return new Google();
  }

  request(searchs) {
    const searchString = R.join(' ', searchs);
    const searchEngine = std.parse_url(`https://www.google.com/search?hl=ja&safe=off&tbo=d&qscrl=1&btnI=1&q="${searchString}","検索"`);
    return new Promise((resolve, reject) => {
      let results = [];
      osmosis
        .get(searchEngine.href)
        .find('.srg:first .g:gt(0)')
        .set({ title: '.LC20lb', site: '.iUh30' })
        .data(data => results.push(data.site))
        .then((context, data) => {
          const params = context.resquest.params;
          const title = data.title;
          const site = data.cite;
          log.info(Google.displayName, 'Request:', params, 'title =', title, 'site =', site);
        })
        .log(msg    => log.trace(Google.displayName, 'Request:', msg))
        .debug(msg  => log.debug(Google.displayName, 'Request:', msg))
        .error(msg  => reject({ name: 'Request:', message: msg, stack: '' }))
        .done(()    => resolve(results));
    });
  }

  throttle(searchs) {
    return this.promiseThrottle.add(this.request.bind(this, searchs));
  }

  fetchItemSearch(keywords, categoryid) {
    const searchs = ['site:https://www.amazon.co.jp/', this.setKeywords(keywords), this.setSearchIndex(categoryid)];
    const setAsins = urls => {
      const results = [];
      urls.forEach(url => {
        const result = R.match(/^https:\/\/www\.amazon\.co\.jp\/.*\/dp\/(\w{10})/i, url);
        if(result) results.push(result[1]); 
      });
      return results;
    };
    return from(this.throttle(searchs)).pipe(
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
