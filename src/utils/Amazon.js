import * as R             from 'ramda';
import { from, forkJoin } from 'rxjs';
import { map, flatMap }   from 'rxjs/operators';
import xml2js             from 'xml2js';
import std                from 'Utilities/stdutils';
import net                from 'Utilities/netutils';
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
    this.keyset = { access_key, secret_key, associ_tag };
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
      case 'BrowseNodeLookup':
      case 'ItemSearch':
      case 'ItemLookup': {
        const search    = this.setSearch(this.keyset, operation, options);
        const operator  = R.curry(this.setSignature)(this.keyset, baseurl);
        return net.throttle(baseurl, { method: 'GET', type: 'NV', accept: 'XML', search, operator });
      }
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
    const setString = obj => "GET\n" + api.host + "\n" + api.pathname + "\n" + std.urlencode_rfc3986(obj);
    const hshString = str => std.crypto_sha256(str, keyset.secret_key, 'base64');
    const sgnString = R.compose(hshString, setString);
    params['Signature'] = sgnString(params);
    return params;
  }
}
Amazon.displayName = '[AMZ]';
export default Amazon;
