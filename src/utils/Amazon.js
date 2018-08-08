import * as R             from 'ramda';
import { from, forkJoin } from 'rxjs';
import { map, flatMap }   from 'rxjs/operators';
import xml2js             from 'xml2js';
import std                from 'Utilities/stdutils';
import net                from 'Utilities/netutils';
import log                from 'Utilities/logutils';
import searchIndex        from 'Utilities/amztable';

const baseurl = 'http://ecs.amazonaws.jp/onca/xml';
const params = { Service: 'AWSECommerceService', Version: '2011-07-27' };

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
    switch(operation) {
      case 'parse/xml':
        return new Promise((resolve, reject) => {
          xml2js.parseString(options.xml, { attrkey: 'root', charkey: 'sub', trim: true, explicitArray: false }
          , (error, result) => {
            if(error) return reject(error);
            resolve(result);
          });
        });
      default:
        return new Promise((resolve, reject) => {
          net.fetch(this.url(operation, options), { method: 'GET', type: 'NV', accept: 'XML' }
          , (err, body) => {
            if(err) return reject(err);
            resolve(body);
          });
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
    return items.Item;
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

  getItemSearch(keywords, category, page) {
    const options = {};
    options['Keywords']       = this.setKeyword(keywords);
    options['ItemPage']       = page;
    options['SearchIndex']    = this.setIndex(category);
    options['ResponseGroup']  = 'Large';
    return this.request('ItemSearch', options);
  }

  getItemLookup(item_id, id_type) {
    const options = {};
    options['IdType']         = id_type;
    options['ItemId']         = item_id;
    options['ResponseGroup']  = 'Large';
    return this.request('ItemLookup', options);
  }

  setIndex(category) {
    const props     = obj => R.prop(obj, searchIndex);
    const isCats    = key => R.contains(category, props(key))
    const isIndex   = R.filter(isCats);
    const setIndex  = R.compose(R.top, isIndex);
    const keys      = R.keys(searchIndex);
    return setIndex(keys);
  }

  setKeyword(keywords) {
    let results = '';
    if(keywords && typeof keywords === 'string') {
      results = keywords;
    } else if(keywords && Array.isArray(keywords)) {
      results = R.join(' ', keywords);
    }
    return results;
  }

  query(object) {
    return std.urlencode_rfc3986(std.ksort(object));
  }

  signature(query) {
    const parsed_url = std.parse_url(baseurl);
    const string = "GET\n" + parsed_url.host + "\n" + parsed_url.pathname + "\n" + query;
    return std.crypto_sha256(string, this.secret_key);
  }

  url(operation, options) {
    options = R.merge(params, options);
    options['AssociateTag']   = this.associ_tag;
    options['AWSAccessKeyId'] = this.access_key;
    options['Operation']      = operation;
    options['Timestamp']      = std.getTimeStamp();
    log.trace(Amazon.displayName, 'Options', options);
    const query     = this.query(options);
    const signature = this.signature(query);
    return baseurl + '?' + query + '&' + std.urlencode_rfc3986({ Signature: signature });
  }

};
Amazon.displayName = '[AMZ]';
export default Amazon;
