import { ReduceStore } from 'flux/utils';

export default class TradedNotesStore extends ReduceStore {
  getInitialState() {
    return { 
      notes: []
    };
  }
  
  createTrade(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj) ? Object.assign({}, obj
    , { traded: true }) : obj;
    const setItems = objs => objs.map(item =>setItem(item))
    return state.notes.map(note => note.items ? Object.assign({}, note
    , { items: setItems(note.items) }) : note );
  }

  deleteTrade(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj) ? Object.assign({}, obj
    , { traded: false }) : obj;
    const setItems = objs => objs.map(item =>setItem(item))
    return state.notes.map(note => note.items ? Object.assign({}, note
    , { items: setItems(note.items) }) : note );
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'note/fetch/traded':
        return { notes: action.notes };
      case 'trade/create':
        return Object.assign({}, state, {
          notes: this.createTrade(state, action)
        , ids:    []
        });
      case 'trade/delete':
        return Object.assign({}, state, {
          notes: this.deleteTrade(state, action)
        , ids:    []
        });
      case 'trade/rehydrate':
        return action.state;
      default: 
        return state; 
    } 
  } 
};
