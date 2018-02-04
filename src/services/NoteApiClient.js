let notes = require('Services/data');
let starred = [1, 2, 3];

const pspid = 'NoteApiClient';

export default {
  request(response) {
    return new Promise(resolve => {
      setTimeout(() => resolve(response), 200);
    });
  },
  fetchMyNotes() {
    console.log('>>> fetchMyNotes!!');
    return this.request(this.myNotes());
  },
  fetchStarredNotes() {
    return this.request(notes.filter(note => starred.includes(note.id)));
  },
  fetchNote(id) {
    const note = notes.find(note => note.id === id);
    return this.request(
      Object.assign({ starred: starred.includes(note.id) }, note)
    );
  },
  createNote() {
    console.log('>>> createNote!!');
    const id = notes.length + 1;
    const note = { id, title: 'Untitled', body: '', user: 'MyUserName'
      , updated: this.getUpdated() };
    notes.unshift(note);
    return this.request(note);
  },
  updateNote(id, { title, body }) {
    notes = notes.map(note => note.id === id
      ? Object.assign({}, note
        , { title, body, updated: this.getUpdated() })
      : note
    );
    return this.request(null);
  },
  deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    return this.request(null);
  },
  createStar(id) {
    starred.push(id);
    return this.request(null);
  },
  deleteStar(id) {
    starred = starred.filter(noteId => noteId !== id);
    return this.request(null);
  },
  myNotes() {
    console.log('>>> myNotes!!');
    return notes.filter(note => note.user === 'MyUserName');
  },
  getUpdated() {
    const day = new Date();
    return `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()} ${day.toTimeString().split(' ')[0]}`;
  }
};
