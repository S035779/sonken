import xml2js             from 'xml2js';
import * as R             from 'ramda';
import { from, forkJoin } from 'rxjs';
import { map, flatMap }   from 'rxjs/operators';
import PromiseThrottle    from 'promise-throttle';
import CloudSearch        from 'Routes/CloudSearch/CloudSearch';
import std                from 'Utilities/stdutils';
import net                from 'Utilities/netutils';
import log                from 'Utilities/logutils';
import index              from 'Utilities/amzindex';

const baseurl = 'https://webservices.amazon.co.jp/onca/xml';
/**
 * Amazon Api Client class.
 *
 * @constructor
 * @param {string} access_key - The access key for this application.
 * @param {string} secret_key - The secret key for this application.
 * @param {string} associ_tag - The associate tag for this application.
 */
class Amazon {
  constructor(access_key, secret_key, associ_tag) {
    this.keyset = { access_key, secret_key, associ_tag };
    this.CSE = CloudSearch.of();
    this.topPromiseThrottle = new PromiseThrottle({
      requestsPerSecond: 0.1, promiseImplementation: Promise
    });
    this.promiseThrottle = new PromiseThrottle({
      requestsPerSecond: 1, promiseImplementation: Promise
    });
  }

  static of({ access_key, secret_key, associ_tag }) {
    return new Amazon(access_key, secret_key, associ_tag);
  }

  tfetchItemLookups(params) {
    return this.topPromiseThrottle.add(this.fetchItemLookups.bind(this, params));
  }

  tfetchItemSearch(keywords, category, page) {
    return this.promiseThrottle.add(this.fetchItemSearch.bind(this, keywords, category, page));
  }

  tfetchItemLookup(item_id, id_type) {
    return this.promiseThrottle.add(this.fetchItemLookup.bind(this, item_id, id_type));
  }

  request({ operation, options }) {
    switch(operation) {
      case 'parse/xml':
        {
          return new Promise((resolve, reject) => {
            const { xml } = options;
            const params =
              { attrkey: 'root', charkey: 'sub', trim: true, explicitArray: false };
            xml2js.parseString(xml, params, (err, res) => {
              if(err) return reject(err);
              resolve(res);
            });
          });
        }
      case 'BrowseNodeLookup':
      case 'ItemSearch':
      case 'ItemLookup':
        {
          const search   = this.setSearch(this.keyset, operation, options);
          const operator = R.curry(this.setSignature)(this.keyset, baseurl);
          const params   = { method: 'GET', type: 'NV', accept: 'XML', search, operator };
          return new Promise((resolve, reject) => {
            net.fetch(baseurl, params, (err, res) => {
              if(err) return reject(err);
              //log.trace(Amazon.displayName, 'Response', res);
              resolve(res);
            });
          });
        }
    }
  }

  fetchNewReleases(node_id) {
    return from(this.getNewReleases(node_id)).pipe(
      flatMap(this.parseXml.bind(this))
    , map(this.setTopItems)
    , flatMap(this.forItemLookup.bind(this))
    , flatMap(this.forParseXml.bind(this))
    , map(this.forItem.bind(this))
    );
  }

  fetchBestSellers(node_id) {
    return from(this.getBestSellers(node_id)).pipe(
      flatMap(this.parseXml.bind(this))
    , map(this.setTopItems)
    , flatMap(this.forItemLookup.bind(this))
    , flatMap(this.forParseXml.bind(this))
    , map(this.forItem.bind(this))
    );
  }

  fetchReleaseDate(node_id, category, page) {
    return from(this.getReleaseDate(node_id, category, page)).pipe(
      flatMap(this.parseXml.bind(this))
    , map(this.setItems)
    );
  }

  fetchSalesRanking(node_id, category, rate, patern) {
    const curriedCheckRate = R.curry(this.checkRate.bind(this))(rate);
    const curriedDiffRate = R.curry(this.diffRate.bind(this))(patern);
    return this.forSalesRanking(node_id, category, 10).pipe(
      flatMap(this.forParseXml.bind(this))
    , map(this.forItems.bind(this))
    , map(R.flatten)
    , map(R.filter(curriedCheckRate))
    , map(R.sort(curriedDiffRate))
    );
  }

  fetchItemSearch(keywords, category, page) {
    return this.getItemSearch(keywords, category, page)
      .then(obj => this.getXml(obj))
      .then(obj => obj.ItemSearchResponse.Items);
  }

