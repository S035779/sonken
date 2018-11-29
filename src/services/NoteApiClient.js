import * as R from 'ramda';
//import net    from 'Utilities/netutils';
import xhr    from 'Utilities/xhrutils';

const api = process.env.API_URL;

export default {
  request(request, options) {
    switch(request) {
      case 'preset/user':
        return new Promise(resolve => setTimeout(() => resolve(options.user !== ''), 200));
      //case 'prefetch/notes':
      //  return net.promise(api + '/notes',    R.merge({ method: 'GET', type: 'NV', accept: 'JSON' }, options));
      //case 'prefetch/categorys':
      //  return net.promise(api +'/categorys', R.merge({ method: 'GET', type: 'NV', accept: 'JSON' }, options));
      //case 'prefetch/traded':
      //  return net.promise(api + '/traded',   R.merge({ method: 'GET', type: 'NV', accept: 'JSON' }, options));
      //case 'prefetch/bided':
      //  return net.promise(api + '/bided',    R.merge({ method: 'GET', type: 'NV', accept: 'JSON' }, options));
      //case 'fetch/categorys':
      //  return new Promise((resolve, reject) => xhr.getJSON(    api + '/categorys', options, resolve, reject));
      case 'fetch/notes':
        return new Promise((resolve, reject) => xhr.getJSON(    api + '/notes',     options, resolve, reject));
      case 'fetch/traded':
        return new Promise((resolve, reject) => xhr.getJSON(    api + '/traded',    options, resolve, reject));
      case 'fetch/bided':
        return new Promise((resolve, reject) => xhr.getJSON(    api + '/bided',     options, resolve, reject));
      case 'fetch/category':
        return new Promise((resolve, reject) => xhr.getJSON(    api + '/category',  options, resolve, reject));
      case 'create/category':
        return new Promise((resolve, reject) => xhr.putJSON(    api + '/category',  options, resolve, reject));
      case 'update/category':
        return new Promise((resolve, reject) => xhr.postJSON(   api + '/category',  options, resolve, reject));
      case 'delete/category':
        return new Promise((resolve, reject) => xhr.deleteJSON( api + '/category',  options, resolve, reject));
      case 'fetch/note':
        return new Promise((resolve, reject) => xhr.getJSON(    api + '/note',      options, resolve, reject));
      case 'create/note':
        return new Promise((resolve, reject) => xhr.putJSON(    api + '/note',      options, resolve, reject));
      case 'update/note':
        return new Promise((resolve, reject) => xhr.postJSON(   api + '/note',      options, resolve, reject));
      case 'delete/note':
        return new Promise((resolve, reject) => xhr.deleteJSON( api + '/note',      options, resolve, reject));
      case 'create/added':
        return new Promise((resolve, reject) => xhr.putJSON(    api + '/added',     options, resolve, reject));
      case 'delete/added':
        return new Promise((resolve, reject) => xhr.deleteJSON( api + '/added',     options, resolve, reject));
      case 'create/deleted':
        return new Promise((resolve, reject) => xhr.putJSON(    api + '/deleted',   options, resolve, reject));
      case 'delete/deleted':
        return new Promise((resolve, reject) => xhr.deleteJSON( api + '/deleted',   options, resolve, reject));
      case 'create/readed':
        return new Promise((resolve, reject) => xhr.putJSON(    api + '/readed',    options, resolve, reject));
      case 'delete/readed':
        return new Promise((resolve, reject) => xhr.deleteJSON( api + '/readed',    options, resolve, reject));
      case 'create/traded':
        return new Promise((resolve, reject) => xhr.putJSON(    api + '/traded',    options, resolve, reject));
      case 'delete/traded':
        return new Promise((resolve, reject) => xhr.deleteJSON( api + '/traded',    options, resolve, reject));
      case 'create/bided':
        return new Promise((resolve, reject) => xhr.putJSON(    api + '/bided',     options, resolve, reject));
      case 'delete/bided':
        return new Promise((resolve, reject) => xhr.deleteJSON( api + '/bided',     options, resolve, reject));
      case 'create/starred':
        return new Promise((resolve, reject) => xhr.putJSON(    api + '/starred',   options, resolve, reject));
      case 'delete/starred':
        return new Promise((resolve, reject) => xhr.deleteJSON( api + '/starred',   options, resolve, reject));
      case 'create/listed':
        return new Promise((resolve, reject) => xhr.putJSON(    api + '/listed',    options, resolve, reject));
      case 'delete/listed':
        return new Promise((resolve, reject) => xhr.deleteJSON( api + '/listed',    options, resolve, reject));
      case 'upload/notes':
        return new Promise((resolve, reject) => xhr.putFile(    api + '/notes',      options, resolve, reject));
      case 'download/notes':
        return new Promise((resolve, reject) => xhr.postFile(    api + '/notes',      options, resolve, reject));
      //case 'download/items':
      //  return new Promise((resolve, reject) => xhr.postFile(   api + '/file',      options, resolve, reject));
      //case 'download/images':
      //  return new Promise((resolve, reject) => xhr.postFile(   api + '/image',     options, resolve, reject));
      case 'download/traded':
        return new Promise((resolve, reject) => xhr.postFile(   api + '/traded',    options, resolve, reject));
      case 'download/bided':
        return new Promise((resolve, reject) => xhr.postFile(   api + '/bided',     options, resolve, reject));
      case 'create/job':
        return new Promise((resolve, reject) => xhr.postFile(   api + '/worker',    options, resolve, reject));
      case 'fetch/jobs':
        return new Promise((resolve, reject) => xhr.getJSON(    api + '/worker',    options, resolve, reject));
      case 'pagenation/note':
      case 'pagenation/traded':
      case 'pagenation/bided':
      case 'select/note':
      case 'select/traded':
      case 'select/bided':
      case 'filter/note':
      case 'filter/traded':
      case 'filter/bided':
        return new Promise(resolve => setTimeout(() => resolve(options), 200));
    }
  },

  /*
   * Preset & Prefetch
   */
  presetUser(user) {
    return this.request('preset/user', { user });
  },
  //prefetchNotes(user, category, skip, limit) {
  //  return this.request('prefetch/notes', { user, category, skip, limit });
  //},
  //prefetchCategorys(user, category, skip, limit) {
  //  return this.request('prefetch/categorys', { user, category, skip, limit });
  //},
  //prefetchTradedNotes(user, skip, limit) {
  //  return this.request('prefetch/traded', { user, skip, limit });
  //},
  //prefetchBidedNotes(user, skip, limit) {
  //  return this.request('prefetch/bided', { user, skip, limit });
  //},

  /*
   * Notes
   */
  fetchNotes(user, category, skip, limit) {
    return this.request('fetch/notes', { user, category, skip, limit });
  },
  fetchTradedNotes(user, skip, limit, filter) {
    const params = filter ? R.merge({ user, skip, limit }, filter) : { user, skip, limit };
    return this.request('fetch/traded', params);
  },
  fetchBidedNotes(user, skip, limit, filter) {
    const params = filter ? R.merge({ user, skip, limit }, filter) : { user, skip, limit };
    return this.request('fetch/bided', params);
  },

  /*
   * Categorys
   */
  //fetchCategorys(user, category, skip, limit) {
  //  return this.request('fetch/categorys', { user, category, skip, limit });
  //},

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
  fetchNote(user, id, skip, limit, filter) {
    const params = filter ? R.merge({ user, id, skip, limit }, filter) : { user, id, skip, limit };
    return this.request('fetch/note', params);
  },
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
  filterNote(user, filter) {
    return this.request('filter/note', { user, filter });
  },
  uploadNotes(user, category, file, subcategory) {
    const name = user + '_' + category + '_' + subcategory;
    const ext  = file.name.match(/(.*)(?:\.([^.]+$))/);
    const type = file.type ? file.type : ext[2];
    const content = file;
    return this.request('upload/notes', { name, type, content });
  },
  downloadNotes(user, category, type) {
    return this.request('download/notes', { user, category, type });
  },
  //downloadItems(user, category, ids, filter, type) {
  //  const setIds = _ids => ({ ids: Array.isArray(_ids) ? _ids : [_ids] });
  //  let params = { user, category, type };
  //  params = ids    ? R.merge(params, setIds(ids))  : params;
  //  params = filter ? R.merge(params, filter)       : params;
  //  return this.request('download/items', params);
  //},
  //downloadImages(user, id, filter) {
  //  const params = filter ? R.merge({ user, id }, filter) : { user, id };
  //  return this.request('download/images', params);
  //},

  /*
   *  jobQueue
   */
  createJob(operation, params) {
    const { ids, user, category, type, filter } = params;
    return this.request('create/job', { operation, ids, user, category, type, filter });
  },
  fetchJobs(params) {
    return this.request('fetch/jobs', params);
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
    return this.request('pagenation/traded', { user, maxNumber, number, perPage });
  },
  selectTrade(user, ids) {
    return this.request('select/traded', { user, ids });
  },
  filterTrade(user, { endTrading, allTrading, inBidding, bidStartTime, bidStopTime }) {
    const filter = { endTrading, allTrading, inBidding, bidStartTime, bidStopTime };
    return this.request('filter/traded', { user, filter });
  },
  downloadTrade(user, filter) {
    const params = filter ? R.merge({ user }, filter) : { user };
    return this.request('download/traded', params);
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
  downloadBids(user, filter) {
    const params = filter ? R.merge({ user }, filter) : { user };
    return this.request('download/bided', params);
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
