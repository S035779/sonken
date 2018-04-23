import { dispatch }   from 'Main/dispatcher';
import NoteApiClient  from 'Services/NoteApiClient';
import std            from 'Utilities/stdutils';

const displayName = 'NoteAction';

export default {
  presetUser(user) {
    return NoteApiClient.presetUser(user)
      .then(isAuthenticated => {
        dispatch({ type: 'user/preset', user, isAuthenticated });
      })
    ;
  },
  prefetchNotes(user) {
    return NoteApiClient.prefetchNotes(user)
      .then(notes => {
        dispatch({ type: 'note/prefetch/my', notes });
      })
    ;
  },
  prefetchBided(user) {
    return NoteApiClient.prefetchBidedNotes(user)
      .then(notes => {
        dispatch({ type: 'note/prefetch/bided', notes });
      })
    ;
  },
  prefetchTraded(user) {
    return NoteApiClient.prefetchTradedNotes(user)
      .then(notes => {
        dispatch({ type: 'note/prefetch/traded', notes });
      })
    ;
  },
  fetchCategorys(user) {
    return NoteApiClient.fetchCategorys(user)
      .then(categorys => {
        dispatch({ type: 'category/fetch/my', categorys });
      })
    ;
  },
  fetchNotes(user) {
    return NoteApiClient.fetchNotes(user)
      .then(notes => {
        dispatch({ type: 'note/fetch/my', notes });
      })
    ;
  },
  fetchBided(user) {
    return NoteApiClient.fetchBidedNotes(user)
      .then(notes => {
        dispatch({ type: 'note/fetch/bided', notes });
      })
    ;
  },
  fetchTraded(user) {
    return NoteApiClient.fetchTradedNotes(user)
      .then(notes => {
        dispatch({ type: 'note/fetch/traded', notes });
      })
    ;
  },
  fetchCategory(user, id) {
    dispatch({ type: 'category/fetch' });
    return NoteApiClient.fetchCategory(user, id)
      .then(category => {
        dispatch({ type: 'category/fetch', note });
      })
    ;
  },
  createCategory(user, data) {
    return NoteApiClient.createCategory(user, data)
      .then(category => {
        dispatch({ type: 'category/create', note });
      })
    ;
  },
  updateCategory(user, id, data) {
    return NoteApiClient.updateCategory(user, id, data)
      .then(category => {
        dispatch({ type: 'category/update', id, note });
      })
    ;
  },
  deleteCategory(user, ids) {
    return NoteApiClient.deleteCategory(user, ids)
      .then(() => {
        dispatch({ type: 'category/delete', ids });
      })
    ;
  },
  //fetch(user, id) {
  //  dispatch({ type: 'note/fetch/before' });
  //  return NoteApiClient.fetchNote(user, id)
  //    .then(note => {
  //      dispatch({ type: 'note/fetch', note });
  //    })
  //  ;
  //},
  create(user, data) {
    return NoteApiClient.createNote(user, data)
      .then(note => {
        dispatch({ type: 'note/create', note });
      })
    ;
  },
  update(user, id, data) {
    return NoteApiClient.updateNote(user, id, data)
      .then(note => {
        dispatch({ type: 'note/update', id, note });
      })
    ;
  },
  pagenation(user, page) {
    return NoteApiClient.pageNote(user, page)
      .then(() => {
        dispatch({ type: 'note/pagenation', page });
      })
    ;
  },
  select(user, ids) {
    return NoteApiClient.selectNote(user, ids)
      .then(() => {
        dispatch({ type: 'note/select', ids });
      })
    ;
  },
  delete(user, ids) {
    return NoteApiClient.deleteNote(user, ids)
      .then(() => {
        dispatch({ type: 'note/delete', ids });
      })
    ;
  },
  upload(user, category, file) {
    return NoteApiClient.uploadNotes(user, category, file)
      .then(notes => {
        dispatch({ type: 'note/upload/my', notes });
      })
    ;
  },
  download(user, category) {
    return NoteApiClient.downloadNotes(user, category)
      .then(file => {
        dispatch({ type: 'note/download/my', file });
      })
    ;
  },
  createAdd(user, ids) {
    return NoteApiClient.createAdd(user, ids)
      .then(() => {
        dispatch({ type: 'add/create', ids });
      })
    ;
  },
  deleteAdd(user, ids) {
    return NoteApiClient.deleteAdd(user, ids)
      .then(() => {
        dispatch({ type: 'add/delete', ids });
      })
    ;
  },
  createDelete(user, ids) {
    return NoteApiClient.createDelete(user, ids)
      .then(() => {
        dispatch({ type: 'delete/create', ids });
      })
    ;
  },
  deleteDelete(user, ids) {
    return NoteApiClient.deleteDelete(user, ids)
      .then(() => {
        dispatch({ type: 'delete/delete', ids });
      })
    ;
  },
  createRead(user, ids) {
    return NoteApiClient.createRead(user, ids)
      .then(() => {
        dispatch({ type: 'read/create', ids });
      })
    ;
  },
  deleteRead(user, ids) {
    return NoteApiClient.deleteRead(user, ids)
      .then(() => {
        dispatch({ type: 'read/delete', ids });
      })
    ;
  },
  createStar(user, ids) {
    return NoteApiClient.createStar(user, ids)
      .then(() => {
        dispatch({ type: 'star/create', ids });
      })
    ;
  },
  deleteStar(user, ids) {
    return NoteApiClient.deleteStar(user, ids)
      .then(() => {
        dispatch({ type: 'star/delete', ids });
      })
    ;
  },
  createList(user, ids) {
    return NoteApiClient.createList(user, ids)
      .then(() => {
        dispatch({ type: 'list/create', ids });
      })
    ;
  },
  deleteList(user, ids) {
    return NoteApiClient.deleteList(user, ids)
      .then(() => {
        dispatch({ type: 'list/delete', ids });
      })
    ;
  },
  rehydrate(state) {
    dispatch({ type: 'note/rehydrate/my', state: state.dashboardStore });
  }
};
