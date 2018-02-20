import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'NoteAction';

export default {
  rehydrate(state) {
    dispatch({ type: 'note/rehydrate', state: state.noteStore });
    dispatch({ type: 'note/rehydrate/my', state: state.dashboardStore });
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
  update(id, { title, body }) {
    return NoteApiClient.updateNote(id, { title, body })
    .then(() => {
      dispatch({ type: 'note/update', id, note: { title, body } });
    });
  },
  delete(id) {
    return NoteApiClient.deleteNote(id)
    .then(() => {
      dispatch({ type: 'note/delete', id });
    });
  }
};
