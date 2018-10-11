import dotenv             from 'dotenv';
import * as R             from 'ramda';
import { from, forkJoin } from 'rxjs';
import { map, flatMap }   from 'rxjs/operators';
import osmosis            from 'osmosis';
import PromiseThrottle    from 'promise-throttle';
import { parseString }    from 'xml2js';
import std                from 'Utilities/stdutils';
import net                from 'Utilities/netutils';
import log                from 'Utilities/logutils';
import Amazon             from 'Utilities/Amazon';

const config = dotenv.config();
if(config.error) throw config.error();

const STORAGE   = process.env.STORAGE;
const AMZ_ACCESS_KEY = process.env.AMZ_ACCESS_KEY;
const AMZ_SECRET_KEY = process.env.AMZ_SECRET_KEY;
const AMZ_ASSOCI_TAG = process.env.AMZ_ASSOCI_TAG;
const amz_keyset = { access_key: AMZ_ACCESS_KEY, secret_key: AMZ_SECRET_KEY, associ_tag: AMZ_ASSOCI_TAG };
const searchurl = 'https://auctions.yahoo.co.jp/search/search';
const baseurl   = 'https://auth.login.yahoo.co.jp/yconnect/v2/';
const authurl   = baseurl + '.well-known/openid-configuration';
const jwksurl   = baseurl + 'jwks';
const keyurl    = baseurl + 'public-keys';
const tokenurl  = baseurl + 'token';

/**
 * Yahoo Api Client class.
 *
 * @constructor
 * @param {string} access_key - The access key for this application.
 * @param {string} secret_key - The secret key for this application.
 * @param {string} redirect_url - The application top URL.
 */
class Yahoo {
  constructor(access_key, secret_key, redirect_url) {
    this.access_key = access_key;
    this.secret_key = secret_key;
    this.redirect_url = redirect_url;
    this.tokens = [];
    this.promiseThrottle = new PromiseThrottle({ requestsPerSecond: 10, promiseImplementation: Promise });
    this.AMZ = Amazon.of(amz_keyset);
  }

  static of(options) {
    const access_key = options && options.access_key ? options.access_key : '';
    const secret_key = options && options.secret_key ? options.secret_key : '';
    const redirect_url = options && options.redirect_url ? options.redirect_url : '';
    return new Yahoo(access_key, secret_key, redirect_url);
  }

  request(request, options) {
    //log.info(Yahoo.displayName, 'Request', request);
    switch(request) {
      case 'fetch/auth/support':
        return net.promise(authurl,   { method: 'GET',  type: 'NV', accept: 'JSON' });
      case 'fetch/auth/jwks':
        return net.promise(jwksurl,   { method: 'GET',  type: 'NV', accept: 'JSON' });
      case 'fetch/auth/publickeys':
        return net.promise(keyurl,    { method: 'GET',  type: 'NV', accept: 'JSON' });
      case 'fetch/accesstoken':
        return net.promise(tokenurl,  { method: 'POST', type: 'NV', accept: 'JSON'
          , auth: { user: options.auth.client_id, pass: options.auth.client_secret }, search: options.query });
      case 'fetch/file':
        return net.get(options.url,   { operator: options.operator, filename: options.filename });
      case 'parse/xml/note':
        return this.promiseXmlNote(options);
      case 'parse/xml/item':
        return this.promiseXmlItem(options);
      case 'fetch/closedmerchant':
        return this.promiseThrottle.add(this.promiseClosedMerchant.bind(this, options));
      case 'fetch/closedsellers':
        return this.promiseThrottle.add(this.promiseClosedSellers.bind(this, options));
      case 'fetch/html':
        return this.promiseThrottle.add(this.promiseHtml.bind(this, options));
    }
  }
  
  promiseXmlNote(options) {
    return new Promise((resolve, reject) => {
      parseString(options.xml, { trim: true, explicitArray: false, attrkey: 'attr', charkey: '_' }, (err, data) => {
        if(err) reject(err);
        resolve(data);
      }); 
    });
  }

  promiseXmlItem(options) {
    return new Promise((resolve, reject) => {
      const price = R.compose(R.join(''), R.map(R.last), R.map(R.split(':')), R.match(/現在価格:[0-9,]+/g));
      const bids  = R.compose(R.join(''), R.map(R.last), R.map(R.split(':')), R.match(/入札数:[0-9-]+/g));
      const bidStopTime = R.compose(
        R.join('')
      , R.map(R.join(':')), R.map(R.tail), R.map(R.split(':'))
      , R.match(/終了日時:\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/g)
      );
      const _setItem = (obj, str) => 
        Object.assign({}, options.xml, { description: obj, price: price(str), bids: bids(str), bidStopTime: bidStopTime(str) });
      const setItem = R.curry(_setItem);
      const newItem = obj => R.compose( setItem(obj), R.last, R.split('>') );
      parseString(options.xml.description, { trim: true, explicitArray: false, strict: false, attrkey: 'attr', charkey: '_' }
      , (err, data) => {
        if(err) reject(err);
        resolve(newItem(data)(options.xml.description));
      }); 
    });
  }

