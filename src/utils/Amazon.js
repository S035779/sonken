import * as R             from 'ramda';
import { from, forkJoin } from 'rxjs';
import { map, flatMap }   from 'rxjs/operators';
import xml2js             from 'xml2js';
import std                from 'Utilities/stdutils';
import net                from 'Utilities/netutils';
import log                from 'Utilities/logutils';
import searchIndex        from 'Utilities/amzindex';

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
    this.access_key = access_key;
    this.secret_key = secret_key;
    this.associ_tag = associ_tag;
  }

  static of({ access_key, secret_key, associ_tag }) {
    return new Amazon(access_key, secret_key, associ_tag);
  }

  request(operation, options) {
    //log.debug(Amazon.displayName, 'Props', options);
    switch(operation) {
      case 'parse/xml':
        return new Promise((resolve, reject) => {
          xml2js.parseString(options.xml, { attrkey: 'root', charkey: 'sub', trim: true, explicitArray: false }
          , (error, result) => {
            if(error) return reject(error);
            resolve(result);
          });
        });
      case 'BrowseNodeLookup':
      case 'ItemSearch':
      case 'ItemLookup':
        return net.throttle(this.url(operation, options), { method: 'GET', type: 'NV', accept: 'XML' });
      default:
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            log.debug(this.url(operation, options));
            resolve(options);
          }, 200);
        });
    }
  }

  fetchNewReleases(node_id) {
    const observable = from(this.getNewReleases(node_id));
    return observable.pipe(
      flatMap(this.parseXml.bind(this))
    , map(this.setTopItems)
    , flatMap(this.forItemLookup.bind(this))
    , flatMap(this.forParseXml.bind(this))
    , map(this.forItem.bind(this))
    );
  }

  fetchBestSellers(node_id) {
    const observable = from(this.getBestSellers(node_id));
    return observable.pipe(
      flatMap(this.parseXml.bind(this))
    , map(this.setTopItems)
    , flatMap(this.forItemLookup.bind(this))
    , flatMap(this.forParseXml.bind(this))
    , map(this.forItem.bind(this))
    );
  }

  fetchReleaseDate(node_id, category, page) {
    const observable = from(this.getReleaseDate(node_id, category, page));
    return observable.pipe(
      flatMap(this.parseXml.bind(this))
    , map(this.setItems)
    );
  }

  fetchSalesRanking(node_id, category, rate, patern) {
    const curriedCheckRate = R.curry(this.checkRate.bind(this))(rate);
    const curriedDiffRate = R.curry(this.diffRate.bind(this))(patern);
    const observable = this.forSalesRanking(node_id, category, 10);
    return observable.pipe(
      flatMap(this.forParseXml.bind(this))
    , map(this.forItems.bind(this))
    , map(R.flatten)
    , map(R.filter(curriedCheckRate))
    , map(R.sort(curriedDiffRate))
    );
  }

  fetchItemLookup(item_id, id_type) {
    const observable = from(this.getItemLookup(item_id, id_type));
    return observable.pipe(
      flatMap(this.parseXml.bind(this))
    , map(this.setItem)
    );
  }

  fetchItemSearch(keywords, category, page) {
    const observable = from(this.getItemSearch(keywords, category, page));
    return observable.pipe(
      flatMap(this.parseXml.bind(this))
    , map(this.setItems)
    );
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
    const promises = R.map(obj => this.getItemLookup(obj.ASIN, 'ASIN'));
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
  };

  discountRate(obj) {
    const lst = obj.ItemAttributes.ListPrice.Amount;
    const ofr = obj.Offers.Offer
      ? obj.Offers.Offer.OfferListing.Price.Amount
      : lst;
    const scr = Math.ceil((1 - (ofr / lst))*100);
    //log.trace('ASIN:', obj.ASIN, 'lst, ofr, scr:', lst, ofr, scr);
    //log.trace('ASIN:', obj.ASIN, 'scr:', scr);
    return scr;
  }

  setTopItems(obj) {
    const items = obj.BrowseNodeLookupResponse.BrowseNodes;
    return items.BrowseNode.TopItemSet.TopItem;
  }

  setItems(obj) {
    const items = obj.ItemSearchResponse.Items
    //log.trace('pages:', items.TotalPages, 'items:', items.TotalResults);
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
    return this.request('parse/xml', { xml });
  }

  getNodeList(node_id) {
    const options = {};
    options['BrowserNodeId'] = node_id;
    options['ResponseGroup'] ='BrowseNodeInfo' ;
    return this.request('BrowseNodeLookup', options);
  }

  getNewReleases(node_id) {
    const options = {};
    options['BrowseNodeId'] = node_id;
    options['ResponseGroup'] ='NewReleases' ;
    return this.request('BrowseNodeLookup', options);
  }

  getBestSellers(node_id) {
    const options = {};
    options['BrowseNodeId'] = node_id;
    options['ResponseGroup'] ='TopSellers' ;
    return this.request('BrowseNodeLookup', options);
  }

  getReleaseDate(node_id, category, page) {
    const options = {};
    options['BrowseNode']     = node_id;
    options['SearchIndex']    = category;
    options['ItemPage']       = page;
    options['Sort']           = '-release-date';
    options['ResponseGroup']  = 'Large';
    return this.request('ItemSearch', options);
  }

  getSalesRanking(node_id, category, page) {
    const options = {};
    options['BrowseNode']     = node_id;
    options['SearchIndex']    = category;
    options['ItemPage']       = page;
    options['Sort']           = 'salesrank';
    options['ResponseGroup']  = 'Large';
    return this.request('ItemSearch', options);
  }

  getItemSearch(keywords, categoryid, page) {
    const options = {};
    options['Keywords']       = this.setKeywords(keywords);
    options['ItemPage']       = page;
    options['SearchIndex']    = this.setSearchIndex(categoryid);
    options['ResponseGroup']  = 'ItemAttributes,ItemIds';
    return this.request('ItemSearch', options);
  }

  getItemLookup(item_id, id_type) {
    const options = {};
    options['IdType']         = id_type;
    options['ItemId']         = item_id;
    options['ResponseGroup']  = 'Large';
    return this.request('ItemLookup', options);
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

  signature(query) {
    const url     = std.parse_url(baseurl);
    const string  = "GET\n"
      + url.host + "\n" + url.pathname + "\n"
      + std.urlencode_rfc3986(query);
    const result  = std.crypto_sha256(string, this.secret_key, 'base64');
    //log.trace(Amazon.displayName, 'Query object:', query);
    //log.trace(Amazon.displayName, 'Query string:', string);
    //log.trace(Amazon.displayName, 'String to Sign:', result);
    return result;
  }

  url(operation, options) {
    options['Service']        = 'AWSECommerceService';
    options['Version']        = '2013-08-01';
    options['AWSAccessKeyId'] = this.access_key;
    options['AssociateTag']   = this.associ_tag;
    options['Operation']      = operation;
    options['Timestamp']      = std.getTimeStamp();
    const params = std.ksort(options);
    const signature = { Signature: this.signature(params) };
    const url = baseurl
      + '?' + std.urlencode_rfc3986(params)
      + '&' + std.urlencode_rfc3986(signature);
    //log.trace(Amazon.displayName, 'Signed URL:', url);
    return url;
  }

};
Amazon.displayName = '[AMZ]';
export default Amazon;
