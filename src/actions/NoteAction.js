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
    return NoteApiClient.pagenation(page).then(notes => {
      dispatch({ type: 'note/pagenation', notes, page });
    });
  },
  select(ids) {
    return NoteApiClient.selectNotes(ids).then(() => {
      dispatch({ type: 'note/select', ids });
    });
  },
  delete(ids) {
    return NoteApiClient.deleteNotes(ids).then(note => {
      dispatch({ type: 'note/delete', note, ids });
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
