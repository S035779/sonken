import { ReduceStore } from 'flux/utils';

export default class BidedNotesStore extends ReduceStore {
  getInitialState() {
    return { 
      notes: []
    };
  }
  
  createBids(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj)? Object.assign({}, obj
    , { bided: true }) : obj;
    const setItems = objs => objs.map(item =>setItem(item))
    return state.notes.map(note => note.items ? Object.assign({}, note
    , { items: setItems(note.items) }) : note );
  }

  deleteBids(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj) ? Object.assign({}, obj
    , { bided: false }) : obj;
    const setItems = objs => objs.map(item =>setItem(item))
    return state.notes.map(note => note.items ? Object.assign({}, note
    , { items: setItems(note.items) }) : note );
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'note/fetch/bided':
        return { notes: action.notes };
      case 'bids/create':
        return Object.assign({}, state, {
          notes: this.createBids(state, action)
        , ids:    []
        });
      case 'bids/delete':
        return Object.assign({}, state, {
          notes: this.deleteBids(state, action)
        , ids:    []
        });
      case 'bids/rehydrate':
        return action.state;
      default: 
        return state; 
    } 
  } 
};