  promiseClosedMerchant(options) {
    return new Promise((resolve, reject) => {
      const url   = options.url;
      const pages = options.pages || 1;
      const skip  = options.skip  || 0;
      const limit = options.limit || 20;
      log.info(Yahoo.displayName, 'closedsearch:', 'skip =', skip, 'limit =', limit);

      let results;
      if(!url) return reject({ name: 'Error', message: 'Url not passed.' });
      osmosis.get(url, { n: limit, b: skip + 1 })
        .paginate({ b: +limit }, pages - 1)
        .set({ title: 'title', item: [ osmosis
          .find('div#list01 tr')
          .filter('td.i, td.a1')
          .set({
            link: 'div.a1wrp a@href'
          , attr_HREF : 'div.th a@href'
          , img_SRC:    'div.th img@src' 
          , img_ALT:    'div.th img@alt'
          , description: {
              DIV: { A: { attr: { HREF: 'div.th a@href' }, IMG: { attr: { SRC:  'div.th img@src', ALT: 'div.th img@alt' } } } } 
            }})
          .follow('div.a1wrp h3 a')
          .set({
            title:        'div.decBg04 h1 > text()'
          , bids:         'td.decBg01 > b > text()'
          , buynow:       'p.decTxtBuyPrice > text()'
          , price:        'p.decTxtAucPrice > text()'
          , seller:       'div.untBody.decPwrBox div.pts01 a > text()'
          , categoryUrls: ['div#yjBreadcrumbs a@href'               ]
          , categorys:    ['div#yjBreadcrumbs a > text()'           ]
          , property:     ['div.untBody div.pts04 th'               ]
          , details:      ['div.untBody div.pts04 td[2] > text()[1]']
          , explanation:  'div#adoc div#acMdUsrPrv'
          , payment:      'div#itempayment table'
          , shipping:     'div#itemshipping table'
          , ship_details: ['div#itemshipping td'    ]
          , images:       ['div#imageinfo img@src'  ]
          })
        ]})
        .data(data => { 
          const setSize         = _obj => R.merge(_obj, { img_BORDER: 0, img_WIDTH:  134, img_HEIGHT: 100 });
          const setImage        = _obj => { 
            _obj.description.DIV.A.IMG['attr'] = R.merge({ BORDER: 0, WIDTH: 134, HEIGHT: 100 }, _obj.description.DIV.A.IMG.attr);
            return _obj;
          };
          const zipDetail       = _obj => R.zip(_obj.property, _obj.details);
          const _getDetail      = (str, _objs) => {
            const details = R.find(_obj => _obj[0] === str, _objs);
            return details ? details[1] : '';
          };
          const getDetail       = R.curry(_getDetail);
          const setDetail       = (str, _obj) => R.compose(getDetail(str), zipDetail)(_obj);
          const setAuctionId    = _obj =>  !!_obj.property || !!_obj.details 
            ? R.merge(_obj, 
              { guid: { _: setDetail('オークションID', _obj), attr: { isPermaLink: false } }
                , guid__: setDetail('オークションID', _obj), guid_isPermaLink: false })
            : _obj;
          const setPubDate      = _obj => R.merge(_obj, { pubDate: std.formatDate(new Date(), 'YYYY/MM/DD hh:mm') });
          const _setPrice       = _obj => R.replace(/円|,|\s/g, '', _obj);
          const setBuyNow       = _obj => _obj.buynow 
            ? R.merge(_obj, { buynow: _setPrice(_obj.buynow) }) : R.merge(_obj, { buynow: '-' });
          const setPrice        = _obj => _obj.price ? R.merge(_obj, { price: _setPrice(_obj.price) }) : R.merge(_obj, { price: '-' });
          const setSeller       = _obj => _obj.seller ? R.merge(_obj, { seller: _obj.seller }) : R.merge(_obj, { seller: '-' });
          const setBids         = _obj => _obj.bids ? R.merge(_obj, { bids: _obj.bids }) : R.merge(_obj, { bids: '-' });
          const setCountdown    = _obj => R.merge(_obj, { countdown: '終了' });
          const setCondition    = _obj => R.merge(_obj, { item_condition: setDetail('商品の状態', _obj) });
          const setOffers       = _obj => R.merge(_obj, { offers: _setPrice(setDetail('開始時の価格', _obj)) });
          const setCategory     = R.join(' > ');
          const setCategorys    = _obj => R.merge(_obj, { item_categorys: setCategory(_obj.categorys) });
          const _setCategoryId  = R.compose(R.last, R.filter(c => c !== ''), R.split('/'), str => std.parse_url(str).pathname, R.last);
          const setCategoryId   = _obj => R.merge(_obj, { item_categoryid: _setCategoryId(_obj.categoryUrls) });
          const _setDate        = R.replace(/(\d+)月\s(\d+)日[\s\S]*(\d+)時\s(\d+)分/, '$1/$2 $3:$4');
          const setBidStopTime  = _obj => {
            const today = new Date();
            const yyyy = today.getFullYear();
            const _date = _setDate(setDetail('終了日時', _obj));
            const next = Date.parse(yyyy     + '/' + _date);
            const past = Date.parse(yyyy -1  + '/' + _date);
            const date = Date.now() < next ? past : next;
            return R.merge(_obj, { bidStopTime: std.formatDate(new Date(date), 'YYYY/MM/DD hh:mm')});
          };
          const setHifn         = str  => R.isEmpty(str) ? '-' : str;
          const setShipPrice    = _obj => R.merge(_obj, { ship_price: setHifn(_obj.ship_details[0]) });
          const setShipBuyNow   = _obj => R.merge(_obj, { ship_buynow: setHifn(_obj.ship_details[0]) });
          const setShipping     = _obj => R.merge(_obj, { shipping: setHifn(_obj.ship_details[6]) });
          const setExplanation  = _obj => { 
            const input = R.replace(/\r?\n/g, '', _obj.explanation);
            const len = R.length(input);
            const words = [ '支払詳細', '商品詳細', '発送詳細', '注意事項' ];
            let num1 = R.length(words), idx = 0, pairs = [];
            while(num1--) {
              idx = R.indexOf(words[num1], input);
              if(idx !== -1)        pairs[num1] = { name: words[num1], from: idx };
            }
            pairs = R.compose(R.sortBy(R.prop('from')), R.filter(__obj => !R.isNil(__obj)))(pairs);
            const max = R.length(pairs);
            let num2 = max;
            while(num2--) {
              if(num2 === max - 1)  pairs[num2] = R.merge(pairs[num2], { to: len });
              else                  pairs[num2] = R.merge(pairs[num2], { to: pairs[num2+1].from - 1 });
            }
            const subString     = __obj => input.substring(__obj.from, __obj.to);
            const setSubStr     = __obj => R.merge(__obj, { string: subString(__obj) });
            const setExplan     = __obj => __obj ? __obj.string : '';
            const isExplan      = __obj => __obj.name === '商品詳細';
            const explanation = R.compose(setExplan, R.find(isExplan), R.map(setSubStr))(pairs);
            return R.merge(_obj, { explanation }); 
          };
          const setImages       = _obj => R.merge(_obj, { images: R.uniq(_obj.images) });
          const isGuid          = _obj => _obj.guid__;
          const setItems        = _objs => ({ url, title: data.title, item: _objs });
          const result = R.compose(
            setItems
          , R.map(setImages)
          , R.map(setExplanation)
          , R.map(setShipping)
          , R.map(setShipBuyNow)
          , R.map(setShipPrice)
          , R.map(setCategoryId)
          , R.map(setOffers)
          , R.map(setCategorys)
          , R.map(setCountdown)
          , R.map(setBids)
          , R.map(setCondition)
          , R.map(setSeller)
          , R.map(setBuyNow)
          , R.map(setPrice)
          , R.map(setBidStopTime)
          , R.map(setPubDate)
          , R.filter(isGuid)
          , R.map(setAuctionId)
          , R.map(setSize)
          , R.map(setImage)
          , R.filter(R.is(Object))
          )(data.item);
          const concatValues = (k,l,r) => k === 'item' ? R.concat(l,r) : r;
          results = R.mergeWithKey(concatValues, results, result);
        })
        .then((context, data) => {
          const params = context.request.params;
          const title = data.title;
          const len   = R.length(data.item);
          const skip  = params && params.b ? params.b : 1;
          const limit = params && params.n ? params.n : 20;
          const page  = Math.ceil(skip / limit);
          log.info(Yahoo.displayName, 'closedsearch:', title, 'items =', len, 'page =', page);
        })
        //.log(msg    => log.trace(Yahoo.displayName, msg))
        //.debug(msg  => log.debug(Yahoo.displayName, msg))
        .error(msg  => log.warn(Yahoo.displayName, msg))
        .done(()    => resolve(results));
    });
  }
  
