import { ReduceStore } from 'flux/utils';

const pspid = 'NoteStore';

export default class NoteStore extends ReduceStore {
  getInitialState() {
    return { 
      note: null
    };
  }
  
  createRead(state, action) {
    return state.id === action.readIds
      ? { note: Object.assign({}, state.note, {starred: true}) }
      : state;
  }

  deleteRead(state, action) {
    return state.id === action.readIds
      ? { note: Object.assign({}, state.note, {starred: false}) }
      : state;
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'note/rehydrate':
        return action.state;
      case 'note/fetch/before':
        return { note: null };
      case 'note/fetch':
        return { note: action.note };
      case 'star/create/read':
        return this.createRead(state, action);
      case 'star/delete/read':
        return this.deleteRead(state, action);
      default: 
        return state; 
    } 
  } 
};
