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
        //std.logTrace(displayName, 'Note', note);
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
        dispatch({ type: 'notes/upload', notes });
      })
    ;
  },
  download(user) {
    return NoteApiClient.downloadNotes(user)
      .then(file => {
        dispatch({ type: 'notes/download', file });
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
