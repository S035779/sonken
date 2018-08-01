import path                   from 'path';
import fs                     from 'fs';
import * as R                 from 'ramda';
import { from, forkJoin, of } from 'rxjs';
import { map, flatMap, tap }  from 'rxjs/operators';
import osmosis                from 'osmosis';
import { parseString }        from 'xml2js';
import std                    from 'Utilities/stdutils';
import net                    from 'Utilities/netutils';
import { logs as log }        from 'Utilities/logutils';

//Yahoo! API
const baseurl   = 'https://auth.login.yahoo.co.jp/yconnect/v2/';
const authurl   = baseurl + '.well-known/openid-configuration';
const jwksurl   = baseurl + 'jwks';
const keyurl    = baseurl + 'public-keys';
const tokenurl  = baseurl + 'token';
const searchurl = 'https://auctions.yahoo.co.jp/search/search';

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
  }

  static of(options) {
    const access_key =
      options && options.access_key ? options.access_key : '';
    const secret_key =
      options && options.secret_key ? options.secret_key : '';
    const redirect_url =
      options && options.redirect_url ? options.redirect_url : '';
    return new Yahoo(access_key, secret_key, redirect_url);
  }

  request(request, options) {
    //log.info(Yahoo.displayName, 'Request', request);
    switch(request) {
      case 'fetch/auth/support':
        return new Promise((resolve, reject) => {
          net.get2(authurl, null, (status, header, body) => {
            const result = JSON.parse(body)
            if(head.status !== 200) {
              this.errorAuth(std.merge({ request: uri, status, header }, { body: result }));
              return reject(new Error('Response Error!!'));
            }
            const response = {
              authApi: result.authorization_endpoint
            , toknApi: result.token_endpoint
            , userApi: result.userinfo_endpoint
            , jwksApi: result.jwks_uri
            , support: result.response_types_supported
            };
            resolve(response);
          });
        });
      case 'fetch/auth/jwks':
        return new Promise((resolve, reject) => {
          net.get2(jwksurl, null, (status, header, body) => {
            const result = JSON.parse(body);
            if(head.status !== 200) {
              this.errorAuth(std.merge({ request: uri, status, header }, { body: result }));
              return reject(new Error('Response Error!!'));
            }
            const kids = result.keys.map(o => ({ keyid: o.kid, modulus: o.n, exponent: o.e }));
            resolve(kids);
          });
        });
      case 'fetch/auth/publickeys':
        return new Promise((resolve, reject) => {
          net.get2(keyurl, null, (status, header, body) => {
            const result = JSON.parse(body);
            if(head.status !== 200) {
              this.errorAuth(std.merge({ request: uri, status, header }, { body: result }));
              return reject(new Error('Response Error!!'));
            }
            resolve(result);
          });
        });
      case 'fetch/accesstoken':
        return new Promise((resolve, reject) => {
          net.post2(tokenurl + '?' + std.encodeFormData(options.query)
          , { Authorization: 'Basic ' + std.atob(options.auth['client_id'] + ':' + request['client_secret']) }
          , null, (status, header, body) => {
            const result = JSON.parse(body);
            if(head.status !== 200) {
              this.errorAuth(std.merge({ request: uri, status, header }, { body: result }));
              return reject(new Error('Response Error!!'));
            }
            resolve(result);
          });
        });
      case 'fetch/file':
        //log.info(Yahoo.displayName, '[GET]', options.id, options.url);
        return new Promise((resolve, reject) => {
          const { url, headers, id } = options;
          net.fetch(url, { headers, method: 'GET' }, (err, head, body) => {
            if(err) return reject(err);
            resolve({ name: id + '-' + Date.now(), body });
          });
        });
      case 'write/file':
        log.info(Yahoo.displayName, '[PUT]', options.name);
        return new Promise((resolve, reject) => {
          const { name, buffer } = options;
          const filename = 
            path.join(__dirname, '../storage', name + '.bin');
          fs.writeFile(filename, buffer, 'binary', err => {
            if(err) return reject(err);
            resolve(filename);
          });
        });
      case 'parse/xml/note':
        return new Promise((resolve, reject) => {
          parseString(options.xml, {
            trim: true, explicitArray: false
          , attrkey: 'attr', charkey: '_'
          }, (err, data) => {
            if(err) reject(err);
            resolve(data);
          }); 
        });
      case 'parse/xml/item':
        return new Promise((resolve, reject) => {
          const price = R.compose(
            R.join(''), R.map(R.last), R.map(R.split(':'))
            , R.match(/現在価格:[0-9,]+/g));
          const bids  = R.compose(
            R.join(''), R.map(R.last), R.map(R.split(':'))
            , R.match(/入札数:[0-9-]+/g));
          const bidStopTime = R.compose(
            R.join(''), R.map(R.join(':')), R.map(R.tail)
            , R.map(R.split(':'))
            , R.match(/終了日時:\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/g));
          const _setItem = (obj, str) => Object.assign({}, options.xml
            , { description: obj, price: price(str), bids: bids(str)
              , bidStopTime: bidStopTime(str) });
          const setItem = R.curry(_setItem);
          const newItem = obj =>
            R.compose( setItem(obj), R.last, R.split('>') );
          parseString(options.xml.description, {
            trim: true, explicitArray: false, strict: false
          , attrkey: 'attr', charkey: '_'
          }, (err, data) => {
            if(err) reject(err);
            resolve(newItem(data)(options.xml.description));
          }); 
        });
      case 'fetch/closedmerchant':
        //log.info(Yahoo.displayName, '[ClosedMerchant]', options.url);
        return new Promise((resolve, reject) => {
          let results;
          let count = 0;
          osmosis.get(options.url, { n: 100, b: 1 })
            .paginate({ b: +100 }, options.pages - 1)
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
            .data(obj   => { 
              const setSize       = _obj => R.merge(_obj, { img_BORDER: 0, img_WIDTH:  134, img_HEIGHT: 100 });
              const setImage      = _obj => { 
                _obj.description.DIV.A.IMG['attr'] 
                  = R.merge({ BORDER: 0, WIDTH: 134, HEIGHT: 100 }, _obj.description.DIV.A.IMG.attr);
                return _obj;
              };
              const zipDetail     = _obj => R.zip(_obj.property, _obj.details);
              const isDetail      = (str, _obj) => _obj[0] === str;
              const getDetail     = (str, _objs) => R.find(_obj => isDetail(str, _obj), _objs)[1];
              const _getDetail    = R.curry(getDetail);
              const setDetail     = (str, _obj) => R.compose(_getDetail(str), zipDetail)(_obj);
              const setAuctionId  = _obj =>  !!_obj.property || !!_obj.details 
                ? R.merge(_obj, {
                    guid: { _: setDetail('オークションID', _obj), attr: { isPermaLink: false } }
                  , guid__: setDetail('オークションID', _obj), guid_isPermaLink: false })
                : _obj;
              const setPubDate    = _obj => R.merge(_obj, {
                pubDate: std.formatDate(new Date(), 'YYYY/MM/DD hh:mm')
              });
              const _setPrice     = _obj => R.replace(/円|,|\s/g, '', _obj);
              const setBuyNow     = _obj => _obj.buynow
                ? R.merge(_obj, { buynow: _setPrice(_obj.buynow) }) 
                : R.merge(_obj, { buynow: '-' });
              const setPrice      = _obj => _obj.price
                ? R.merge(_obj, { price: _setPrice(_obj.price) }) 
                : R.merge(_obj, { price: '-' });
              const setSeller     = _obj => _obj.seller
                ? R.merge(_obj, { seller: _obj.seller }) 
                : R.merge(_obj, { seller: '-' });
              const setBids       = _obj => _obj.bids
                ? R.merge(_obj, { bids: _obj.bids }) 
                : R.merge(_obj, { bids: '-' });
              const setCountdown  = _obj => R.merge(_obj, { countdown: '終了' });
              const setCondition  = _obj => R.merge(_obj, { item_condition: setDetail('商品の状態', _obj) });
              const setOffers  
                = _obj => R.merge(_obj, { offers: _setPrice(setDetail('開始時の価格', _obj)) });
              const setCategory   = R.join(' > ');
              const setCategorys  = _obj => R.merge(_obj, { item_categorys: setCategory(_obj.categorys) });
              const _setCategoryId= R.compose(
                R.last, R.filter(c => c !== '')
              , R.split('/'), url => std.parse_url(url).pathname, R.last
              );
              const setCategoryId
                = _obj => R.merge(_obj, { item_categoryid: _setCategoryId(_obj.categoryUrls) });
              const _setDate      = R.replace(/(\d+)月\s(\d+)日[\s\S]*(\d+)時\s(\d+)分/, '$1/$2 $3:$4');
              const setBidStopTime= _obj => {
                const today = new Date();
                const yyyy = today.getFullYear();
                const _date = _setDate(setDetail('終了日時', _obj));
                const next = Date.parse(yyyy     + '/' + _date);
                const past = Date.parse(yyyy -1  + '/' + _date);
                const date = Date.now() < next ? past : next;
                return R.merge(_obj, { bidStopTime: std.formatDate(new Date(date), 'YYYY/MM/DD hh:mm')});
              };
              const setHifn       = str  => R.isEmpty(str) ? '-' : str;
              const setShipPrice  = _obj => R.merge(_obj, { ship_price: setHifn(_obj.ship_details[0]) });
              const setShipBuyNow = _obj => R.merge(_obj, { ship_buynow: setHifn(_obj.ship_details[0]) });
              const setItems      = objs => ({ url: options.url, title: obj.title, item:  objs });
              const result = R.compose(
                setItems
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
              , R.filter(_obj => !!_obj.guid__)
              , R.map(setAuctionId)
              , R.map(setSize)
              , R.map(setImage)
              , R.filter(R.is(Object))
              //, R.tap(log.trace.bind(this))
              )(obj.item);
              const concatValues = (k,l,r) => k === 'item' ? R.concat(l,r) : r;
              results = R.mergeWithKey(concatValues, results, result);
            })
            .then((context, data) => {
              const params = context.request.params;
              const b = (params && params.b) || 1;
              log.info(Yahoo.displayName, 'Title:', data.title, 'Items:', b, 'Pages:', options.pages);
            })
            //.log(msg    => log.trace(Yahoo.displayName, msg))
            //.debug(msg  => log.debug(Yahoo.displayName, msg))
            .error(msg  => log.warn(Yahoo.displayName, msg))
            .done(()    => resolve(results));
        });
      case 'fetch/closedsellers':
        //log.info(Yahoo.displayName, '[ClosedSellers]', options.url);
        return new Promise((resolve, reject) => {
          let results;
          let count = 0;
          osmosis.get(options.url, { apg: 1 })
            .paginate({ apg: +1 }, options.pages - 1)
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
              , description: { DIV: { A: { 
                  IMG:  { attr: { SRC: 'img#acMdThumPhoto@src', ALT: 'img#acMdThumPhoto@alt' } }
                } } }
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
            .data(obj => {
              const setSize       = _obj => R.merge(_obj, { img_BORDER: 0, img_WIDTH:  134, img_HEIGHT: 100 });
              const setImage      = _obj => { 
                _obj.description.DIV['A']
                  = R.merge({ attr: { HREF: _obj.attr_HREF } }, _obj.description.DIV.A);
                _obj.description.DIV.A.IMG['attr'] 
                  = R.merge({ BORDER: 0, WIDTH: 134, HEIGHT: 100 }, _obj.description.DIV.A.IMG.attr);
                return _obj;
              };
              const zipDetail     = _obj => R.zip(_obj.property, _obj.details);
              const isDetail      = (str, _obj) => _obj[0] === str
              const getDetail     = (str, _objs) => R.find(_obj => isDetail(str, _obj), _objs)[1];
              const _getDetail    = R.curry(getDetail);
              const setDetail     = (str, _obj) => R.compose(_getDetail(str), zipDetail)(_obj);
              const setAuctionId  = _obj => !!_obj.property || !!_obj.details
                ? R.merge(_obj, {
                    guid: { _: setDetail('オークションID', _obj), attr: { isPermaLink: false } }
                  , guid__: setDetail('オークションID', _obj), guid_isPermaLink: false })
                : _obj;
              const setPubDate    = _obj => R.merge(_obj, {
                pubDate: std.formatDate(new Date(), 'YYYY/MM/DD hh:mm')
              });
              const _setPrice     = _obj => R.replace(/円|,|\s/g, '', _obj);
              const setBuyNow     = _obj => _obj.buynow
                ? R.merge(_obj, { buynow: _setPrice(_obj.buynow) }) 
                : R.merge(_obj, { buynow: '-' });
              const setPrice      = _obj => _obj.price
                ? R.merge(_obj, { price: _setPrice(_obj.price) }) 
                : R.merge(_obj, { price: '-' });
              const setSeller     = _obj => _obj.seller
                ? R.merge(_obj, { seller: _obj.seller }) 
                : R.merge(_obj, { seller: '-' });
              const setBids       = _obj => _obj.bids
                ? R.merge(_obj, { bids: _obj.bids }) 
                : R.merge(_obj, { bids: '-' });
              const setCountdown  = _obj => R.merge(_obj, { countdown: '終了' });
              const setCondition  = _obj => R.merge(_obj, { item_condition: setDetail('商品の状態', _obj) });
              const setOffers      
                = _obj => R.merge(_obj, { offers: _setPrice(setDetail('開始時の価格', _obj)) });
              const setCategory   = R.join(' > ');
              const setCategorys  = _obj => R.merge(_obj, { item_categorys: setCategory(_obj.categorys) });
              const _setCategoryId= R.compose(
                R.last, R.filter(c => c !== '')
              , R.split('/'), url => std.parse_url(url).pathname, R.last
              );
              const setCategoryId  
                = _obj => R.merge(_obj, { item_categoryid: _setCategoryId(_obj.categoryUrls) });
              const _setDate      = R.replace(/(\d+)月\s(\d+)日[\s\S]*(\d+)時\s(\d+)分/, '$1/$2 $3:$4');
              const setBidStopTime= _obj => {
                const today = new Date();
                const yyyy = today.getFullYear();
                const _date = _setDate(setDetail('終了日時', _obj));
                const next = Date.parse(yyyy     + '/' + _date);
                const past = Date.parse(yyyy -1  + '/' + _date);
                const date = Date.now() < next ? past : next;
                return R.merge(_obj, { bidStopTime: std.formatDate(new Date(date), 'YYYY/MM/DD hh:mm')});
              };
              const setHifn       = str  => R.isEmpty(str) ? '-' : str;
              const setShipPrice  = _obj => R.merge(_obj, { ship_price: setHifn(_obj.ship_details[0]) });
              const setShipBuyNow = _obj => R.merge(_obj, { ship_buynow: setHifn(_obj.ship_details[0]) });
              const setItems = objs => ({ url: options.url, title: obj.title, item:  objs });
              const result = R.compose(
                setItems
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
              , R.filter(_obj => !!_obj.guid__)
              , R.map(setAuctionId)
              , R.map(setSize)
              , R.map(setImage)
              , R.filter(_obj => !!_obj.description)
              , R.filter(R.is(Object))
              //, R.tap(log.trace.bind(this))
              )(obj.item);
              const concatValues = (k,l,r) => k === 'item' ? R.concat(l,r) : r;
              results = R.mergeWithKey(concatValues, results, result);
            })
            .then((context, data) => {
              const params = context.request.params;
              const apg = (params && params.apg) || 1;
              log.info(Yahoo.displayName, 'Title:', data.title, 'Page:', apg, 'Pages:', options.pages);
            })
            //.log(msg    => log.trace(Yahoo.displayName, msg))
            //.debug(msg  => log.debug(Yahoo.displayName, msg))
            .error(msg  => log.warn(Yahoo.displayName, msg))
            .done(()    => resolve(results));
        });
      case 'fetch/html':
        //log.info(Yahoo.displayName, '[Auctions]', options.url);
        return new Promise((resolve, reject) => {
          let results;
          osmosis.get(options.url)
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
            .data(obj => {
              const setSize = _obj => R.merge(_obj, { img_BORDER: 0, img_WIDTH:  134, img_HEIGHT: 100 });
              const setImage        = _obj => {
                _obj.description.DIV.A.IMG['attr'] 
                  = R.merge({ BORDER: 0, WIDTH: 134, HEIGHT: 100 }, _obj.description.DIV.A.IMG.attr);
                return _obj;
              };
              const setAuctionId    = _obj => R.merge(_obj, {
                guid: { _:    _obj.details[10], attr: { isPermaLink: false } }
              , guid__: _obj.details[10]
              , guid_isPermaLink: false
              });
              const setPubDate      = _obj => R.merge(_obj, {
                pubDate: std.formatDate(new Date(), 'YYYY/MM/DD hh:mm')
              });
              const _setPrice       = _obj => R.replace(/円|,|\s/g, '', _obj);
              const setBuyNow       = _obj => _obj.buynow
                ? R.merge(_obj, { buynow: _setPrice(_obj.buynow) }) 
                : R.merge(_obj, { buynow: '-' });
              const setPrice        = _obj => _obj.price
                ? R.merge(_obj, { price: _setPrice(_obj.price), market: _setPrice(_obj.price) }) 
                : R.merge(_obj, { price: '-', market: '-' });
              const setSeller       = _obj => _obj.seller
                ? R.merge(_obj, { seller: _obj.seller })
                : R.merge(_obj, { seller: '-' });
              const setBids         = _obj => _obj.bids
                ? R.merge(_obj, { bids: _obj.bids }) 
                : R.merge(_obj, { bids: '-' });
              const setCountdown    = _obj => _obj.countnumber
                ? R.merge(_obj, { countdown: _obj.countnumber + _obj.countunit })
                : R.merge(_obj, { countdown: '_' });
              const setCondition    = _obj => R.merge(_obj, { item_condition: _obj.details[0] });
              const setOffers       = _obj => R.merge(_obj, { offers: _setPrice(_obj.details[9]) });
              const setCategory     = R.join(' > ');
              const setCategorys    = _obj => R.merge(_obj, { item_categorys: setCategory(_obj.categorys) });
              const _setCategoryId  = R.compose(
                R.last, R.filter(c => c !== '')
              , R.split('/'), url => std.parse_url(url).pathname, R.last
              );
              const setCategoryId   
                = _obj => R.merge(_obj, { item_categoryid: _setCategoryId(_obj.categoryUrls) });
              const _setDate        = R.compose(R.replace(/（.）/g, ' '), R.replace(/\./g, '/'));
              const setBidStopTime  = _obj => R.merge(_obj, { bidStopTime: _setDate(_obj.details[3]) });
              const setHifn       = str  => R.isNil(str) ? '-' : str;
              const setShipPrice  = _obj => R.merge(_obj, { ship_price: setHifn(_obj.ship_price) });
              const setShipBuyNow = _obj => R.merge(_obj, { ship_buynow: setHifn(_obj.ship_buynow) });
              const setItems        = objs => ({ url: options.url, title: obj.title, item:  objs });
              return results        = R.compose(
                setItems
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
              , R.filter(_obj => !!_obj.guid__)
              , R.map(setAuctionId)
              , R.map(setSize)
              , R.map(setImage)
              , R.filter(R.is(Object))
              //, R.tap(log.trace.bind(this))
              )(obj.item);
            })
            //.log(msg => log.trace(Yahoo.displayName, msg))
            //.debug(msg => log.debug(Yahoo.displayName, msg))
            .error(msg => log.warn(Yahoo.displayName, msg))
            .done(()  => resolve(results));
        });
    }
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

  getClosedMerchant(url, pages) {
    return this.request('fetch/closedmerchant', { url, pages });
  }
  
  getClosedSellers(url, pages) {
    return this.request('fetch/closedsellers', { url, pages });
  }
  
  getHtml(url) {
    return this.request('fetch/html', { url });
  }
  
  getImage(id, url) {
    return this.request('fetch/file', { url, id, headers: { encoding: null } });
  }

  putImage(name, buffer) {
    return this.request('write/file', { name, buffer });
  }

  writeImages(images) {
    const promises    = R.map(this.putImage.bind(this));
    const observables = objs => forkJoin(promises(objs));
    return observables(images);
  }

  fetchImage({ guid__, images }) {
    const getImage    = R.curry(this.getImage.bind(this))(guid__);
    const promises    = R.map(obj => getImage(obj));
    const observable  = forkJoin(promises(images));
    return observable;
  }

  fetchImages({ items }) {
    const toFile    = obj => this.putImage(obj.name, obj.body);
    const toFiles   = R.map(toFile);
    const putFiles  = forkJoin(toFiles);
    const getImage  = R.map(obj => this.fetchImage(obj));
    const getImages = objs => forkJoin(getImage(objs));
    const fromItems = of(items);
    return fromItems.pipe(
      flatMap(getImages)
    , tap(log.trace)
    //, map(R.flatten)
    //, flatMap(putFiles)
    );
  }

  fetchClosedMerchant({ url, pages }) {
    if(!pages) pages = 1;
    const fetchClosed = from(this.getClosedMerchant(url, pages));
    return fetchClosed.pipe(
      flatMap(this.fetchMarchant.bind(this))
    );
  }

  fetchClosedSellers({ url, pages }) {
    if(!pages) pages = 1;
    const fetchClosed = from(this.getClosedSellers(url, pages));
    return fetchClosed.pipe(
      flatMap(this.fetchMarchant.bind(this))
    );
  }

  fetchHtml({ url }) {
    const observable = from(this.getHtml(url));
    return observable;
  }

  fetchMarchant(note) {
    const setUrl     = obj => {
      const api = std.parse_url(searchurl);
      api.searchParams.append('p', obj.title);
      return api.href;
    };
    const isItem      = obj => !!obj.title;
    const setUrls     = R.compose(R.map(setUrl), R.filter(isItem));
    const setMarket   = (item, objs) => {
      const _isSeller = _obj  => 
        R.find(_item => item.title === _item.title && item.seller === _item.seller)(_obj.item);
      const isSeller  = _obj  => _obj && _obj.item && _obj.item.length > 0 ? _isSeller(_obj) : false;
      const isSales   = _objs => R.filter(_obj => isSeller(_obj), _objs);
      const getSales  = _objs => _objs.length > 0
        ? { market: _objs[0].item[0].price, sale: _objs[0].item.length } : { market: '-', sale: 0 };
      const setSale   = _obj  => R.merge(item, _obj);
      return R.compose(setSale, getSales, isSales)(objs);
    };
    const setPerformance = (items, obj) => {
      const isSeller  = _obj  => obj.title === _obj.title && obj.seller === _obj.seller;
      const isSolds   = _objs => R.filter(_obj => isSeller(_obj), _objs);
      const getSolds  = _objs => _objs.length > 0 ? { sold: _objs.length } : { sold: 0 };
      const setSold   = item  => R.merge(obj, item);
      return R.compose(setSold, getSolds, isSolds)(items);
    };
    const setMarkets      = (items, objs) => R.map(item => setMarket(item, objs), items);
    const setPerformances = (items, objs) => R.map(obj => setPerformance(items, obj), objs);
    const setItems        = (_note, objs) => R.merge(_note, { item: objs });
    const promises        = R.map(url => this.getHtml(url));
    const observable      = urls => forkJoin(promises(urls));
    const _setMarkets     = R.curry(setMarkets)(note.item);
    const _setPerformances= R.curry(setPerformances)(note.item);
    const _setItems       = R.curry(setItems)(note);
    return observable(setUrls(note.item)).pipe(
      map(_setMarkets)
    , map(_setPerformances)
    , map(_setItems)
    );
  }

  fetchRss({ url }) {
    let _note;
    const setItems = (note, item) => R.merge(note.rss.channel, { item });
    const fetchRss = obj => from(this.getRss(obj));
    const fetchXml = obj => from(this.getXmlNote(obj.body));
    const promises = obj => R.map(this.getXmlItem.bind(this), obj.rss.channel.item);
    const fetchXmlItems = obj => forkJoin(promises(obj));
    return fetchRss(url).pipe(
      flatMap(fetchXml)
    , map(obj => _note = obj)
    , flatMap(fetchXmlItems)
    , map(objs => setItems(_note, objs))
    );
  }

  /**
   * get result of the 'Yahoo! Auth Endpoints & support types.'.
   *
   */
  getAuthSupport() {
    return request('fetch/auth/support', {});
  }

  fetchAuthSupport() {
    return from(this.getAuthSupport());
  }

  /**
   * get result of the 'Yahoo! JWKs.'.
   *
   */
  getAuthJwks() {
    return request('fetch/auth/jwls', {});
  }

  fetchAuthJwks() {
    return from(this.getAuthJwks());
  }

  /**
   * get result of the 'Yahoo! Public Keys.'.
   *
   */
  getAuthPublickeys() {
    return request('fetch/auth/publickeys', {});
  }

  fetchAuthPublicKeys() {
    return from(this.getAuthPublickeys()).pipe(
      map(obj => obj[client.keyid])
    );
  }

  /**
   * get result of the 'Yahoo! Authorization.'.
   *
   * @param query {object} - http request query strings.
   * @param auth {object} - http request auth strings.
   */
  getAccessToken(query, auth) {
    return request('fetch/accesstoken', { query, auth });
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
      if(!isSuccess) throw new Error({
          name: 'Error', message: 'Create Token Error!!'
        });
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
      if(!isSuccess) throw new Error({
        name: 'Error', message: 'Update Token Error!!'
      });
      return newToken;
    };
    return from(this.getAccessToken(query, auth)).pipe(
      map(setToken)
    );
  }

  deleteAuthToken({ code }) {
    const isSuccess = this.delToken(code);
    if(!isSuccess) throw new Error({
      name: 'Error', message: 'Delete Token Error!!'
    });
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
    return allToken();
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
  };

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
};
Yahoo.displayName = '[YHA]';
export default Yahoo;