  promiseClosedSellers(options) {
    return new Promise((resolve, reject) => {
      const url   = options.url;
      const pages = options.pages || 1;
      const skip  = options.skip  || 0;
      const limit = options.limit || 25;
      log.info(Yahoo.displayName, 'closedsellers:', 'skip =', skip, 'limit =', limit);

      const page  = Math.ceil((skip + 1) / limit);
      let results;
      if(!url) return reject({ name: 'Error', message: 'Url not passed.' });
      osmosis.get(url, { apg: page })
        .paginate({ apg: +1 }, pages - 1)
        .set({ title: 'title', item: [ osmosis
          .find('div.maincol')
          .filter('table[1] > tbody > tr > td > table > tbody > tr[1] > td > small')
          .set({
            link: 'a@href'
          , attr_HREF : 'a@href'
          })
          .follow('a')
          .set({
            img_SRC:    'img#acMdThumPhoto@src' 
          , img_ALT:    'img#acMdThumPhoto@alt'
          , description: { DIV: { A: { IMG:  { attr: { SRC: 'img#acMdThumPhoto@src', ALT: 'img#acMdThumPhoto@alt' } } } } }
          , title:        'div.decBg04 h1 > text()'
          , bids:         'td.decBg01 > b > text()'
          , buynow:       'p.decTxtBuyPrice > text()'
          , price:        'p.decTxtAucPrice > text()'
          , seller:       'div.untBody.decPwrBox div.pts01 a > text()'
          , categoryUrls: ['div#yjBreadcrumbs a@href'               ]
          , categorys:    ['div#yjBreadcrumbs a > text()'           ]
          , property:     ['div.untBody div.pts04 th'               ]
          , details:      ['div.untBody div.pts04 td[2] > text()[1]']
          , explanation:  'div#adoc div#acMdUsrPrv'
          , payment:      'div#itempayment table'
          , shipping:     'div#itemshipping table'
          , ship_details: ['div#itemshipping td'   ]
          , images:       ['div#imageinfo img@src' ]
          })
        ]})
        .data(data => {
          const setSize         = _obj => R.merge(_obj, { img_BORDER: 0, img_WIDTH:  134, img_HEIGHT: 100 });
          const setImage        = _obj => { 
            _obj.description.DIV['A'] = R.merge(
              { attr: { HREF: `https://page.auctions.yahoo.co.jp/jp/auction/${setDetail('オークションID', _obj)}#enlargeimg` } }
            , _obj.description.DIV.A);
            _obj.description.DIV.A.IMG['attr'] = R.merge({ BORDER: 0, WIDTH: 134, HEIGHT: 100 }, _obj.description.DIV.A.IMG.attr);
            return _obj;
          };
          const zipDetail       = _obj => R.zip(_obj.property, _obj.details);
          const _getDetail      = (str, _objs) => {
            const details = R.find(_obj => _obj[0] === str, _objs);
            return details ? details[1] : '';
          };
          const getDetail       = R.curry(_getDetail);
          const setDetail       = (str, _obj) => R.compose(getDetail(str), zipDetail)(_obj);
          const setAuctionId    = _obj => _obj.property || _obj.details 
            ? R.merge(_obj, { guid: { _: setDetail('オークションID', _obj), attr: { isPermaLink: false } }
                , guid__: setDetail('オークションID', _obj), guid_isPermaLink: false })
            : _obj;
          const setPubDate      = _obj => R.merge(_obj, { pubDate: std.formatDate(new Date(), 'YYYY/MM/DD hh:mm') });
          const _setPrice       = _obj => R.replace(/円|,|\s/g, '', _obj);
          const setBuyNow       = _obj => _obj.buynow 
            ? R.merge(_obj, { buynow: _setPrice(_obj.buynow) }) : R.merge(_obj, { buynow: '-' });
          const setPrice        = _obj => _obj.price ? R.merge(_obj, { price: _setPrice(_obj.price) }) : R.merge(_obj, { price: '-' });
          const setSeller       = _obj => _obj.seller ? R.merge(_obj, { seller: _obj.seller }) : R.merge(_obj, { seller: '-' });
          const setBids         = _obj => _obj.bids ? R.merge(_obj, { bids: _obj.bids }) : R.merge(_obj, { bids: '-' });
          const setCountdown    = _obj => R.merge(_obj, { countdown: '終了' });
          const setCondition    = _obj => R.merge(_obj, { item_condition: setDetail('商品の状態', _obj) });
          const setOffers       = _obj => R.merge(_obj, { offers: _setPrice(setDetail('開始時の価格', _obj)) });
          const setCategory     = R.join(' > ');
          const setCategorys    = _obj => R.merge(_obj, { item_categorys: setCategory(_obj.categorys) });
          const _setCategoryId  = R.compose(
            R.last, R.filter(c => c !== '')
          , R.split('/'), url => std.parse_url(url).pathname, R.last
          );
          const setCategoryId   = _obj => R.merge(_obj, { item_categoryid: _setCategoryId(_obj.categoryUrls) });
          const _setDate        = R.replace(/(\d+)月\s(\d+)日[\s\S]*(\d+)時\s(\d+)分/, '$1/$2 $3:$4');
          const setBidStopTime  = _obj => {
            const today = new Date();
            const yyyy = today.getFullYear();
            const _date = _setDate(setDetail('終了日時', _obj));
            const next = Date.parse(yyyy     + '/' + _date);
            const past = Date.parse(yyyy -1  + '/' + _date);
            const date = Date.now() < next ? past : next;
            return R.merge(_obj, { bidStopTime: std.formatDate(new Date(date), 'YYYY/MM/DD hh:mm')});
          };
          const setHifn         = str  => R.isEmpty(str) ? '-' : str;
          const setShipPrice    = _obj => R.merge(_obj, { ship_price: setHifn(_obj.ship_details[0]) });
          const setShipBuyNow   = _obj => R.merge(_obj, { ship_buynow: setHifn(_obj.ship_details[0]) });
          const setShipping     = _obj => R.merge(_obj, { shipping: setHifn(_obj.ship_details[6]) });
          const setExplanation  = _obj => { 
            const input = R.replace(/\r?\n/g, '', _obj.explanation);
            const len = R.length(input);
            const words = [ '支払詳細', '商品詳細', '発送詳細', '注意事項' ];
            let num1 = R.length(words), idx = 0, pairs = [];
            while(num1--) {
              idx = R.indexOf(words[num1], input)
              if(idx !== -1)        pairs[num1] = { name: words[num1], from: idx };
            }
            pairs = R.compose(R.sortBy(R.prop('from')), R.filter(__obj => !R.isNil(__obj)))(pairs);
            const max = R.length(pairs);
            let num2 = max;
            while(num2--) {
              if(num2 === max - 1)  pairs[num2] = R.merge(pairs[num2], { to: len });
              else                  pairs[num2] = R.merge(pairs[num2], { to: pairs[num2+1].from - 1 });
            }
            const subString     = __obj => input.substring(__obj.from, __obj.to);
            const setSubStr     = __obj => R.merge(__obj, { string: subString(__obj) });
            const setExplan     = __obj => __obj ? __obj.string : '';
            const isExplan      = __obj => __obj.name === '商品詳細';
            const explanation = R.compose(setExplan, R.find(isExplan), R.map(setSubStr))(pairs);
            return R.merge(_obj, { explanation }); 
          };
          const setImages       = _obj => R.merge(_obj, { images: R.uniq(_obj.images) });
          const isGuid          = _obj => _obj.guid__;
          const isDescription   = _obj => _obj.description;
          const setItems        = _objs => ({ url, title: data.title, item: _objs });
          const result          = R.compose(
            setItems
          , R.map(setImages)
          , R.map(setExplanation)
          , R.map(setShipping)
          , R.map(setShipBuyNow)
          , R.map(setShipPrice)
          , R.map(setCategoryId)
          , R.map(setOffers)
          , R.map(setCategorys)
          , R.map(setCountdown)
          , R.map(setBids)
          , R.map(setCondition)
          , R.map(setSeller)
          , R.map(setBuyNow)
          , R.map(setPrice)
          , R.map(setBidStopTime)
          , R.map(setPubDate)
          , R.filter(isGuid)
          , R.map(setAuctionId)
          , R.map(setSize)
          , R.map(setImage)
          , R.filter(isDescription)
          , R.filter(R.is(Object))
          )(data.item);
          const concatValues = (k,l,r) => k === 'item' ? R.concat(l,r) : r;
          results = R.mergeWithKey(concatValues, results, result);
        })
        .then((context, data) => {
          const params = context.request.params;
          const title = data.title;
          const len   = R.length(data.item);
          const page  = params && params.apg ? params.apg : 1;
          log.info(Yahoo.displayName, 'closedsellers:', title, 'items =', len, 'page =', page);
        })
        //.log(msg    => log.trace(Yahoo.displayName, msg))
        //.debug(msg  => log.debug(Yahoo.displayName, msg))
        .error(msg  => log.warn(Yahoo.displayName, msg))
        .done(()    => resolve(results));
    });
  }
  
