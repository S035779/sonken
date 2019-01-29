import * as R           from 'ramda';
import { from }         from 'rxjs';
import { map }          from 'rxjs/operators';
import puppeteer        from 'puppeteer';
import PromiseThrottle  from 'promise-throttle';
import log              from 'Utilities/logutils';

class CloudSearch {
  constructor() {
    this.topPromiseThrottle = new PromiseThrottle({ 
      requestsPerSecond: 0.333, promiseImplementation: Promise
    });
    this.promiseThrottle = new PromiseThrottle({ 
      requestsPerSecond: 0.3, promiseImplementation: Promise
    });
    this.browserOptions = { headless: false, defaultViewport: { width: 1200, height: 800 } };
  }

  static of() {
    return new CloudSearch();
  }

  topenPage(params) {
    return this.topPromiseThrottle.add(this.openPage.bind(this, params));
  }

  tsearchGoogleHead(params) {
    return this.promiseThrottle.add(this.searchGoogleHead.bind(this, params));
  }

  tsearchGoogleTail(params) {
    return this.promiseThrottle.add(this.searchGoogleTail.bind(this, params));
  }

  tsearchBingHead(params) {
    return this.promiseThrottle.add(this.searchBingHead.bind(this, params));
  }

  tsearchBingTail(params) { 
    return this.promiseThrottle.add(this.searchBingTail.bind(this, params)); 
  }

  async request(operation, options) {
    log.info(CloudSearch.displayName, 'Request', operation);
    switch(operation) {
      case 'open/page':
        {
          const { site } = options;
          if(!this.browser) this.browser = await puppeteer.launch(this.browserOptions);
          const page = await this.browser.newPage();
          await page.goto(site, { waitUntil: 'load' });
          return { page };
        }
      case 'signin/google':
        {
          const { page } = options;
          const loginChk = await page.evaluate(() => {
            const node = document.querySelectorAll('div.gb_ad > a#gb_70.gb_Ue.gb_Ba.gb_Tb');
            return node.length ? false : true;
          });

          if(!loginChk) {
            await page.waitForSelector('div.gb_ad > a#gb_70.gb_Ue.gb_Ba.gb_Tb');
            await page.click('div.gb_ad > a#gb_70.gb_Ue.gb_Ba.gb_Tb');

            await page.waitForSelector('div.Xb9hP > input[name="identifier"]');
            await page.type('div.Xb9hP > input[name="identifier"]', 'tadtarch@gmail.com');
            await page.click('div#identifierNext.U26fgb.O0WRkf.zZhnYe.e3Duub.C0oVfc.DL0QTb > div.ZFr60d.CeoRYc');

            await page.waitFor(1000);
            await page.waitForSelector('div.Xb9hP > input.whsOnd.zHQkBf');
            await page.type('div.Xb9hP > input.whsOnd.zHQkBf', '7952079tI$');
            await page.click('div#passwordNext.U26fgb.O0WRkf.zZhnYe.e3Duub.C0oVfc.DL0QTb > div.ZFr60d.CeoRYc');
          }
          return { page };
        }
      case 'search/google/head':
        {
          const { page, string } = options;
          const { title } = string;
          await page.waitForSelector('input[name="q"]');
          await page.type('input[name="q"]', 'site:https://www.amazon.co.jp/ ' + title);
          await page.click('div.FPdoLc.VlcLAe > center > input[name="btnK"]');
          await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
          const datas = await page.evaluate(() => {
            const nodeList = document.querySelectorAll('div.r > a');
            let urls = [];
            nodeList.forEach(node => {
              urls.push(node.href);
            });
            return urls;
          });
          const result = { title, datas };
          log.debug(CloudSearch.displayName, operation, result);
          return { page, result };
        }
      case 'search/google/tail':
        {
          const { page, string } = options;
          const { title } = string;
          await page.waitForSelector('div.a4bIc > input[name="q"]');
          await page.click('div.a4bIc > input[name="q"]', { clickCount: 3 });
          await page.type('div.a4bIc > input[name="q"]', 'site:https://www.amazon.co.jp/ ' + title);
          await page.click('div.RNNXgb > button.Tg7LZd');
          await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
          const datas = await page.evaluate(() => {
            const nodeList = document.querySelectorAll('div.r > a');
            let urls = [];
            nodeList.forEach(node => {
              urls.push(node.href);
            });
            return urls;
          });
          const result = { title, datas };
          log.debug(CloudSearch.displayName, operation, result);
          return { page, result };
        }
      case 'search/bing/head':
        {
          const { page, string } = options;
          const { title } = string;
          await page.waitForSelector('div.b_searchboxForm > input[name="q"]');
          await page.type('div.b_searchboxForm > input[name="q"]', 'site:https://www.amazon.co.jp/ ' + title);
          await page.click('div.b_searchboxForm > input#sb_form_go.b_searchboxSubmit');
          await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
          const datas = await page.evaluate(() => {
            const nodeList = document.querySelectorAll('li.b_algo > h2 > a');
            let urls = [];
            nodeList.forEach(node => {
              urls.push(node.href);
            });
            return urls;
          });
          const result = { title, datas };
          log.debug(CloudSearch.displayName, operation, result);
          return { page, result };
        }
      case 'search/bing/tail':
        {
          const { page, string } = options;
          const { title } = string;
          await page.waitForSelector('div.b_searchboxForm > input[name="q"]');
          await page.click('div.b_searchboxForm > input[name="q"]', { clickCount: 3 });
          await page.type('div.b_searchboxForm > input[name="q"]', 'site:https://www.amazon.co.jp/ ' + title);
          await page.click('div.b_searchboxForm > input#sb_form_go.b_searchboxSubmit');
          await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
          const datas = await page.evaluate(() => {
            const nodeList = document.querySelectorAll('li.b_algo > h2 > a');
            let urls = [];
            nodeList.forEach(node => {
              urls.push(node.href);
            });
            return urls;
          });
          const result = { title, datas };
          log.debug(CloudSearch.displayName, operation, result);
          return { page, result };
        }
      case 'signout/google':
        {
          const { page, results } = options;
          await page.waitForSelector('a.gb_b.gb_hb.gb_R > span.gb_cb.gbii');
          await page.click('a.gb_b.gb_hb.gb_R > span.gb_cb.gbii');
          await page.waitForSelector('div.gb_ug.gb_Sb > div > a#gb_71.gb_Aa.gb_xg.gb_Eg.gb_ef.gb_Tb');
          await page.click('div.gb_ug.gb_Sb > div > a#gb_71.gb_Aa.gb_xg.gb_Eg.gb_ef.gb_Tb');
          return { page, results };
        }
      case 'close/page':
        {
          const { results } = options;
          await this.browser.close();
          return results;
        }
      default:
        return Promise.reject(new Error({ 
          name: 'Invalid request:', message: 'Request is not implemented.', stack: operation
        }));
    }
  }

