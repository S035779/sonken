import * as R             from 'ramda';
import { from, forkJoin } from 'rxjs';
import { map, flatMap }   from 'rxjs/operators';
import xml2js             from 'xml2js';
import std                from 'Utilities/stdutils';
import net                from 'Utilities/netutils';
import log                from 'Utilities/logutils';

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
        log.info(Amazon.displayName, 'Request', operation);
        return new Promise((resolve, reject) => {
          net.fetch(this.url(operation, options), { method: 'GET', type: 'NV' }, (err, body) => {
            if(err) return reject(err);
            log.trace(Amazon.displayName, 'Response', body);
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

  fetchItemSearch(keyword, page) {
    return from(this.getItemSearch(keyword, page)).pipe(
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

  getItemSearch(keyword, page) {
    const options = {};
    options['Keywords']       = this.setKeywords(keyword);
    options['ItemPage']       = page;
    options['SearchIndex']    = this.searchIndex(keyword);
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

  query(operation, options) {
    options = R.merge(params, options);
    options['AssociateTag']   = this.associ_tag;
    options['AWSAccessKeyId'] = this.access_key;
    options['Operation']      = operation;
    options['Timestamp']      = std.getTimeStamp();
    return std.urlencode_rfc3986(std.ksort(options));
  }

  searchIndex(keyword) {
    const searchIndex = {
      All:                [
        'オークション > アクセサリー、時計'
      , 'オークション > ペット、生き物'
      , 'オークション > チケット、金券、宿泊予約'
      , 'オークション > コミック、アニメグッズ'
      , 'オークション > 不動産'
      , 'オークション > チャリティー'
      , 'オークション > その他'
      ]
    , Apparel:            [
        'オークション > ファッション > ブランド別'
      , 'オークション > ファッション > レディースファッション'
      , 'オークション > ファッション > レディースバッグ'
      , 'オークション > ファッション > 女性和服、着物'
      , 'オークション > ファッション > ファッション小物'
      , 'オークション > ファッション > メンズファッション'
      , 'オークション > ファッション > メンズバッグ'
      , 'オークション > ファッション > 男性和服、着物'
      , 'オークション > ファッション > 男女兼用バッグ'
      , 'オークション > ファッション > ハンドメイド'
      ]
    , Automotive:         [
        'オークション > 自動車、オートバイ'
      ]
    , Baby:               [
        'オークション > ファッション > キッズ、ベビーファッション'
      , 'オークション > ベビー用品'
      ]
    , Beauty:             [
        'オークション > ビューティー、ヘルスケア > 香水、フレグランス'
      , 'オークション > ビューティー、ヘルスケア > ネイルケア'
      , 'オークション > ビューティー、ヘルスケア > リラクゼーショングッズ'
      ]
    , Blended:            ['']
    , Books:              [
        'オークション > 本、雑誌'
      ]
    , Classical:          [
        'オークション > アンティーク、コレクション'
      , 'オークション > タレントグッズ'
      ]
    , DVD:                [
        'オークション > 映画、ビデオ > DVD'
      , 'オークション > 映画、ビデオ > ブルーレイ'
      , 'オークション > 映画、ビデオ > VCD'
      , 'オークション > 映画、ビデオ > レーザーディスク'
      ]
    , Electronics:        [
        'オークション > コンピュータ'
      , 'オークション > 家電、AV、カメラ'
      ]
    , ForeignBooks:       ['']
    , Grocery:            [
        'オークション > 食品、飲料'
      ]
    , HealthPersonalCare: [
        'オークション > ビューティー、ヘルスケア > コスメ、スキンケア'
      , 'オークション > ビューティー、ヘルスケア > ヘアケア'
      , 'オークション > ビューティー、ヘルスケア > ボディケア'
      , 'オークション > ビューティー、ヘルスケア > オーラルケア'
      , 'オークション > ビューティー、ヘルスケア > めがね、コンタクト'
      , 'オークション > ビューティー、ヘルスケア > 看護、介護用品'
      , 'オークション > ビューティー、ヘルスケア > 救急、衛生用品'
      , 'オークション > ビューティー、ヘルスケア > 健康用品、健康器具'
      , 'オークション > ビューティー、ヘルスケア > その他'
      ]
    , Hobbies:            [
        'オークション > ホビー、カルチャー'
      , 'オークション > 花、園芸'
      ]
    , HomeImprovement:    [
        'オークション > 住まい、インテリア'
      ]
    , Jewelry:            [
        'オークション > アクセサリー、時計 > ブランドアクセサリー'
      , 'オークション > アクセサリー、時計 > 子ども用アクセサリー'
      ]
    , Kitchen:            [
        'オークション > 住まい、インテリア > キッチン'
      ]
    , Music:              [
        'オークション > 音楽 > 記念品、思い出の品'
      ]
    , MusicTracks:        [
        'オークション > 音楽 > CD'
      , 'オークション > 音楽 > レコード'
      , 'オークション > 音楽 > カセットテープ'
      , 'オークション > 音楽 > DVD'
      , 'オークション > 音楽 > ブルーレイ'
      , 'オークション > 音楽 > ビデオ'
      , 'オークション > 音楽 > レーザーディスク'
      ]
    , OfficeProducts:     [
        'オークション > 事務、店舗用品'
      ]
    , Shoes:              [
        'オークション > ファッション > レディースシューズ'
      , 'オークション > ファッション > メンズシューズ'
      ]
    , Software:           [
        'オークション > コンピュータ > ソフトウエア'
      ]
    , SportingGoods:      [
        'オークション > スポーツ、レジャー'
      ]
    , Toys:               [
        'オークション > おもちゃ、ゲーム'
      ]
    , VHS:                [
        'オークション > 映画、ビデオ > ビデオテープ'
      ]
    , Video:              [
        'オークション > 映画、ビデオ > 映画関連グッズ'
      ]
    , VideoGames:         [
        'オークション > おもちゃ、ゲーム > ゲーム > テレビゲーム'
      , 'オークション > おもちゃ、ゲーム > ゲーム > アーケードゲーム'
      ]
    , Watches:            [
        'オークション > アクセサリー、時計 > ブランド腕時計'
      , 'オークション > アクセサリー、時計 > メンズ腕時計'
      , 'オークション > アクセサリー、時計 > レディース腕時計'
      , 'オークション > アクセサリー、時計 > ユニセックス腕時計'
      , 'オークション > アクセサリー、時計 > キャラクター腕時計'
      , 'オークション > アクセサリー、時計 > 懐中時計'
      ]
    };
    const props     = obj => R.prop(obj, searchIndex);
    const isCat     = obj => R.test(RegExp(obj), keyword);
    const isCats    = obj => R.filter(isCat, props(obj))
    const isIndex   = R.filter(isCats);
    const setIndex  = R.compose(R.last, isIndex);
    const keys      = R.keys(searchIndex);
    return setIndex(keys);
  }

  setKeywords(keyword) {
    return R.compose(
      std.urlencode
    , R.join(' ')
    , R.slice(3, Infinity)
    , R.split(' > ')
    )(keyword);
  }

  signature(query) {
    const parsed_url = std.parse_url(baseurl);
    const string = "GET\n" + parsed_url.host + "\n" + parsed_url.pathname + "\n" + query;
    return std.crypto_sha256(string, this.secret_key);
  }

  url(operation, request) {
    const query = this.query(operation, request);
    return baseurl + '?' + query + '&' + std.urlencode_rfc3986({ Signature: this.signature(query) });
  }

};
Amazon.displayName = '[AMZ]';
export default Amazon;