  jobItemSearch({ items, profile }) {
    const setKeyword = str => this.trimTitle(str, profile);
    const promises = R.map(obj => 
      this.tfetchItemSearch(setKeyword(obj.title), obj.item_categoryid, 1));
    return Promise.all(promises(items))
      .then(objs => this.setItemSearchs(profile, items)(objs))
      .catch(err => log.error(Amazon.displayName, 'jobItemSearch', err));
  }

  fetchItemLookup(item_id, id_type) {
    log.info(Amazon.displayName, 'fetchItemLookup');
    return this.getItemLookup(item_id, id_type)
      .then(obj => this.getXml(obj))
      .then(obj => obj.ItemLookupResponse.Items)
      //.then(R.tap(log.info.bind(this)))
    ;
  }

  fetchItemLookups({ title, asins }) {
    log.info(Amazon.displayName, 'fetchItemLookups');
    const promises = R.map(obj => this.tfetchItemLookup(obj.ASIN, 'ASIN'));
    return Promise.all(promises(asins))
      .then(objs => ({ title, asins: objs }))
      //.then(R.tap(log.info.bind(this)))
    ;
  }

  jobItemLookup({ items, profile }) {
    const setKeyword  = str => this.trimTitle(str, profile);
    const setSearch   = obj => ({ title: setKeyword(obj.title) });
    const searchs     = R.map(setSearch, items);
    const promises    = R.map(obj => this.tfetchItemLookups(obj));
    return this.CSE.forItemSearch(searchs)
      //.then(R.tap(log.info.bind(this)))
      .then(objs => Promise.all(promises(objs)))
      .then(R.tap(log.info.bind(this)))
      .then(objs => this.setItemLookups(profile, items)(objs))
      .catch(err => log.error(Amazon.displayName, 'jobItemLookup', err));
  }

  setItemLookups(profile, items) {
    log.info(Amazon.displayName, 'setItemLookups');
    const setKeyword = str => this.trimTitle(str, profile);
    const self = this;
    return function(datas) {
      const setItemLookup = (item, obj) => {
        const key = setKeyword(item.title);
        return self.setItemLookup(key, item, obj)
      };
      const hasItemLookup = 
        str => R.find(item => setKeyword(item.title) === setKeyword(str))(items);
      const hasItemLookups = obj => {
        const item = hasItemLookup(obj.title);
        return item && !R.isEmpty(obj.asins) ? setItemLookup(item, obj) : null;
      };
      const setItemLookups = R.map(hasItemLookups);
      return setItemLookups(datas);
    };
  }

  setItemLookup(keyword, item, data) {
    log.info(Amazon.displayName, 'setItemLookup', keyword, item, data);
    const setErrors  = obj => ({ request: keyword, keyword: data.title
    , code: obj.Errors.Error.Code, message: obj.Errors.Error.Message });
    const setInvalid = () =>  ({ request: keyword, keyword: data.title
    , code: 'InvaildRequest',      message: '不正なリクエストです。' });
    const setNoMatch = () =>  ({ request: keyword, keyword: data.title
    , code: 'NoMatchTitle',        message: 'タイトルが合致しません。' });
    const setNoItems = () =>  ({ request: keyword, keyword: data.title
    , code: 'NoItems',             message: 'アイテムを取得できませんでした。' });
    const setItem    = obj => ({ request: keyword
    , code: 'ExactMatches',        message: '正常に取得できました。'
    , asin:           obj.ASIN
    , itemAttributes: obj.ItemAttributes
    , offerSummary:   obj.OfferSummary
    , offers:         obj.Offers });
    const setSearchs  = objs => ({ guid__: item.guid__, asins: objs });
    const isTitle    = ()  => data.title === keyword;
    const isValid    = obj => obj.Request.IsValid === 'True';
    const isItem     = obj => obj.Item;
    const getSearch  =
      obj => obj.Request.Errors ? setErrors(obj.Request)  :
             !isValid(obj)      ? setInvalid(obj.Request) :
             !isTitle(obj)      ? setNoMatch(obj.Request) :
             !obj.Item          ? setNoItems(obj.Request) :
             isItem(obj)        ? setItem(obj.Item)       : null;
    const getSearchs = R.map(getSearch);
    return R.compose(setSearchs, getSearchs)(data.asins);
  }

