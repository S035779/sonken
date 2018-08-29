import * as R from 'ramda';
import net    from 'Utilities/netutils';
import xhr    from 'Utilities/xhrutils';

const api = process.env.API_URL;

export default {
  request(request, options) {
    switch(request) {
      case 'preset/user':
        return new Promise(resolve => {
          const isAuthenticated = options.user !== '';
          setTimeout(() => resolve(isAuthenticated), 200);
        });
      case 'prefetch/notes':
        return net.promise(api + '/notes'
        , R.merge({ method: 'GET', type: 'NV', accept: 'JSON' }, options));
      case 'prefetch/categorys':
        return net.promise(api + '/categorys'
        , R.merge({ method: 'GET', type: 'NV', accept: 'JSON' }, options));
      case 'prefetch/traded':
        return net.promise(api + '/traded'
        , R.merge({ method: 'GET', type: 'NV', accept: 'JSON' }, options));
      case 'prefetch/bided':
        return net.promise( api + '/bided'
        , R.merge({ method: 'GET', type: 'NV', accept: 'JSON' }, options));
      case 'fetch/categorys':
        return new Promise((resolve, reject) => {
          xhr.getJSON( api + '/categorys' , options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'fetch/notes':
        return new Promise((resolve, reject) => {
          xhr.getJSON(api + '/notes', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'fetch/traded':
        return new Promise((resolve, reject) => {
          xhr.getJSON(api + '/traded', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'fetch/bided':
        return new Promise((resolve, reject) => {
          xhr.getJSON(api + '/bided', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'fetch/category':
        return new Promise((resolve, reject) => {
          xhr.getJSON(api + '/category', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'create/category':
        return new Promise((resolve, reject) => {
          xhr.putJSON(api + '/category', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'update/category':
        return new Promise((resolve, reject) => {
          xhr.postJSON(api + '/category', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/category':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(api + '/category', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'create/note':
        return new Promise((resolve, reject) => {
          xhr.putJSON(api + '/note', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'update/note':
        return new Promise((resolve, reject) => {
          xhr.postJSON(api + '/note', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/note':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(api + '/note', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'create/added':
        return new Promise((resolve, reject) => {
          xhr.putJSON(api + '/added', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/added':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(api + '/added', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'create/deleted':
        return new Promise((resolve, reject) => {
          xhr.putJSON(api + '/deleted', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/deleted':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(api + '/deleted', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'create/readed':
        return new Promise((resolve, reject) => {
          xhr.putJSON(api + '/readed', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/readed':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(api + '/readed', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'create/traded':
        return new Promise((resolve, reject) => {
          xhr.putJSON(api + '/traded', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/traded':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(api + '/traded', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'create/bided':
        return new Promise((resolve, reject) => {
          xhr.putJSON(api + '/bided', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/bided':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(api + '/bided', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'create/starred':
        return new Promise((resolve, reject) => {
          xhr.putJSON(api + '/starred', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/starred':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(api + '/starred', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'create/listed':
        return new Promise((resolve, reject) => {
          xhr.putJSON(api + '/listed', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'delete/listed':
        return new Promise((resolve, reject) => {
          xhr.deleteJSON(api + '/listed', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'upload/notes':
        return new Promise((resolve, reject) => {
          xhr.putFile(api + '/file', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'download/notes':
        return new Promise((resolve, reject) => {
          xhr.getFile(api + '/file', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'download/items':
        return new Promise((resolve, reject) => {
          xhr.postFile(api + '/file', options
          , obj => { resolve(obj); }
          , err => { reject(err); }
          );
        });
      case 'pagenation/note':
      case 'pagenation/traded':
      case 'pagenation/bided':
      case 'select/note':
      case 'select/traded':
      case 'select/bided':
      case 'filter/note':
      case 'filter/traded':
      case 'filter/bided':
        return new Promise(resolve => {
          setTimeout(() => resolve(options), 200);
        });
    }
  },

  /*
   * Preset & Prefetch
   */
  presetUser(user) {
    return this.request('preset/user', { user });
  },
  prefetchNotes(user) {
    return this.request('prefetch/notes', { user });
  },
  prefetchCategorys(user) {
    return this.request('prefetch/categorys', { user });
  },
  prefetchTradedNotes(user) {
    return this.request('prefetch/traded', { user });
  },
  prefetchBidedNotes(user) {
    return this.request('prefetch/bided', { user });
  },

  /*
   * Notes
   */
  fetchNotes(user) {
    return this.request('fetch/notes', { user });
  },
  fetchTradedNotes(user) {
    return this.request('fetch/traded', { user });
  },
  fetchBidedNotes(user) {
    return this.request('fetch/bided', { user });
  },

  /*
   * Categorys
   */
  fetchCategorys(user) {
    return this.request('fetch/categorys', { user });
  },

  /*
   * Category
   */
  fetchCategory(user, id) {
    return this.request('fetch/category', { user, id });
  },
  createCategory(user, { category, subcategory }) {
    return this.request('create/category', { user, category, subcategory });
  },
  updateCategory(user, id, { category, subcategory, subcategoryId }) {
    const data = { category, subcategory, subcategoryId };
    return this.request('update/category', { user, id, data })
  },
  deleteCategory(user, ids) {
    return this.request('delete/category', { user, ids });
  },

  /*
   * Note
   */
  createNote(user, { url, category, categoryIds, title }) {
    return this.request('create/note', { user, url, category, categoryIds, title });
  },
  updateNote(user, id, { title, asin, price, bidsprice, body, categoryIds }) {
    const data = { title, asin, price, bidsprice, body, categoryIds };
    return this.request('update/note', { user, id, data });
  },
  deleteNote(user, ids) {
    return this.request('delete/note', { user, ids });
  },
  pageNote(user, { maxNumber, number, perPage }) {
    return this.request('pagenation/note', { user, maxNumber, number, perPage });
  },
  selectNote(user, ids) {
    return this.request('select/note', { user, ids });
  },
  filterNote(user, { 
    lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, aucStartTime, aucStopTime 
  }) {
    const filter = { 
      lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, aucStartTime, aucStopTime 
    };
    return this.request('filter/note', { user, filter });
  },
  uploadNotes(user, category, file) {
    const name = user + '_' + category;
    const ext  = file.name.match(/(.*)(?:\.([^.]+$))/);
    const type = file.type ? file.type : ext[2];
    const content = file;
    return this.request('upload/notes', { name, type, content });
  },
  downloadNotes(user, category) {
    return this.request('download/notes', { user, category });
  },
  downloadItems(user, ids, filter) {
    ids = Array.isArray(ids) ? ids : [ids];
    return this.request('download/items', { user, ids, filter });
  },


  /*
   *  Trade
   */
  createTrade(user, ids) {
    return this.request('create/traded', { user, ids });
  },
  deleteTrade(user, ids) {
    return this.request('delete/traded', { user, ids });
  },
  pageTrade(user, { maxNumber, number, perPage }) {
    return this.request('pagenation/traded', {
      user, maxNumber, number, perPage
    });
  },
  selectTrade(user, ids) {
    return this.request('select/traded', { user, ids });
  },
  filterTrade(user, { endTrading, allTrading, inBidding, bidStartTime, bidStopTime }) {
    const filter = { endTrading, allTrading, inBidding, bidStartTime, bidStopTime };
    return this.request('filter/traded', { user, filter });
  },

  /*
   *  Bids
   */
  createBids(user, ids) {
    return this.request('create/bided', { user, ids });
  },
  deleteBids(user, ids) {
    return this.request('delete/bided', { user, ids });
  },
  pageBids(user, { maxNumber, number, perPage }) {
    return this.request('pagenation/bided', { user, maxNumber, number, perPage });
  },
  selectBids(user, ids) {
    return this.request('select/bided', { user, ids });
  },
  filterBids(user, { endBidding, allBidding, inBidding, bidStartTime, bidStopTime }) {
    const filter = { endBidding, allBidding, inBidding, bidStartTime, bidStopTime };
    return this.request('filter/bided', { user, filter });
  },

  /*
   *  Add
   */
  createAdd(user, ids) {
    return this.request('create/added', { user, ids });
  },
  deleteAdd(user, ids) {
    return this.request('delete/added', { user, ids });
  },

  /*
   *  Delete
   */
  createDelete(user, ids) {
    return this.request('create/deleted', { user, ids });
  },
  deleteDelete(user, ids) {
    return this.request('delete/deleted', { user, ids });
  },

  /*
   *  Read
   */
  createRead(user, ids) {
    return this.request('create/readed', { user, ids });
  },
  deleteRead(user, ids) {
    return this.request('delete/readed', { user, ids });
  },

  /*
   *  Star
   */
  createStar(user, ids) {
    return this.request('create/starred', { user, ids });
  },
  deleteStar(user, ids) {
    return this.request('delete/starred', { user, ids });
  },

  /*
   *  List
   */
  createList(user, ids) {
    return this.request('create/listed', { user, ids });
  },
  deleteList(user, ids) {
    return this.request('delete/listed', { user, ids });
  }
};
