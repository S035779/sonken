import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'NoteAction';

export default {
  rehydrate(state) {
    dispatch({ type: 'note/rehydrate', state: state.noteStore });
    dispatch({ type: 'note/rehydrate/my', state: state.dashboardStore });
  },
  fetchNotes() {
    return NoteApiClient.fetchNotes().then(notes => {
      dispatch({ type: 'note/fetch/my', notes });
    });
  },
  fetchMyNotes() {
    return NoteApiClient.fetchMyNotes().then(notes => {
      dispatch({ type: 'note/fetch/my', notes });
    });
  },
  fetchStarred() {
    return NoteApiClient.fetchStarredNotes().then(notes => {
      dispatch({ type: 'note/fetch/starred', notes });
    });
  },
  fetch(id) {
    dispatch({ type: 'note/fetch/before' });
    return NoteApiClient.fetchNote(id).then(note => {
      dispatch({ type: 'note/fetch', note });
    });
  },
  create({ url, category }) {
    return NoteApiClient
    .createNote({ url, category })
    .then(note => {
      dispatch({ type: 'note/create', note });
    });
  },
  update(id, { title, asin, price, bidsprice, body }) {
    return NoteApiClient.updateNote(id
      , { title, asin, price, bidsprice, body })
    .then(() => {
      dispatch({ type: 'note/update', id
        , note: { title, asin, price, bidsprice, body } });
    });
  },
  delete(ids) {
    return NoteApiClient.deleteNotes(ids).then(() => {
      dispatch({ type: 'note/delete', ids });
    });
  },
  read(ids) {
    return NoteApiClient.readNotes(ids).then(() => {
      dispatch({ type: 'note/select', ids });
    });
  },
  select(ids) {
    return NoteApiClient.selectNotes(ids).then(() => {
      dispatch({ type: 'note/select', ids });
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
  page(pages, page) {
    return NoteApiClient.pagenation(pages, page).then(notes => {
      dispatch({ type: 'note/pagenation', notes, pages, page });
    });
  }
};