  promiseHtml(options) {
    return new Promise((resolve, reject) => {
      const url   = options.url;
      const pages = options.pages || 1;
      const skip  = options.skip  || 0;
      const limit = options.limit || 20;
      log.info(Yahoo.displayName, 'html:', 'skip =', skip, 'limit =', limit);

      let results;
      if(!url) return reject({ name: 'Error', message: 'Url not passed.' });
      osmosis.get(url, { n: limit, b: skip + 1 })
        .paginate({ b: +limit }, pages -1)
        .set({ title: 'title', item: [ osmosis
          .find('div#list01 tr')
          .filter('td.i, td.a1')
          .set({
            link: 'div.a1wrp a@href'
          , attr_HREF : 'div.th a@href'
          , img_SRC:    'div.th img@src' 
          , img_ALT:    'div.th img@alt'
          , description: { DIV: { A: {
              attr: { HREF: 'div.th a@href' }
            , IMG: { attr: { SRC:  'div.th img@src', ALT: 'div.th img@alt' } }
            } } }
          })
          .follow('div.a1wrp h3 a')
          .set({
            title:        'h1.ProductTitle__text > text()'
          , bids:         'li.Count__count.Count__count > dl > dd.Count__number > text()'
          , countnumber:  'li.Count__count.Count__count--sideLine dd.Count__number > text()'
          , countunit:    'li.Count__count.Count__count--sideLine span.Count__unit > text()'
          , buynow:       'div.Price.Price--buynow dd.Price__value > text()'
          , price:        'div.Price.Price--current dd.Price__value > text()'
          , ship_buynow:  'div.Price.Price--buynow dd.Price__postage > span.Price__postageValue >text()'
          , ship_price:   'div.Price.Price--current dd.Price__postage > span.Price__postageValue > text()'
          , seller:       'dd.Seller__card > span.Seller__name > a > text()'
          , categoryUrls: ['div#yjBreadcrumbs a@href'               ]
          , categorys:    ['div#yjBreadcrumbs a > text()'           ]
          , details:      ['dd.ProductDetail__description > text()' ]
          , explanation:  'div#ProductExplanation div.ProductExplanation__body'
          , payment:      'div.ProductProcedure--payment div.ProductProcedure__body'
          , shipping:     'div.ProductProcedure--shipping div.ProductProcedure__body'
          , images:       ['ul.ProductImage__thumbnails img@src'   ]
          })
        ]})
        .data(data => {
          const setSize         = _obj => R.merge(_obj, { img_BORDER: 0, img_WIDTH:  134, img_HEIGHT: 100 });
          const setImage        = _obj => {
            _obj.description.DIV.A.IMG['attr'] = R.merge({ BORDER: 0, WIDTH: 134, HEIGHT: 100 }, _obj.description.DIV.A.IMG.attr);
            return _obj;
          };
          const setAuctionId    = _obj => R.merge(_obj, {
            guid: { _: _obj.details[10], attr: { isPermaLink: false } }, guid__: _obj.details[10] , guid_isPermaLink: false 
          });
          const setPubDate      = _obj => R.merge(_obj, { pubDate: std.formatDate(new Date(), 'YYYY/MM/DD hh:mm') });
          const _setPrice       = _obj => R.replace(/円|,|\s/g, '', _obj);
          const setBuyNow       = _obj => _obj.buynow 
            ? R.merge(_obj, { buynow: _setPrice(_obj.buynow) }) : R.merge(_obj, { buynow: '-' });
          const setPrice        = _obj => _obj.price
            ? R.merge(_obj, { price: _setPrice(_obj.price), market: _setPrice(_obj.price) }) 
            : R.merge(_obj, { price: '-', market: '-' });
          const setSeller       = _obj => _obj.seller ? R.merge(_obj, { seller: _obj.seller }) : R.merge(_obj, { seller: '-' });
          const setBids         = _obj => _obj.bids ? R.merge(_obj, { bids: _obj.bids }) : R.merge(_obj, { bids: '-' });
          const setCountdown    = _obj => 
            _obj.countnumber ? R.merge(_obj, { countdown: _obj.countnumber + _obj.countunit }) : R.merge(_obj, { countdown: '_' });
          const setCondition    = _obj => R.merge(_obj, { item_condition: _obj.details[0] });
          const setOffers       = _obj => R.merge(_obj, { offers: _setPrice(_obj.details[9]) });
          const setCategory     = R.join(' > ');
          const setCategorys    = _obj => R.merge(_obj, { item_categorys: setCategory(_obj.categorys) });
          const _setCategoryId  = R.compose(R.last, R.filter(c => c !== ''), R.split('/'), str => std.parse_url(str).pathname, R.last);
          const setCategoryId   = _obj => R.merge(_obj, { item_categoryid: _setCategoryId(_obj.categoryUrls) });
          const _setDate        = R.compose(R.replace(/（.）/g, ' '), R.replace(/\./g, '/'));
          const setBidStopTime  = _obj => R.merge(_obj, { bidStopTime: _setDate(_obj.details[3]) });
          const setHifn         = str  => R.isNil(str) ? '-' : str;
          const setShipPrice    = _obj => R.merge(_obj, { ship_price: setHifn(_obj.ship_price) });
          const setShipBuyNow   = _obj => R.merge(_obj, { ship_buynow: setHifn(_obj.ship_buynow) });
          const setImages       = _obj => R.merge(_obj, { images: R.uniq(_obj.images) });
          const isGuid          = _obj => _obj.guid__;
          const setItems        = _objs => ({ url, title: data.title, item: _objs });
          return results        = R.compose(
            setItems
          , R.map(setImages)
          , R.map(setShipBuyNow)
          , R.map(setShipPrice)
          , R.map(setCategoryId)
          , R.map(setOffers)
          , R.map(setCategorys)
          , R.map(setCountdown)
          , R.map(setBids)
          , R.map(setCondition)
          , R.map(setSeller)
          , R.map(setBuyNow)
          , R.map(setPrice)
          , R.map(setBidStopTime)
          , R.map(setPubDate)
          , R.filter(isGuid)
          , R.map(setAuctionId)
          , R.map(setSize)
          , R.map(setImage)
          , R.filter(R.is(Object))
          )(data.item);
        })
        .then((context, data) => {
          const params = context.request.params;
          const title = data.title;
          const len   = R.length(data.item);
          const skip  = params && params.b ? params.b : 1;
          const limit = params && params.n ? params.n : 20;
          const page  = Math.ceil(skip / limit);
          log.info(Yahoo.displayName, 'html:', title, 'items =', len, 'page =', page);
        })
        //.log(msg => log.trace(Yahoo.displayName, msg))
        //.debug(msg => log.debug(Yahoo.displayName, msg))
        .error(msg => log.warn(Yahoo.displayName, msg))
        .done(()  => resolve(results));
    });
  }