  setItemSearchs(profile, items) {
    const setKeyword = str => this.trimTitle(str, profile);
    const self = this;
    return function(datas) {
      const setItemSearch = (item, obj) => {
        const key = setKeyword(item.title);
        return self.setItemSearch(key, item, obj)
      };
      const hasItemSearch = 
        str => R.find(item => setKeyword(item.title) === setKeyword(str))(items);
      const hasItemSearchs = obj => {
        const item = hasItemSearch(obj.Request.ItemSearchRequest.Keywords);
        return item ? setItemSearch(item, obj) : null;
      };
      const setItemSearchs = R.map(hasItemSearchs);
      return setItemSearchs(datas);
    };
  }

  setItemSearch(keyword, item, data) {
    const setErrors  = obj => ({ request: keyword, keyword: obj.ItemSearchRequest.Keywords
    , code: obj.Errors.Error.Code, message: obj.Errors.Error.Message });
    const setInvalid = obj => ({ request: keyword, keyword: obj.ItemSearchRequest.Keywords
    , code: 'InvaildRequest',      message: '不正なリクエストです。' });
    const setNoMatch = obj => ({ request: keyword, keyword: obj.ItemSearchRequest.Keywords
    , code: 'NoMatchTitle',        message: 'タイトルが合致しません。' });
    const setNoItems = obj => ({ request: keyword, keyword: obj.ItemSearchRequest.Keywords
    , code: 'NoItems',             message: 'アイテムを取得できませんでした。' });
    const setItem    = obj => ({ request: keyword
    , code: 'ExactMatches',        message: '正常に取得できました。'
    , asin:           obj.ASIN
    , itemAttributes: obj.ItemAttributes
    , offerSummary:   obj.OfferSummary
    , offers:         obj.Offers });
    const setItems   = R.map(setItem);
    const setSearch  = obj => ({ guid__: item.guid__, asins: obj });
    const isTitle    = obj => obj.Request.ItemSearchRequest.Keywords === keyword;
    const isValid    = obj => obj.Request.IsValid === 'True';
    const isItem     = obj => obj.Item && Number(obj.TotalResults) === 1;
    const getSearch  =
      obj => obj.Request.Errors ? [setErrors(obj.Request) ] :
             !isValid(obj)      ? [setInvalid(obj.Request)] :
             !isTitle(obj)      ? [setNoMatch(obj.Request)] :
             !obj.Item          ? [setNoItems(obj.Request)] :
             isItem(obj)        ? [setItem(obj.Item)      ] : setItems(obj.Item);
    return R.compose(setSearch, getSearch)(data);
  }

  trimTitle(title, profile)  {
    //log.info('deleteWord =', profile.deleteWord);
    const split = str => str ? R.map(R.trim, R.split(',', str)) : [];
    const concat = R.concat(index.words.delete);
    const join  = R.join('|');
    const regexp  = str => new RegExp(str, 'g');
    const replace = reg => R.replace(reg, '', title);
    const replaceString = R.compose(replace, regexp, join, concat, split);
    return replaceString(profile.deleteWord);
  }

  fetchNodeList(node_id) {
    return from(this.getNodeList(node_id)).pipe(
      flatMap(this.parseXml.bind(this))
    , map(this.setNodes)
    );
  }

  parseXml(xml) {
    return from(this.getXml(xml));
  }

  forSalesRanking(node_id, category, pages) {
    const range = R.range(1, pages+1);
    const promises = R.map(page => this.getSalesRanking(node_id, category, page));
    return forkJoin(promises(range));
  }

  forItemLookup(objs) {
    const promises = R.map(obj => this.rgetItemLookup(obj.ASIN, 'ASIN'));
    return forkJoin(promises(objs));
  }

  forParseXml(objs) {
    const promises = R.map(obj => this.parseXml(obj));
    return forkJoin(promises(objs));
  }

  forItems(objs) {
    return R.map(obj => this.setItems(obj), objs);
  }

  forItem(objs) {
    return R.map(obj => this.setItem(obj), objs);
  }

  checkRate(val, obj) {
    if(!obj.ItemAttributes.hasOwnProperty('ListPrice')) return false;
    return this.discountRate(obj) > val;
  }

  diffRate(val, obj1, obj2) {
    switch(val) {
      case 'discount':
        return this.discountRate(obj2) - this.discountRate(obj1);
      case 'salesrnk':
        return false;
      default :
        break;
    }
  }

