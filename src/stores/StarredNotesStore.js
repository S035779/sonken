import { ReduceStore } from 'flux/utils';

export default class StarredNotesStore extends ReduceStore {
  getInitialState() {
    return { 
      notes: []
    };
  }
  
  reduce(state, action) {
    switch (action.type) { 
      case 'star/rehydrate':
        return action.state;
      case 'note/fetch/starred':
        return { notes: action.notes };
      default: 
        return state; 
    } 
  } 
};