  getAuthSupport() {
    return this.request('fetch/auth/support', {});
  }

  getAuthJwks() {
    return this.request('fetch/auth/jwls', {});
  }

  getAuthPublickeys() {
    return this.request('fetch/auth/publickeys', {});
  }

  getAccessToken(query, auth) {
    return this.request('fetch/accesstoken', { query, auth });
  }

  getRss(url) {
    return this.request('fetch/file', { url });
  }

  getXmlNote(xml) {
    return this.request('parse/xml/note', { xml });
  }

  getXmlItem(xml) {
    return this.request('parse/xml/item', { xml });
  }

  getImage(operator, aid,  url) {
    const filename    = std.crypto_sha256(url, aid, 'hex') + '.img';
    operator = operator(STORAGE, filename);
    return this.request('fetch/file', { url, operator, filename });
  }

  getClosedMerchant(url, pages, skip, limit) {
    return this.request('fetch/closedmerchant', { url, pages, skip, limit });
  }

  getClosedSellers(url, pages, skip, limit) {
    return this.request('fetch/closedsellers', { url, pages, skip, limit });
  }

  getHtml(url, pages, skip, limit) {
    return this.request('fetch/html', { url, pages, skip, limit });
  }
  
  jobClosedMerchant({ url, pages, skip, limit }) {
    return from(this.getClosedMerchant(url, pages, skip, limit)).pipe(
      flatMap(this.fetchMarchant.bind(this))
    , flatMap(this.fetchItemSearch.bind(this))
    );
  }

