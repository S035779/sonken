import R                from 'ramda';
import Rx               from 'rxjs/Rx';
import osmosis          from 'osmosis';
import { parseString }  from 'xml2js';
import std              from 'Utilities/stdutils';
import net              from 'Utilities/netutils';
import { logs as log }  from 'Utilities/logutils';

//Yahoo! OpenID API
const baseurl = 'https://auth.login.yahoo.co.jp/yconnect/v2/';

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
    switch(request) {
      case 'fetch/auth/support':
        return new Promise((resolve, reject) => {
          const uri = baseurl + '.well-known/openid-configuration';
          net.get2(uri, null
          , (status, header, body) => {
            const head = { request: uri, status, header };
            const res = JSON.parse(body);
            const obj = std.merge(head, { body: res });
            if(head.status !== 200) {
              this.errorAuth(obj);
              reject(new Error('Response Error!!'));
            }
            const authApi = obj.body.authorization_endpoint;
            const toknApi = obj.body.token_endpoint;
            const userApi = obj.body.userinfo_endpoint;
            const jwksApi = obj.body.jwks_uri;
            const support = obj.body.response_types_supported;
            resolve({authApi, toknApi, userApi, jwksApi, support});
          });
        });
      case 'fetch/auth/jwks':
        return new Promise((resolve, reject) => {
          const uri = baseurl + 'jwks';
          net.get2(uri, null
          , (status, header, body) => {
            const head = { request: uri, status, header };
            const res = JSON.parse(body);
            const obj = std.merge(head, { body: res });
            if(head.status !== 200) {
              this.errorAuth(obj);
              reject(new Error('Response Error!!'));
            }
            const set = obj.body.keys;
            const kids = set.map(o => ({
              keyid:       o.kid
              , modulus:   o.n
              , exponent:  o.e
            }));
            resolve(kids);
          });
        });
      case 'fetch/auth/publickeys':
        return new Promise((resolve, reject) => {
          const uri = baseurl + 'public-keys';
          net.get2(uri, null
          , (status, header, body) => {
            const head = { request: uri, status, header };
            const res = JSON.parse(body);
            const obj = std.merge(head, { body: res });
            if(head.status !== 200) {
              this.errorAuth(obj);
              reject(new Error('Response Error!!'));
            }
            const set = obj.body;
            resolve(set);
          });
        });
      case 'fetch/accesstoken':
        return new Promise((resolve, reject) => {
          const uri = baseurl + 'token'
            + '?' + std.encodeFormData(options.query);
          const Authorization = 'Basic '
            + std.atob(options.auth['client_id']
            + ':' + request['client_secret']);
          net.post2(uri, { Authorization }, null
          , (status, header, body) => {
            const head = { request: uri, status, header };
            const res = JSON.parse(body);
            const obj = std.merge(head, { body: res });
            if(head.status !== 200) {
              this.errorAuth(obj);
              reject(new Error('Response Error!!'));
            }
            const set = obj.body;
            resolve(set);
          });
        });
      case 'fetch/rss':
        return new Promise((resolve, reject) => {
          net.get2(options.url, null, (err, head, body) => {
            if(err) reject(err);
            //log.trace(Yahoo.displayName, body);
            resolve(body);
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
        return new Promise((resolve, reject) => {
          log.info(Yahoo.displayName, 'Request', '[' + options.url + ']');
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
                title:      'div.decBg04 h1 > text()'
              , categorys:  [ 'div#yjBreadcrumbs a > text()' ]
              , bids:       'td.decBg01 > b > text()'
              , buynow:     'p.decTxtBuyPrice > text()'
              , price:      'p.decTxtAucPrice > text()'
              , seller:     'div.untBody.decPwrBox div.pts01 a > text()'
              , property:   [ 'div.untBody div.pts04 th' ]
              , details:    [ 'div.untBody div.pts04 td[2] > text()[1]' ]
              })
            ]})
            .data(obj   => { 
              const setSize = _obj => R.merge(_obj, { img_BORDER: 0, img_WIDTH:  134, img_HEIGHT: 100 });
              const setImage = _obj => { 
                _obj.description.DIV.A.IMG['attr'] 
                  = R.merge({ BORDER: 0, WIDTH: 134, HEIGHT: 100 }, _obj.description.DIV.A.IMG.attr);
                return _obj;
              };
              const zipDetail = _obj => R.zip(_obj.property, _obj.details);
              const isDetail  = (str, _obj) => _obj[0] === str
              const getDetail = (str, _objs) => R.find(_obj => isDetail(str, _obj), _objs)[1];
              const _getDetail = R.curry(getDetail);
              const setDetail = (str, _obj) => R.compose(_getDetail(str), zipDetail)(_obj);
              const setAuctionId    = _obj => R.merge(_obj, {
                guid: { _: setDetail('オークションID', _obj), attr: { isPermaLink: false } }
              , guid__: setDetail('オークションID', _obj)
              , guid_isPermaLink: false
              });
              const setPubDate      = _obj => R.merge(_obj, {
                pubDate: std.formatDate(new Date(), 'YYYY/MM/DD hh:mm')
              });
              const _setPrice = _obj => R.replace(/円|,/g, '', _obj);
              const setBuyNow = _obj => _obj.buynow
                ? R.merge(_obj, { buynow: _setPrice(_obj.buynow) }) 
                : R.merge(_obj, { buynow: '-' });
              const setPrice = _obj => _obj.price
                ? R.merge(_obj, { price: _setPrice(_obj.price) }) 
                : R.merge(_obj, { price: '-' });
              const setSeller = _obj => _obj.seller
                ? R.merge(_obj, { seller: _obj.seller }) 
                : R.merge(_obj, { seller: '-' });
              const setBids = _obj => _obj.bids
                ? R.merge(_obj, { bids: _obj.bids }) 
                : R.merge(_obj, { bids: '-' });
              const setCountdown = _obj => R.merge(_obj, { countdown: '終了' });
              const setCondition = _obj => R.merge(_obj, { item_condition: setDetail('商品の状態', _obj) });
              const setCategory = R.join(' > ');
              const setCategorys = _obj => R.merge(_obj, { item_categorys: setCategory(_obj.categorys) });
              const _setDate = R.replace(/(\d+)月\s(\d+)日[\s\S]*(\d+)時\s(\d+)分/, '$1/$2 $3:$4');
              const setBidStopTime  = _obj => {
                const today = new Date();
                const yyyy = today.getFullYear();
                const _date = _setDate(setDetail('終了日時', _obj));
                const next = Date.parse(yyyy     + '/' + _date);
                const past = Date.parse(yyyy -1  + '/' + _date);
                const date = Date.now() < next ? past : next;
                return R.merge(_obj, { bidStopTime: std.formatDate(new Date(date), 'YYYY/MM/DD hh:mm')});
              };
              const setItems = objs => ({ url: options.url, title: obj.title, item:  objs });
              return results = R.compose(
                setItems
              //, R.tap(log.trace.bind(this))
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
              )(obj.item);
            })
            //.log(msg    => log.trace(Yahoo.displayName, msg))
            //.debug(msg  => log.debug(Yahoo.displayName, msg))
            .error(msg  => log.warn(Yahoo.displayName, msg))
            .done(()    => {
              //console.log(results);
              return resolve(results);
            });
        });
      case 'fetch/closedsellers':
        return new Promise((resolve, reject) => {
          log.info(Yahoo.displayName, 'Request', '[' + options.url + ']');
          let results;
          osmosis.get(options.url)
            .set({ title: 'title', item: [ osmosis
              .find('body > div.maincol')
              .filter('tr[2] > td > small > a')
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
              , title:      'div.decBg04 h1 > text()'
              , categorys:  [ 'div#yjBreadcrumbs a > text()' ]
              , bids:       'td.decBg01 > b > text()'
              , buynow:     'p.decTxtBuyPrice > text()'
              , price:      'p.decTxtAucPrice > text()'
              , seller:     'div.untBody.decPwrBox div.pts01 a > text()'
              , property:   [ 'div.untBody div.pts04 th' ]
              , details:    [ 'div.untBody div.pts04 td[2] > text()[1]' ]
              })
            ]})
            .data(obj => {
              const setSize = _obj => R.merge(_obj, { img_BORDER: 0, img_WIDTH:  134, img_HEIGHT: 100 });
              const setImage = _obj => { 
                _obj.description.DIV['A']
                  = R.merge({ attr: { HREF: _obj.attr_HREF } }, _obj.description.DIV.A);
                _obj.description.DIV.A.IMG['attr'] 
                  = R.merge({ BORDER: 0, WIDTH: 134, HEIGHT: 100 }, _obj.description.DIV.A.IMG.attr);
                return _obj;
              };
              const zipDetail = _obj => R.zip(_obj.property, _obj.details);
              const isDetail  = (str, _obj) => _obj[0] === str
              const getDetail = (str, _objs) => R.find(_obj => isDetail(str, _obj), _objs)[1];
              const _getDetail = R.curry(getDetail);
              const setDetail = (str, _obj) => R.compose(_getDetail(str), zipDetail)(_obj);
              const setAuctionId    = _obj => R.merge(_obj, {
                guid: { _: setDetail('オークションID', _obj), attr: { isPermaLink: false } }
              , guid__: setDetail('オークションID', _obj)
              , guid_isPermaLink: false
              });
              const setPubDate      = _obj => R.merge(_obj, {
                pubDate: std.formatDate(new Date(), 'YYYY/MM/DD hh:mm')
              });
              const _setPrice = _obj => R.replace(/円|,/g, '', _obj);
              const setBuyNow = _obj => _obj.buynow
                ? R.merge(_obj, { buynow: _setPrice(_obj.buynow) }) 
                : R.merge(_obj, { buynow: '-' });
              const setPrice = _obj => _obj.price
                ? R.merge(_obj, { price: _setPrice(_obj.price) }) 
                : R.merge(_obj, { price: '-' });
              const setSeller = _obj => _obj.seller
                ? R.merge(_obj, { seller: _obj.seller }) 
                : R.merge(_obj, { seller: '-' });
              const setBids = _obj => _obj.bids
                ? R.merge(_obj, { bids: _obj.bids }) 
                : R.merge(_obj, { bids: '-' });
              const setCountdown = _obj => R.merge(_obj, { countdown: '終了' });
              const setCondition = _obj => R.merge(_obj, { item_condition: setDetail('商品の状態', _obj) });
              const setCategory = R.join(' > ');
              const setCategorys = _obj => R.merge(_obj, { item_categorys: setCategory(_obj.categorys) });
              const _setDate = R.replace(/(\d+)月\s(\d+)日[\s\S]*(\d+)時\s(\d+)分/, '$1/$2 $3:$4');
              const setBidStopTime  = _obj => {
                const today = new Date();
                const yyyy = today.getFullYear();
                const _date = _setDate(setDetail('終了日時', _obj));
                const next = Date.parse(yyyy     + '/' + _date);
                const past = Date.parse(yyyy -1  + '/' + _date);
                const date = Date.now() < next ? past : next;
                return R.merge(_obj, { bidStopTime: std.formatDate(new Date(date), 'YYYY/MM/DD hh:mm')});
              };
              const setItems = objs => ({ url: options.url, title: obj.title, item:  objs });
              return results = R.compose(
                setItems
              //, R.tap(log.trace.bind(this))
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
              )(obj.item);
            })
            //.log(msg    => log.trace(Yahoo.displayName, msg))
            //.debug(msg  => log.debug(Yahoo.displayName, msg))
            .error(msg  => log.warn(Yahoo.displayName, msg))
            .done(()    => {
              //console.log(results);
              return resolve(results);
            });
        });
      case 'fetch/html':
        return new Promise((resolve, reject) => {
          log.info(Yahoo.displayName, 'Request', '[' + options.url + ']');
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
                title: 'h1.ProductTitle__text > text()'
              , categorys: [ 'div#yjBreadcrumbs a > text()' ]
              , bids: 'li.Count__count.Count__count > dl > dd.Count__number > text()'
              , countdown: 'li.Count__count.Count__count--sideLine dd.Count__number > text()'
              , countunit: 'li.Count__count.Count__count--sideLine span.Count__unit > text()'
              , buynow: 'div.Price.Price--buynow > dl.Price__body > dd.Price__value > text()'
              , price: 'div.Price.Price--current > dl.Price__body > dd.Price__value > text()'
              , seller: 'dd.Seller__card > span.Seller__name > a > text()'
              , details: [ 'dd.ProductDetail__description > text()' ]
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
              const setPubDate = _obj => R.merge(_obj, {
                pubDate: std.formatDate(new Date(), 'YYYY/MM/DD hh:mm')
              });
              const _setPrice = _obj => R.replace(/円|,/g, '', _obj);
              const setBuyNow = _obj => _obj.buynow
                ? R.merge(_obj, { buynow: _setPrice(_obj.buynow) }) 
                : R.merge(_obj, { buynow: '-' });
              const setPrice = _obj => _obj.price
                ? R.merge(_obj, { price: _setPrice(_obj.price) }) 
                : R.merge(_obj, { price: '-' });
              const setSeller = _obj => _obj.seller
                ? R.merge(_obj, { seller: _obj.seller })
                : R.merge(_obj, { seller: '-' });
              const setBids = _obj => _obj.bids
                ? R.merge(_obj, { bids: _obj.bids }) 
                : R.merge(_obj, { bids: '-' });
              const setCountdown = _obj => _obj.countdown
                ? R.merge(_obj, { countdown: _obj.countdown + _obj.countunit })
                : R.merge(_obj, { countdown: '_' });
              const setCondition = _obj => R.merge(_obj, { item_condition: _obj.details[0] });
              const setCategory = R.join(' > ');
              const setCategorys = _obj => R.merge(_obj, { item_categorys: setCategory(_obj.categorys) });
              const _setDate = R.compose(R.replace(/（.）/g, ' '), R.replace(/\./g, '/'));
              const setBidStopTime = _obj => R.merge(_obj, { bidStopTime: _setDate(_obj.details[3]) });
              const setItems = objs => ({ url: options.url, title: obj.title, item:  objs });
              return results = R.compose(
                setItems
              //, R.tap(log.trace.bind(this))
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
              )(obj.item);
            })
            //.log(msg => log.trace(Yahoo.displayName, msg))
            //.debug(msg => log.debug(Yahoo.displayName, msg))
            .error(msg => log.warn(Yahoo.displayName, msg))
            .done(()  => {
              //console.log(results);
              return resolve(results);
            });
        });
    }
  }
  
  /**
   * get rss feed and parse xml.
   *
   */
  getRss(url) {
    return this.request('fetch/rss', { url });
  }

  getXmlNote(xml) {
    return this.request('parse/xml/note', { xml });
  }

  getXmlItem(xml) {
    return this.request('parse/xml/item', { xml });
  }

  _fetchRss(url) {
    return Rx.Observable.fromPromise(this.getRss(url));
  }

  _fetchXmlNote(xml) {
    return Rx.Observable.fromPromise(this.getXmlNote(xml));
  }

  forXmlItem(xml) {
    const promises =
      R.map(this.getXmlItem.bind(this), xml.rss.channel.item);
    return Rx.Observable.forkJoin(promises);
  }

  fetchRss({ url }) {
    let _note;
    const setItems = (note, item) => R.merge(note.rss.channel, { item });
    return this._fetchRss(url)
      .flatMap(obj => this._fetchXmlNote(obj))
      .map(obj => _note = obj)
      //.map(R.tap(log.trace.bind(this)))
      .flatMap(obj => this.forXmlItem(obj))
      .map(objs => setItems(_note,objs))
    ;
  }

  /**
   * search auction items and parse html.
   *
   */
  getClosedMerchant(url) {
    return this.request('fetch/closedmerchant', { url });
  }
  
  getClosedSellers(url) {
    return this.request('fetch/closedsellers', { url });
  }
  
  getHtml(url) {
    return this.request('fetch/html', { url });
  }
  
  fetchClosedMerchant({ url }) {
    return Rx.Observable.fromPromise(this.getClosedMerchant(url));
  }

  fetchClosedSellers({ url }) {
    return Rx.Observable.fromPromise(this.getClosedSellers(url));
  }

  fetchHtml({ url }) {
    return Rx.Observable.fromPromise(this.getHtml(url));
  }

  /**
   * get result of the 'Yahoo! Auth Endpoints & support types.'.
   *
   */
  getAuthSupport() {
    return request('fetch/auth/support', {});
  }

  fetchAuthSupport() {
    return Rx.Observable.fromPromise(this.getAuthSupport());
  }

  /**
   * get result of the 'Yahoo! JWKs.'.
   *
   */
  getAuthJwks() {
    return request('fetch/auth/jwls', {});
  }

  fetchAuthJwks() {
    return Rx.Observable.fromPromise(this.getAuthJwks());
  }


  /**
   * get result of the 'Yahoo! Public Keys.'.
   *
   */
  getAuthPublickeys() {
    return request('fetch/auth/publickeys', {});
  }

  fetchAuthPublicKeys() {
    return Rx.Observable.fromPromise(this.getAuthPublickeys())
      .map(obj => obj[client.keyid]);
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
    return Rx.Observable.fromPromise(this.getAccessToken(query, auth))
      .map(obj => {
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
      });
  }

  refreshAuthToken({ code }) {
    let query = new Object();
    let auth = new Object();
    query['grant_type'] = 'refresh_token';
    query['refresh_token'] = code;
    auth['client_id'] = this.access_key;
    auth['client_secret'] = this.secret_key;
    return Rx.Observable.fromPromise(this.getAccessToken(query, auth))
      .map(obj => {
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
      });
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
Yahoo.displayName = 'yahoo-api';
export default Yahoo;
