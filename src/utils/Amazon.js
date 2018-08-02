import * as R             from 'ramda';
import { from, forkJoin } from 'rxjs';
import { map, flatMap }   from 'rxjs/operators';
import xml2js             from 'xml2js';
import std                from 'Utilities/stdutils';
import net                from 'Utilities/netutils';
import { logs as log }    from 'Utilities/logutils';

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
        const option = {
          attrkey:          'root'
          , charkey:        'sub'
          , trim:           true
          , explicitArray:  false
        };
        return new Promise((resolve, reject) => {
          xml2js.parseString(options.xml, option, (error, result) => {
            if(error) return reject(error);
            resolve(result);
          });
        });
      default:
        options = Object.assign({}, params, options);
        options['AssociateTag']   = this.associ_tag;
        options['AWSAccessKeyId'] = this.access_key;
        options['Operation']      = operation;
        options['Timestamp']      = std.getTimeStamp();
        const query = this.query(options);
        const signature = this.signature(query);
        const url = this.url(query, signature);
        return new Promise((resolve, reject) => {
          net.get(url, null, (err, head, body) => {
            if(err) return reject(err.message);
            resolve(body);
          });
        });
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

  fetchItemLookup(item_id, id_type) {
    return from(this.getItemLookup(item_id, id_type)).pipe(
      flatMap(this.parseXml.bind(this))
    , map(this.setItem)
    );
  }

  fetchItemList(keyword, page) {
    return from(this.getItemList(keyword, page)).pipe(
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

  getItemList(keyword, page) {
    const options = {};
    options['Keywords']       = keyword;
    options['ItemPage']       = page;
    options['SearchIndex']    = 'All';
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

  query(object) {
    return std.urlencode_rfc3986(std.ksort(object));
  }

  signature(query) {
    const parsed_url = std.parse_url(baseurl);
    const string = "GET\n"
      + parsed_url.host + "\n"
      + parsed_url.pathname + "\n"
      + query;
    return std.crypto_sha256(string, this.secret_key);
  }

  url(query, signature) {
    return baseurl
      + '?' + query
      + '&' + std.urlencode_rfc3986({ Signature: signature });
  }

};
Amazon.displayName = 'amazon-api';
export default Amazon;