  jobClosedSellers({ url, pages, skip, limit }) {
    return from(this.getClosedSellers(url, pages, skip, limit)).pipe(
      flatMap(this.fetchMarchant.bind(this))
    , flatMap(this.fetchItemSearch.bind(this))
    );
  }

  jobHtml({ url, pages, skip, limit }) {
    return from(this.getHtml(url, pages, skip, limit));
  }

  jobImages({ operator, items }) {
    const getImage = obj => this.jobImage(operator, obj);
    return from(items).pipe(
      flatMap(getImage)
    );
  }

  jobImage(operator, { guid__, images }) {
    const promises    = R.map(obj => this.getImage(operator, guid__, obj));
    return forkJoin(promises(images));
  }

  fetchClosedMerchant({ url, pages, skip, limit }) {
    return from(this.getClosedMerchant(url, pages, skip, limit));
  }

  fetchClosedSellers({ url, pages, skip, limit }) {
    return from(this.getClosedSellers(url, pages, skip, limit));
  }

  fetchHtml({ url, pages, skip, limit }) {
    return from(this.getHtml(url, pages, skip, limit));
  }

  fetchItemSearch(note) {
    const _setAsins   = (items, objs) => R.map(item => this.setAsin(item, objs), items);
    const _setItems   = (_note, objs) => R.merge(_note, { item: objs });
    const setAsins    = R.curry(_setAsins)(note.item);
    const setItems    = R.curry(_setItems)(note);
    const observables = R.map(obj => this.AMZ.fetchItemSearch(this.repSpace(obj.title), obj.item_categoryid, 1));
    return forkJoin(observables(note.item)).pipe(
      map(setAsins)
    , map(setItems)
    );
  }

