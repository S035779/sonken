import dotenv           from 'dotenv';
import * as R           from 'ramda';
import puppeteer        from 'puppeteer';
import PromiseThrottle  from 'promise-throttle';
import log              from 'Utilities/logutils';

const config = dotenv.config();
if(config.error) throw new Error(config.error);

const GGL_ACCESS_KEY = process.env.GGL_ACCESS_KEY;
const GGL_SECRET_KEY = process.env.GGL_SECRET_KEY;
const devMode = process.env.NODE_ENV === 'development';

class CloudSearch {
  constructor(access_key, secret_key) {
    this.keyset = { access_key, secret_key  };
    this.topPromiseThrottle = new PromiseThrottle({ 
      requestsPerSecond: 0.0007
    , promiseImplementation: Promise
    });
    this.promiseThrottle = new PromiseThrottle({ 
      requestsPerSecond: 0.3
    , promiseImplementation: Promise
    });
    this.browserOptions = devMode ? {
      headless: false
    , defaultViewport: { width: 1200, height: 800 }
    } : { 
      headless: true
    , args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    , executablePath: 'google-chrome-unstable'
    };
  }

  static of() {
    return new CloudSearch(GGL_ACCESS_KEY, GGL_SECRET_KEY);
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

  tsearchYahooHead(params) {
    return this.promiseThrottle.add(this.searchYahooHead.bind(this, params));
  }

  tsearchYahooTail(params) { 
    return this.promiseThrottle.add(this.searchYahooTail.bind(this, params)); 
  }

  async request(operation, options) {
    log.info(CloudSearch.displayName, 'Request', operation);
    switch(operation) {
      case 'open/page':
        {
          const { site } = options;
          if(!this.browser)  this.browser = await puppeteer.launch(this.browserOptions);
          const page = await this.browser.newPage();
          await page.goto(site, { waitUntil: 'load' });
          //if(!devMode) await page.screenshot({ path: 'openPage.png' });
          return { page };
        }
      case 'goto/page':
        {
          const { page, site, results } = options;
          await page.goto(site, { waitUntil: 'load' });
          //if(!devMode) await page.screenshot({ path: 'gotoPage.png' });
          return { page, results };
        }
      case 'signin/google':
        {
          const { keyset, page } = options;
          const loginChk = await page.evaluate(() => {
            const node = document.querySelectorAll('div.gb_ad > a#gb_70.gb_Ue.gb_Ba.gb_Tb');
            return node.length ? false : true;
          });

          if(!loginChk) {
            await page.waitForSelector('div.gb_ad > a#gb_70.gb_Ue.gb_Ba.gb_Tb');
            await page.click('div.gb_ad > a#gb_70.gb_Ue.gb_Ba.gb_Tb');

            await page.waitForSelector('div.Xb9hP > input[name="identifier"]');
            await page.type('div.Xb9hP > input[name="identifier"]', keyset.access_key);
            await page.click('div#identifierNext.U26fgb.O0WRkf.zZhnYe.e3Duub.C0oVfc.DL0QTb > div.ZFr60d.CeoRYc');

            await page.waitFor(1000);
            await page.waitForSelector('div.Xb9hP > input.whsOnd.zHQkBf');
            await page.type('div.Xb9hP > input.whsOnd.zHQkBf', keyset.secret_key);
            await page.click('div#passwordNext.U26fgb.O0WRkf.zZhnYe.e3Duub.C0oVfc.DL0QTb > div.ZFr60d.CeoRYc');
          }
          //if(!devMode) await page.screenshot({ path: 'signinGoogle.png' });
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
          //if(!devMode) await page.screenshot({ path: 'searchGoogleHead.png' });
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
          //if(!devMode) await page.screenshot({ path: 'searchGoogleTail.png' });
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
          //if(!devMode) await page.screenshot({ path: 'searchBingHead.png' });
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
          //if(!devMode) await page.screenshot({ path: 'searchBingTail.png' });
          return { page, result };
        }
      case 'search/yahoo/head':
        {
          const { page, string } = options;
          const { title } = string;
          await page.waitForSelector('input[name="p"]');
          await page.type('input[name="p"]', 'site:https://www.amazon.co.jp/ ' + title);
          await page.click('input#srchbtn.srchbtn');
          await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
          const datas = await page.evaluate(() => {
            const nodeList = document.querySelectorAll('div.hd > h3 > a');
            let urls = [];
            nodeList.forEach(node => {
              urls.push(node.href);
            });
            return urls;
          });
          const result = { title, datas };
          //if(!devMode) await page.screenshot({ path: 'searchYahooHead.png' });
          return { page, result };
        }
      case 'search/yahoo/tail':
        {
          const { page, string } = options;
          const { title } = string;
          await page.waitForSelector('div.sbox_2 > input[name="p"]');
          await page.click('div.sbox_2 > input[name="p"]', { clickCount: 3 });
          await page.type('div.sbox_2 > input[name="p"]', 'site:https://www.amazon.co.jp/ ' + title);
          await page.click('div.sbox_1.cf > input.b');
          await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
          const datas = await page.evaluate(() => {
            const nodeList = document.querySelectorAll('div.hd > h3 > a');
            let urls = [];
            nodeList.forEach(node => {
              urls.push(node.href);
            });
            return urls;
          });
          const result = { title, datas };
          //if(!devMode) await page.screenshot({ path: 'searchYahooTail.png' });
          return { page, result };
        }
      case 'signout/google':
        {
          const { page, results } = options;
          await page.waitForSelector('div.gb_ad.gb_lb.gb_oh.gb_R > a.gb_b.gb_hb.gb_R > span.gb_cb.gbii');
          await page.click('div.gb_ad.gb_lb.gb_oh.gb_R > a.gb_b.gb_hb.gb_R > span.gb_cb.gbii');

          await page.waitForSelector('div.gb_wg.gb_Sb > div > a#gb_71.gb_Aa.gb_zg.gb_Hg.gb_ef.gb_Tb');
          await page.click('div.gb_wg.gb_Sb > div > a#gb_71.gb_Aa.gb_zg.gb_Hg.gb_ef.gb_Tb');
          //if(!devMode) await page.screenshot({ path: 'signoutGoogle.png' });
          return { page, results };
        }
      case 'close/page':
        {
          const { results } = options;
          await this.browser.close();
          this.browser = null;
          return results;
        }
      default:
        return Promise.reject(new Error({ 
          name: 'Invalid request:', message: 'Request is not implemented.', stack: operation
        }));
    }
  }

  openPage(site) {
    return this.request('open/page', { site });
  }

  gotoPage(site, { page, results }) {
    return this.request('goto/page', { site, page, results });
  }

  signinGoogle({ page }) {
    const keyset = this.keyset;
    return this.request('signin/google', { keyset, page });
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

  searchYahooHead({ page, string }) {
    return this.request('search/yahoo/head', { page, string });
  }

  searchYahooTail({ page, string }) {
    return this.request('search/yahoo/tail', { page, string }); 
  }

  signoutGoogle({ page, results }) {
    return this.request('signout/google', { page, results });
  }

  setSearchs(strings) {
    return function({ page, results }) {
      const searchs = R.map(string => ({ page, string }), strings);
      return ({ searchs, results });
    };
  }

  async searchGoogle({ searchs, results }) {
    const searchHeads = [R.head(searchs)];
    const searchTails = R.tail(searchs);
    const heads = R.map(search => this.tsearchGoogleHead(search), searchHeads);
    const tails = R.map(search => this.tsearchGoogleTail(search), searchTails)
    const _searchs = await Promise.all(R.concat(heads, tails));
    searchs = searchs ? R.concat(searchs, _searchs) : _searchs;
    return { searchs, results };
  }

  async searchBing({ searchs, results }) {
    const searchHeads = [R.head(searchs)];
    const searchTails = R.tail(searchs);
    const heads = R.map(search => this.tsearchBingHead(search), searchHeads);
    const tails = R.map(search => this.tsearchBingTail(search), searchTails);
    const _searchs = await Promise.all(R.concat(heads, tails));
    searchs = searchs ? R.concat(searchs, _searchs) : _searchs;
    return { searchs, results };
  }

  async searchYahoo({ searchs, results }) {
    const searchHeads = [R.head(searchs)];
    const searchTails = R.tail(searchs);
    const heads = R.map(search => this.tsearchYahooHead(search), searchHeads);
    const tails = R.map(search => this.tsearchYahooTail(search), searchTails);
    const _searchs = await Promise.all(R.concat(heads, tails));
    searchs = searchs ? R.concat(searchs, _searchs) : _searchs;
    return { searchs, results };
  }

  getResults({ searchs, results }) {
    const searchHead = R.head(searchs);
    const page = searchHead.page;
    const _results = R.map(obj => obj.result, searchs);
    results = results ? R.concat(results, _results) : _results;
    return { page, results };
  }

  closePage({ page, results }) {
    return this.request('close/page', { page, results });
  }

  scraps(strings) {
    log.info(CloudSearch.displayName, 'scraps', strings.length);
    const max = strings.length;
    const skip = Math.ceil(max / 4);
    const strings1 = R.slice(skip * 0, skip * 1 - 1, strings);
    const strings2 = R.slice(skip * 1, skip * 2 - 1, strings);
    const strings3 = R.slice(skip * 2, skip * 3 - 1, strings);
    const strings4 = R.slice(skip * 3, max         , strings);
    const hasSearchs = R.filter(obj => !R.isNil(obj));
    return this.topenPage('https://www.bing.com/')
      .then(obj => this.setSearchs(strings1)(obj))
      .then(objs => this.searchBing(objs))
      .then(objs => this.getResults(objs))

      .then(obj => this.gotoPage('https://www.yahoo.co.jp/', obj))
      .then(obj => this.setSearchs(strings2)(obj))
      .then(objs => this.searchYahoo(objs))
      .then(objs => this.getResults(objs))

      .then(obj => this.gotoPage('https://www.bing.com/', obj))
      .then(obj => this.setSearchs(strings3)(obj))
      .then(objs => this.searchBing(objs))
      .then(objs => this.getResults(objs))

      .then(obj => this.gotoPage('https://www.yahoo.co.jp/', obj))
      .then(obj => this.setSearchs(strings4)(obj))
      .then(objs => this.searchYahoo(objs))
      .then(objs => this.getResults(objs))

      //.then(obj => this.signinGoogle(obj))
      //.then(obj => this.setSearchs(strings3)(obj))
      //.then(objs => this.searchGoogle(objs))
      //.then(objs => this.getResults(objs))
      //.then(obj => this.signoutGoogle(obj))
      .then(obj => this.closePage(obj))
      .then(hasSearchs)
      //.then(R.tap(console.log))
    ;
  }

  scrapsByGoogle(strings) {
    strings.length = 30;
    log.info(CloudSearch.displayName, 'scrapsByGoogle', strings.length);
    const hasSearchs = R.filter(obj => !R.isNil(obj));
    return this.topenPage('https://www.google.co.jp/')
      .then(obj => this.signinGoogle(obj))
      .then(obj => this.setSearchs(strings)(obj))
      .then(objs => this.searchGoogle(objs))
      .then(objs => this.getResults(objs))
      .then(obj => this.signoutGoogle(obj))
      .then(obj => this.closePage(obj))
      .then(hasSearchs)
      //.then(R.tap(console.log))
    ;
  }

  scrapsByBing(strings) {
    strings.length = 30;
    log.info(CloudSearch.displayName, 'scrapsByBing', strings.length);
    const hasSearchs = R.filter(obj => !R.isNil(obj));
    return this.topenPage('https://www.bing.com/')
      .then(obj => this.setSearchs(strings)(obj))
      .then(objs => this.searchBing(objs))
      .then(objs => this.getResults(objs))
      .then(obj => this.closePage(obj))
      .then(hasSearchs)
      //.then(R.tap(console.log));
  }

  scrapsByYahoo(strings) {
    strings.length = 30;
    log.info(CloudSearch.displayName, 'scrapsByYahoo', strings.length);
    const hasSearchs = R.filter(obj => !R.isNil(obj));
    return this.topenPage('https://www.yahoo.co.jp/')
      .then(obj => this.setSearchs(strings)(obj))
      .then(objs => this.searchYahoo(objs))
      .then(objs => this.getResults(objs))
      .then(obj => this.closePage(obj))
      .then(hasSearchs)
      //.then(R.tap(console.log));
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
    const hasAsins = R.filter(obj => !R.isNil(obj));
    const setAsins = R.map(setAsin);
    return this.scraps(keywords)
      .then(objs => hasAsins(objs))
      .then(objs => setAsins(objs));
  }
}
CloudSearch.displayName = '[CSE]';
export default CloudSearch;
