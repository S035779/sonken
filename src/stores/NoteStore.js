import { ReduceStore } from 'flux/utils';

const pspid = 'NoteStore';

export default class NoteStore extends ReduceStore {
  getInitialState() {
    return { 
      note: null
    };
  }
  
  reduce(state, action) {
    switch (action.type) { 
      case 'note/rehydrate':
        return action.state;
      case 'note/fetch/before':
        return { note: null };
      case 'note/fetch':
        return { note: action.note };
      default: 
        return state; 
    } 
  } 
};