  setAsin (item, objs) {
    const setASINs  = _objs => R.merge(item, { asins: _objs });
    const getASIN   = _obj  => Array.isArray(_obj.Item) ?  R.map(Item => Item.ASIN, _obj.Item) : [ _obj.Item.ASIN ];
    const isValid   = _obj  => _obj
      && _obj.Request.IsValid === 'True'
      && _obj.Request.ItemSearchRequest.Keywords === this.repSpace(item.title)
      && Number(_obj.TotalResults) > 0;
    return R.compose(
      setASINs 
    , R.head
    , R.map(getASIN)
    , R.filter(isValid)
    )(objs);
  }

  repSpace(keywords)  {
    const delMark1   = R.replace(/[\u25CE\u25CF\u25B3\u25BD\u25B2\u25BC\u22BF\u25B6\u25C0\u25A1\u25A0]/g, ' ');
    const delMark2   = R.replace(/[\u25C7\u25C6\uFF01\u2661\u2665\u2664\u2660\u2667\u2663\u2662\u2666]/g, ' ');
    const delMark3   = R.replace(/[\u3010\u3011\u2605\u2606\u203B\uFF0A\u266A]/g                        , ' ');
    const delString1 = R.replace(/\u7F8E\u54C1|\u826F\u54C1|\u6975|\u512A|\u4E2D\u53E4|\u7D14\u6B63/g   , ' ');
    const delString2 = R.replace(/\u8A33\u3042\u308A|\u73FE\u72B6\u54C1|\u307B\u307C\u672A\u4F7F\u7528/g, ' ');
    const delString3 = R.replace(/\u9AD8\u901F\u7248|\u9001\u6599\u7121\u6599|\u8D85/g                  , ' ');
    const repString  = R.compose(
      delMark1
    , delMark2
    , delMark3
    , delString1
    , delString2
    , delString3
    );
    return repString(keywords);
  }

  fetchMarchant(note) {
    const isItem            = obj => !!obj.title;
    const urls              = note.item ? R.compose( R.map(this.setUrl.bind(this)), R.filter(isItem))(note.item) : [];
    const _setMarkets       = (items, objs) => R.map(item => this.setMarket(item, objs), items);
    const _setPerformances  = (items, objs) => R.map(obj => this.setPerformance(items, obj), objs);
    const _setItems         = (_note, objs) => R.merge(_note, { item: objs });
    const setMarkets        = R.curry(_setMarkets)(note.item);
    const setPerformances   = R.curry(_setPerformances)(note.item);
    const setItems          = R.curry(_setItems)(note);
    const promises          = R.map(this.getHtml.bind(this));
    return forkJoin(promises(urls)).pipe(
      map(setMarkets)
    , map(setPerformances)
    , map(setItems)
    );
  }

  setUrl(obj) {
    const api = std.parse_url(searchurl);
    api.searchParams.append('p', obj.title);
    return api.href;
  }

  setMarket(item, objs) {
    const _isSeller = _obj  => R.find(_item => item.title === _item.title && item.seller === _item.seller)(_obj.item);
    const isSeller  = _obj  => _obj && _obj.item && _obj.item.length > 0 ? _isSeller(_obj) : false;
    const isSales   = _objs => R.filter(_obj => isSeller(_obj), _objs);
    const getSales  = _objs => _objs.length > 0
      ? { market: _objs[0].item[0].price, sale: _objs[0].item.length } : { market: '-', sale: 0 };
    const setSale   = _obj  => R.merge(item, _obj);
    return R.compose(
      setSale
    , getSales
    , isSales
    )(objs);
  }

  setPerformance(items, obj) {
    const isSeller  = _obj  => obj.title === _obj.title && obj.seller === _obj.seller;
    const isSolds   = _objs => R.filter(_obj => isSeller(_obj), _objs);
    const getSolds  = _objs => _objs.length > 0 ? { sold: _objs.length } : { sold: 0 };
    const setSold   = item  => R.merge(obj, item);
    return R.compose(
      setSold
    , getSolds
    , isSolds
    )(items);
  }

  fetchRss({ url }) {
    let _note;
    const _setItems = (note, item) => R.merge(note.rss.channel, { item });
    const setItems = R.curry(_setItems)(_note);
    const setNote  = obj => _note = obj;
    const fetchRss = obj => from(this.getRss(obj));
    const fetchXml = obj => from(this.getXmlNote(obj.body));
    const promises = obj => R.map(this.getXmlItem.bind(this), obj.rss.channel.item);
    const fetchXmlItems = obj => forkJoin(promises(obj));
    return fetchRss(url).pipe(
      flatMap(fetchXml)
    , map(setNote)
    , flatMap(fetchXmlItems)
    , map(setItems)
    );
  }

  fetchAuthSupport() {
    const setAuthSupport = obj => ({
      authApi: obj.authorization_endpoint
    , toknApi: obj.token_endpoint
    , userApi: obj.userinfo_endpoint
    , jwksApi: obj.jwks_uri
    , support: obj.response_types_supported
    });
    return from(this.getAuthSupport).pipe(
      map(setAuthSupport)
    );
  }

