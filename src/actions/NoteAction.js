import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'NoteAction';

export default {
  rehydrate(state) {
    dispatch({ type: 'note/rehydrate/my', state: state.dashboardStore });
  },
  prefetchNotes() {
    return NoteApiClient.prefetchNotes().then(notes => {
      dispatch({ type: 'note/prefetch/my', notes });
    });
  },
  prefetchBided() {
    return NoteApiClient.prefetchBidedNotes().then(notes => {
      dispatch({ type: 'note/prefetch/bided', notes });
    });
  },
  prefetchTraded() {
    return NoteApiClient.prefetchTradedNotes().then(notes => {
      dispatch({ type: 'note/prefetch/traded', notes });
    });
  },
  fetchNotes() {
    return NoteApiClient.fetchNotes().then(notes => {
      dispatch({ type: 'note/fetch/my', notes });
    });
  },
  fetchBided() {
    return NoteApiClient.fetchBidedNotes().then(notes => {
      dispatch({ type: 'note/fetch/bided', notes });
    });
  },
  fetchTraded() {
    return NoteApiClient.fetchTradedNotes().then(notes => {
      dispatch({ type: 'note/fetch/traded', notes });
    });
  },
  fetch(id) {
    dispatch({ type: 'note/fetch/before' });
    return NoteApiClient.fetchNote(id).then(note => {
      dispatch({ type: 'note/fetch', note });
    });
  },
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
    return NoteApiClient.pagenation(page).then(() => {
      dispatch({ type: 'note/pagenation', page });
    });
  },
  select(ids) {
    return NoteApiClient.selectNotes(ids).then(() => {
      dispatch({ type: 'note/select', ids });
    });
  },
  delete(ids) {
    return NoteApiClient.deleteNotes(ids).then(() => {
      dispatch({ type: 'note/delete', ids });
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
  deleteItem(ids) {
    return NoteApiClient.deleteItem(ids).then(() => {
      dispatch({ type: 'item/delete', ids });
    });
  },
  filterItem(filter) {
    return NoteApiClient.filterItem(filter).then(() => {
      dispatch({ type: 'item/filter', filter });
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
  upload(filename) {
    return NoteApiClient.uploadNotes(filename).then(notes => {
      dispatch({ type: 'note/upload', notes });
    });
  },
  download(filename) {
    return NoteApiClient.downloadNotes(filename).then(notes => {
      dispatch({ type: 'note/download', notes });
    });
  }
};