  discountRate(obj) {
    const lst = obj.ItemAttributes.ListPrice.Amount;
    const ofr = obj.Offers.Offer
      ? obj.Offers.Offer.OfferListing.Price.Amount
      : lst;
    const scr = Math.ceil((1 - (ofr / lst))*100);
    return scr;
  }

  setTopItems(obj) {
    const items = obj.BrowseNodeLookupResponse.BrowseNodes;
    return items.BrowseNode.TopItemSet.TopItem;
  }

  setItems(obj) {
    const items = obj.ItemSearchResponse.Items
    return items;
  }

  setItem(obj) {
    const items = obj.ItemLookupResponse.Items;
    return items.Item;
  }

  setNodes(obj) {
    const items = obj.BrowseNodeLookupResponse.BrowseNodes;
    return items.BrowseNode.Children.BrowseNode;
  }

  getXml(xml) {
    return this.request({ operation: 'parse/xml', options: { xml } });
  }

  getNodeList(node_id) {
    const options = {};
    options['BrowserNodeId'] = node_id;
    options['ResponseGroup'] ='BrowseNodeInfo' ;
    return this.request({ operation: 'BrowseNodeLookup', options });
  }

  getNewReleases(node_id) {
    const options = {};
    options['BrowseNodeId'] = node_id;
    options['ResponseGroup'] ='NewReleases' ;
    return this.request({ operation: 'BrowseNodeLookup', options });
  }

  getBestSellers(node_id) {
    const options = {};
    options['BrowseNodeId'] = node_id;
    options['ResponseGroup'] ='TopSellers' ;
    return this.request({ operation: 'BrowseNodeLookup', options });
  }

  getReleaseDate(node_id, category, page) {
    const options = {};
    options['BrowseNode']     = node_id;
    options['SearchIndex']    = category;
    options['ItemPage']       = page;
    options['Sort']           = '-release-date';
    options['ResponseGroup']  = 'Large';
    return this.request({ operation: 'ItemSearch', options });
  }

  getSalesRanking(node_id, category, page) {
    const options = {};
    options['BrowseNode']     = node_id;
    options['SearchIndex']    = category;
    options['ItemPage']       = page;
    options['Sort']           = 'salesrank';
    options['ResponseGroup']  = 'Large';
    return this.request({ operation: 'ItemSearch', options });
  }

  getItemSearch(keywords, categoryid, page) {
    const options = {};
    const Keywords = this.setKeywords(keywords);
    const SearchIndex = this.setSearchIndex(categoryid);
    options['Keywords']       = Keywords;
    options['ItemPage']       = page;
    options['SearchIndex']    = SearchIndex;
    options['ResponseGroup']  = 'ItemAttributes,ItemIds,OfferFull';
    log.info(Amazon.displayName, 'getItemSearch', Keywords, SearchIndex);
    return this.request({ operation: 'ItemSearch', options });
  }

  getItemLookup(item_id, id_type) {
    const options = {};
    options['IdType']         = id_type;
    options['ItemId']         = item_id;
    options['ResponseGroup']  = 'ItemAttributes,ItemIds,OfferFull';
    log.info(Amazon.displayName, 'getItemLookup', item_id, id_type);
    return this.request({ operation: 'ItemLookup', options });
  }

  setSearchIndex(categoryid) {
    const keys       = R.keys(index.search);
    const values     = key => R.prop(key, index.search);
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

  setSearch(keyset, operation, options) {
    options['Service']        = 'AWSECommerceService';
    options['Version']        = '2013-08-01';
    options['AWSAccessKeyId'] = keyset.access_key;
    options['AssociateTag']   = keyset.associ_tag;
    options['Operation']      = operation;
    return options;
  }

  setSignature(keyset, url, options) {
    options['Timestamp'] = std.getTimeStamp();
    const params    = std.ksort(options);
    const api       = std.parse_url(url);
    const setString = 
      obj => "GET\n" + api.host + "\n" + api.pathname + "\n" + std.urlencode_rfc3986(obj);
    const hshString = str => std.crypto_sha256(str, keyset.secret_key, 'base64');
    const sgnString = R.compose(hshString, setString);
    params['Signature'] = sgnString(params);
    return params;
  }
}
Amazon.displayName = '[AMZ]';
export default Amazon;