  fetchAuthJwks() {
    const setKey      = obj => ({ keyid: obj.kid, modulus: obj.n, exponent: obj.e });
    const setAuthJwks = obj => R.map(setKey, obj.keys);
    return from(this.getAuthJwks).pipe(
      map(setAuthJwks)
    );
  }

  fetchAuthPublicKeys() {
    const setKeyId = obj => obj.client.keyid;
    return from(this.getAuthPublickeys).pipe(
      map(setKeyId)
    );
  }

  createAuthToken({ code }) {
    let query = new Object();
    let auth = new Object();
    query['grant_type'] = 'authorization_code';
    query['redirect_uri'] = this.redirect_url;
    query['code'] = code;
    auth['client_id'] = this.access_key;
    auth['client_secret'] = this.secret_key;
    const setToken = obj => {
      const newToken = {
        code:             code
        , access_token:   obj.access_token
        , refresh_token:  obj.refresh_token
        , expires_in:     obj.expires_in
        , id_token:       obj.id_token
      };
      const isSuccess =
        this.hasToken(code) ? false : this.addToken(newToken);
      if(!isSuccess) throw new Error({ name: 'Error', message: 'Create Token Error!!' });
      return newToken;
    };
    return from(this.getAccessToken(query, auth)).pipe(
      map(setToken)
    );
  }

  refreshAuthToken({ code }) {
    let query = new Object();
    let auth = new Object();
    query['grant_type'] = 'refresh_token';
    query['refresh_token'] = code;
    auth['client_id'] = this.access_key;
    auth['client_secret'] = this.secret_key;
    const setToken = obj => {
      const newToken = {
        code:             code
        , access_token:   obj.access_token
        , refresh_token:  obj.refresh_token
        , expires_in:     obj.expires_in
        , id_token:       obj.id_token
      };
      const isSuccess =
        this.hasToken(code) ? this.updToken(code, newToken) : false;
      if(!isSuccess) throw new Error({ name: 'Error', message: 'Update Token Error!!' });
      return newToken;
    };
    return from(this.getAccessToken(query, auth)).pipe(
      map(setToken)
    );
  }

  deleteAuthToken({ code }) {
    const isSuccess = this.delToken(code);
    if(!isSuccess) throw new Error({ name: 'Error', message: 'Delete Token Error!!' });
    return;
  }

  fetchAuthToken({ code }) {
    const token = this.hasToken(code);
    if(!token) throw new Error({
      name: 'Error', message: 'Token not found!!'
    });
    return token;
  }

  fetchAuthTokens() {
    return this.allToken();
  }

  hasToken(code) {
    return this.tokens.find(obj => obj.code === code);
  }

  allToken() {
    return this.tokens;
  }

  addToken(token) {
    this.tokens.push(token);
    return true;
  }

  updToken(code, token) {
    this.tokens = this.tokens.map(obj => obj.code === code ? token : obj);
    return true;
  }

  delToken(code) {
    this.tokens = this.tokens.filter(obj => obj.code !== code);
    return true;
  }

  errorAuth(obj) {
    let code = new Object();
    code['nteraction_required'] = 'The Authorization Server requires '
      + 'End-User interaction of some form to proceed. This error MAY be '
      + 'returned when the prompt parameter value in the Authentication '
      + 'Request is none, but the Authentication Request cannot be '
      + 'completed without displaying a user interface for End-User '
      + 'interaction.';
    code['login_required'] = 'The Authorization Server requires End-User '
      + 'authentication. This error MAY be returned when the prompt '
      + 'parameter value in the Authentication Request is none, but the '
      + 'Authentication Request cannot be completed without displaying a '
      + 'user interface for End-User authentication.';
    code['account_selection_required'] = 'The End-User is REQUIRED to '
      + 'select a session at the Authorization Server. The End-User MAY '
      + 'be authenticated at the Authorization Server with different '
      + 'associated accounts, but the End-User did not select a session. '
      + 'This error MAY be returned when the prompt parameter value in '
      + 'the Authentication Request is none, but the Authentication '
      + 'Request cannot be completed without displaying a user interface '
      + 'to prompt for a session to use.';
    code['consent_required'] = 'The Authorization Server requires '
      + 'End-User consent. This error MAY be returned when the prompt '
      + 'parameter value in the Authentication Request is none, but the '
      + 'Authentication Request cannot be completed without displaying a '
      + 'user interface for End-User consent.'; 
    code['invalid_request_uri'] = 'The request_uri in the Authorization '
      + 'Request returns an error or contains invalid data.';
    code['invalid_request_object'] = 'The request parameter contains an '
      + 'invalid Request Object.';
    code['request_not_supported'] = 'The OP does not support use of the '
      + 'request parameter defined in Section 6.';
    code['request_uri_not_supported'] = 'The OP does not support use of '
      + 'the request_uri parameter defined in Section 6.';
    code['registration_not_supported'] = 'The OP does not support use of '
      + 'the registration parameter defined in Section 7.2.1.';
    return `Error code: ${obj.error}` 
      + `, response: ${code[obj.error]}`
      + `, description: ${obj.error_description}`
      + `, uri: ${obj.error_uri}`
      + `, status: ${obj.state}`
    ;
  }
}
Yahoo.displayName = '[YHA]';
export default Yahoo;