  createBrowser() {
    return this.request('create/browser', this.browserOptions);
  }
  openPage(site) {
    return this.request('open/page', { site });
  }

  signinGoogle({ page }) {
    return this.request('signin/google', { page });
  }

  searchGoogleHead({ page, string }) {
    return this.request('search/google/head', { page, string });
  }

  searchGoogleTail({ page, string }) {
    return this.request('search/google/tail', { page, string });
  }

  searchBingHead({ page, string }) {
    return this.request('search/bing/head', { page, string });
  }

  searchBingTail({ page, string }) {
    return this.request('search/bing/tail', { page, string }); 
  }

  signoutGoogle({ page, results }) {
    return this.request('signout/google', { page, results });
  }

  closePage({ page, results }) {
    return this.request('close/page', { page, results });
  }

  searchGoogle(searchs) {
    const searchHeads = [R.head(searchs)];
    const searchTails = R.tail(searchs);
    const heads = R.map(search => this.tsearchGoogleHead(search), searchHeads);
    const tails = R.map(search => this.tsearchGoogleTail(search), searchTails)
    return R.concat(heads, tails);
  }

  searchBing(searchs) {
    const searchHeads = [R.head(searchs)];
    const searchTails = R.tail(searchs);
    const heads = R.map(search => this.tsearchBingHead(search), searchHeads);
    const tails = R.map(search => this.tsearchBingTail(search), searchTails);
    return R.concat(heads, tails);
  }

  setSearchs(strings) {
    return function({ page }) {
      return R.map(string => ({ page, string }), strings);
    };
  }

  getResults(searchs) {
    const searchHead = R.head(searchs);
    const page = searchHead.page;
    const results = R.map(obj => obj.result, searchs);
    return { page, results };
  }

  scrapsByGoogle(strings) {
    log.info(CloudSearch.displayName, 'scrapsByGoogle', strings.length);
    const promises = objs => this.searchGoogle(objs);
    return this.topenPage('https://www.google.co.jp/')
      .then(obj => this.signinGoogle(obj))
      .then(obj => this.setSearchs(strings)(obj))
      .then(objs => Promise.all(promises(objs)))
      .then(obj => this.getResults(obj))
      .then(obj => this.signoutGoogle(obj))
      .then(R.tap(console.log))
      .then(obj => this.closePage(obj))
    ;
  }

  scrapsByBing(strings) {
    log.info(CloudSearch.displayName, 'scrapsByBing', strings.length);
    const promises = objs => this.searchBing(objs);
    return this.topenPage('https://www.bing.com/')
      .then(obj => this.setSearchs(strings)(obj))
      .then(objs => Promise.all(promises(objs)))
      .then(obj => this.getResults(obj))
      .then(obj => this.closePage(obj))
      .then(R.tap(console.log))
    ;
  }

  forItemSearch(keywords) {
    const setAsin = ({ title, datas }) => {
      const asins = [];
      const re = /^https:\/\/www\.amazon\.co\.jp\/.*\/dp\/(\w{10})/i;
      datas.forEach(url => {
        if(R.test(re, url)) {
          const result = R.match(re, url);
          const asin = { ASIN: result[1] };
          asins.push(asin); 
        }
      });
      return { title, asins };
    };
    const setAsins = R.map(setAsin);
    return from(this.scrapsByBing(keywords)).pipe(
        map(R.tap(log.trace.bind(this)))
      , map(setAsins)
      );
  }
}
CloudSearch.displayName = '[CSE]';
export default CloudSearch;
