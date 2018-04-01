import R                from 'ramda';
import Rx               from 'rxjs/Rx';
import osmosis          from 'osmosis';
import { parseString }  from 'xml2js';
import std              from 'Utilities/stdutils';
import net              from 'Utilities/netutils';
import { logs as log }  from 'Utilities/logutils';

const base_url = 'https://auctions.yahoo.co.jp';

export default class HtmlParser {
  constructor() {
  }

  static of() {
    return new HtmlParser();
  }

  request(request, options) {
    switch(request) {
      case 'fetch/rss':
        return new Promise((resolve, reject) => {
          net.get2(options.url
          , null, (err, head, body) => {
            if(err) reject(err);
            resolve(body);
          });
        });
      case 'parse/xml/note':
        return new Promise((resolve, reject) => {
          parseString(options.xml
          , { trim: true, explicitArray: false }
          , (err, data) => {
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
          parseString(options.xml.description
            , { trim: true, explicitArray: false, strict: false }
            , (err, data) => {
              if(err) reject(err);
              resolve(newItem(data)(options.xml.description));
            }); 
        });
      case 'fetch/html':
        return new Promise((resolve, reject) => {
          let results = [];
          osmosis
          .get(options.url)
          .set({ title: 'title' })
          .find('div#list01')
          .set({
            items: [
              osmosis.find('td.a1').set({
                url:'div.a1wrp > h3 > a@href'
              , category: [ 'p.com_slider > a' ]
              })
              .follow('div.a1wrp h3 a@href').set({
                name:     'h1.ProductTitle__text > text()'
              , seller:   'span.Seller__name > a'
              , images:
                  [ 'a.ProductImage__link.rapid-noclick-resp > img@src' ]
              , bids:     'li.Count__count.Count__count > dl '
                            + '> dd.Count__number > text()'
              , time: {
                  count:  'li.Count__count.Count__count--sideLine > dl '
                            + '> dd.Count__number > text()'
                , unit:   'li.Count__count.Count__count--sideLine > dl '
                            + '> dd.Count__number > span.Count__unit'
                }
              , price1:   'div.Price.Price--current '
                            + '> dl.Price__body > dd.Price__value > text()'
              , price2:   'div.Price.Price--buynow '
                            + '> dl.Price__body > dd.Price__value > text()'
              , detail: {
                  title:       [ 'dt.ProductDetail__title'       ]
                , description: [ 'dd.ProductDetail__description' ]
              }})
            ]
          })
          .data(obj => results.push(obj))
          .log(msg => log.debug(msg))
          .debug(msg => log.debug(msg))
          .error(reject)
          .done(resolve(results));
        });
    }
  }
  
  getHtml(url) {
    return this.request('fetch/html', { url });
  }
  
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
      .flatMap(obj => this.forXmlItem(obj))
      .map(objs => setItems(_note,objs))
      .map(R.tap(log.trace.bind(this)))
    ;
  }

  fetchContents({ url }) {
    return Rx.Observable.fromPromise(this.getHtml(url));
  }

};
