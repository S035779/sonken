import { ReduceStore } from 'flux/utils';

const pspid = 'DashboardStore';

export default class DashboardStore extends ReduceStore {
  getInitialState() {
    return { 
      notes: []
    , page: {
        maxNumer: 0
      , number: 0
      , perPage: 20
    }
    , selected: false
    , ids: []
    };
  }
  
  updateNote(state, action) {
    return state.notes.map(note =>
      action.note.id === note.id
        ? Object.assign({}, note, action.note)
        : note);
  }

  deleteNote(state, action) {
    return state.notes.filter(note =>
      !action.ids.some(id => id === note.id));
  }

  createRead(state, action) {
    return state.notes.map(note =>
      action.ids.some(id => id === note.id)
        ? Object.assign({}, note, { readed: true })
        : note);
  }

  deleteRead(state, action) {
    return state.notes.map(note =>
      action.ids.some(id => id === note.id)
        ? Object.assign({}, note, { readed: false })
        : note);
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'note/rehydrate/my':
        return    action.state;
      case 'note/fetch/my':
        return Object.assign({}, state, {
          notes:  action.notes
        });
      case 'note/create':
        return Object.assign({}, state, {
          notes:  [action.note, ...state.notes]
        });
      case 'note/update': 
        return Object.assign({}, state, {
          notes:  this.updateNote(state, action)
        });
      case 'note/pagenation':
        return Object.assign({}, state, {
          notes:  action.notes 
        , page:   action.page
        });
      case 'note/select':
        return Object.assign({}, state, {
          ids:    action.ids
        });
      case 'note/delete':
        return Object.assign({}, state, {
          notes:  this.deleteNote(state, action)
        , ids:    []
        });
      case 'star/create/read':
        return Object.assign({}, state, {
          notes: this.createRead(state, action)
        , ids:    []
        });
      case 'star/delete/read':
        return Object.assign({}, state, {
          notes: this.deleteRead(state, action)
        , ids:    []
        });
      default: 
        return state; 
    } 
  } 
};
