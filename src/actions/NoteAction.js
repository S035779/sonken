import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'NoteAction';

export default {
  //prefetchNotes(data) {
  //  return NoteApiClient.prefetchNotes(data).then(notes => {
  //    dispatch({ type: 'note/prefetch/my', notes });
  //  });
  //},
  //prefetchBided(data) {
  //  return NoteApiClient.prefetchBidedNotes(data).then(notes => {
  //    dispatch({ type: 'note/prefetch/bided', notes });
  //  });
  //},
  //prefetchTraded(data) {
  //  return NoteApiClient.prefetchTradedNotes(data).then(notes => {
  //    dispatch({ type: 'note/prefetch/traded', notes });
  //  });
  //},
  fetchNotes(init) {
    return NoteApiClient.fetchNotes(init).then(notes => {
      dispatch({ type: 'note/fetch/my', init, notes });
    });
  },
  fetchBided(init) {
    return NoteApiClient.fetchBidedNotes(init).then(notes => {
      dispatch({ type: 'note/fetch/bided', init, notes });
    });
  },
  fetchTraded(init) {
    return NoteApiClient.fetchTradedNotes(init).then(notes => {
      dispatch({ type: 'note/fetch/traded', init, notes });
    });
  },
  //fetch(id) {
  //  dispatch({ type: 'note/fetch/before' });
  //  return NoteApiClient.fetchNote(id).then(note => {
  //    dispatch({ type: 'note/fetch', note });
  //  });
  //},
  create({ url, category }) {
    return NoteApiClient.createNote(
    { url, category }).then(note => {
      dispatch({ type: 'note/create', note });
    });
  },
  update(note) {
    return NoteApiClient.updateNote(note).then(() => {
      dispatch({ type: 'note/update', note });
    });
  },
  pagenation(page) {
    return NoteApiClient.pageNote(page).then(() => {
      dispatch({ type: 'note/pagenation', page });
    });
  },
  select(ids) {
    return NoteApiClient.selectNote(ids).then(() => {
      dispatch({ type: 'note/select', ids });
    });
  },
  delete(ids) {
    return NoteApiClient.deleteNote(ids).then(() => {
      dispatch({ type: 'note/delete', ids });
    });
  },
  upload(filename) {
    return NoteApiClient.uploadNotes(filename).then(notes => {
      dispatch({ type: 'note/upload', notes });
    });
  },
  download(filename) {
    return NoteApiClient.downloadNotes(filename).then(notes => {
      dispatch({ type: 'note/download', notes });
    });
  },
  createRead(ids) {
    return NoteApiClient.createRead(ids).then(() => {
      dispatch({ type: 'read/create', ids });
    });
  },
  deleteRead(ids) {
    return NoteApiClient.deleteRead(ids).then(() => {
      dispatch({ type: 'read/delete', ids });
    });
  },
  createStar(ids) {
    return NoteApiClient.createStar(ids).then(() => {
      dispatch({ type: 'star/create', ids });
    });
  },
  deleteStar(ids) {
    return NoteApiClient.deleteStar(ids).then(() => {
      dispatch({ type: 'star/delete', ids });
    });
  },
  createList(ids) {
    return NoteApiClient.createList(ids).then(() => {
      dispatch({ type: 'list/create', ids });
    });
  },
  deleteList(ids) {
    return NoteApiClient.deleteList(ids).then(() => {
      dispatch({ type: 'list/delete', ids });
    });
  },
  rehydrate(state) {
    dispatch({ type: 'note/rehydrate/my', state: state.dashboardStore });
  }
};
