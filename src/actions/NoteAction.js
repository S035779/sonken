import { dispatch }   from 'Main/dispatcher';
import NoteApiClient  from 'Services/NoteApiClient';

export default {
  presetUser(user) {
    return NoteApiClient.presetUser(user).then(isAuthenticated => {
        dispatch({ type: 'user/preset', user, isAuthenticated });
      });
  },
  prefetchNotes(user, category, skip, limit) {
    return NoteApiClient.prefetchNotes(user, category, skip, limit).then(notes => {
        dispatch({ type: 'note/prefetch/my', notes });
      });
  },
  prefetchCategorys(user, category, skip, limit) {
    return NoteApiClient.prefetchCategorys(user, category, skip, limit).then(categorys => {
        dispatch({ type: 'category/prefetch/my', categorys });
      });
  },
//  prefetchBided(user, skip, limit) {
//    return NoteApiClient.prefetchBidedNotes(user, skip, limit).then(notes => {
//        dispatch({ type: 'note/prefetch/bided', notes });
//      });
//  },
//  prefetchTraded(user, skip, limit) {
//    return NoteApiClient.prefetchTradedNotes(user, skip, limit).then(notes => {
//        dispatch({ type: 'note/prefetch/traded', notes });
//      });
//  },
  fetchCategorys(user, category, skip, limit) {
    return NoteApiClient.fetchCategorys(user, category, skip, limit).then(categorys => {
        dispatch({ type: 'category/fetch/my', categorys });
      });
  },
  fetchNotes(user, category, skip, limit) {
    return NoteApiClient.fetchNotes(user, category, skip, limit).then(notes => {
        dispatch({ type: 'note/fetch/my', notes });
      });
  },
//  fetchBided(user, skip, limit, filter) {
//    return NoteApiClient.fetchBidedNotes(user, skip, limit, filter).then(notes => {
//        dispatch({ type: 'note/fetch/bided', notes });
//      });
//  },
//  fetchTraded(user, skip, limit, filter) {
//    return NoteApiClient.fetchTradedNotes(user, skip, limit, filter).then(notes => {
//        dispatch({ type: 'note/fetch/traded', notes });
//      });
//  },
  fetchCategory(user, id) {
    return NoteApiClient.fetchCategory(user, id).then(category => {
        dispatch({ type: 'category/fetch', category });
      });
  },
  createCategory(user, data) {
    return NoteApiClient.createCategory(user, data).then(category => {
        dispatch({ type: 'category/create', category });
      });
  },
  updateCategory(user, id, data) {
    return NoteApiClient.updateCategory(user, id, data).then(category => {
        dispatch({ type: 'category/update', id, category });
      });
  },
  deleteCategory(user, ids) {
    return NoteApiClient.deleteCategory(user, ids).then(() => {
        dispatch({ type: 'category/delete', ids });
      });
  },
  fetch(user, id, skip, limit, filter) {
    return NoteApiClient.fetchNote(user, id, skip, limit, filter).then(note => {
        dispatch({ type: 'note/fetch', id, note });
      });
  },
  create(user, data) {
    return NoteApiClient.createNote(user, data).then(note => {
        dispatch({ type: 'note/create', note });
      });
  },
  update(user, id, data) {
    return NoteApiClient.updateNote(user, id, data).then(note => {
        dispatch({ type: 'note/update', id, note });
      });
  },
  delete(user, ids) {
    return NoteApiClient.deleteNote(user, ids).then(() => {
        dispatch({ type: 'note/delete', ids });
      });
  },
  pagenation(user, page) {
    return NoteApiClient.pageNote(user, page).then(() => {
        dispatch({ type: 'note/pagenation', page });
      });
  },
  select(user, ids) {
    return NoteApiClient.selectNote(user, ids).then(() => {
        dispatch({ type: 'note/select', ids });
      });
  },
  filter(user, filter) {
    return NoteApiClient.filterNote(user, filter).then(() => {
        dispatch({ type: 'note/filter', filter });
      });
  },
  upload(user, category, file, subcategory) {
    return NoteApiClient.uploadNotes(user, category, file, subcategory).then(notes => {
        dispatch({ type: 'note/upload/my', notes });
      });
  },
  download(user, category, type) {
    return NoteApiClient.downloadNotes(user, category, type).then(file => {
        dispatch({ type: 'note/download/my', file });
      });
  },
  //downloadItems(user, category, ids, filter, type) {
  //  return NoteApiClient.downloadItems(user, category, ids, filter, type).then(file => {
  //      dispatch({ type: 'note/download/items', file });
  //    });
  //},
  //downloadImages(user, id, filter) {
  //  return NoteApiClient.downloadImages(user, id, filter).then(images => {
  //      dispatch({ type: 'note/download/images', images });
  //    });
  //},
  createAdd(user, ids) {
    return NoteApiClient.createAdd(user, ids).then(() => {
        dispatch({ type: 'add/create', ids });
      });
  },
  fetchJobs(params) {
    return NoteApiClient.fetchJobs(params).then(jobs=> {
      dispatch({ type: 'jobs/fetch', jobs});
    });
  },
  createJob(operation, params) {
    return NoteApiClient.createJob(operation, params).then(file => {
      dispatch({ type: 'job/create', file });
    });
  },
  deleteCache() {
    dispatch({ type: 'job/create', file: null, signedlink: '' });
  },
  deleteAdd(user, ids) {
    return NoteApiClient.deleteAdd(user, ids).then(() => {
        dispatch({ type: 'add/delete', ids });
      });
  },
  createDelete(user, ids) {
    return NoteApiClient.createDelete(user, ids).then(() => {
        dispatch({ type: 'delete/create', ids });
      });
  },
  deleteDelete(user, ids) {
    return NoteApiClient.deleteDelete(user, ids).then(() => {
        dispatch({ type: 'delete/delete', ids });
      });
  },
  createRead(user, ids) {
    return NoteApiClient.createRead(user, ids).then(() => {
        dispatch({ type: 'read/create', ids });
      });
  },
  deleteRead(user, ids) {
    return NoteApiClient.deleteRead(user, ids).then(() => {
        dispatch({ type: 'read/delete', ids });
      });
  },
  createStar(user, ids) {
    return NoteApiClient.createStar(user, ids).then(() => {
        dispatch({ type: 'star/create', ids });
      });
  },
  deleteStar(user, ids) {
    return NoteApiClient.deleteStar(user, ids).then(() => {
        dispatch({ type: 'star/delete', ids });
      });
  },
  createList(user, ids) {
    return NoteApiClient.createList(user, ids).then(() => {
        dispatch({ type: 'list/create', ids });
      });
  },
  deleteList(user, ids) {
    return NoteApiClient.deleteList(user, ids).then(() => {
        dispatch({ type: 'list/delete', ids });
      });
  },
  rehydrate(state) {
    dispatch({ type: 'note/rehydrate/my', state: state.dashboardStore });
  }
};
