import { ReduceStore } from 'flux/utils';

export default class TradedNotesStore extends ReduceStore {
  getInitialState() {
    return { 
      user: ''
      , notes: []
      , page: {
        maxNumer: 0
      , number:   0
      , perPage:  20
      }
    , selected: false
    , ids:      []
      , filter: {
        endBidding:   true
      , allBidding:   true
      , inBidding:    false
      , bidStartTime: 0
      , bidStopTime:  0
      }
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

  deleteItem(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const delItems = objs => objs.filter(item => !isItem(item));
    return state.notes.map(note => note.items ? Object.assign({}, note
    , { items: delItems(note.items) }) : note );
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'note/prefetch/traded':
        return Object.assign({}, state, {
          user:   action.user
        , notes:  action.notes
        });
      case 'note/fetch/traded':
        return Object.assign({}, state, {
          notes:  action.notes
        });
      case 'item/delete/traded':
        return Object.assign({}, state, {
          notes:  this.deleteItem(state, action)
        , ids:    []
        });
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
      case 'trade/pagenation':
        return Object.assign({}, state, {
          page:   action.page
        });
      case 'trade/select':
        return Object.assign({}, state, {
          ids:    action.ids
        });
      case 'trade/filter':
        return Object.assign({}, state, {
          filter: action.filter
        });
      case 'trade/rehydrate':
        return action.state;
      default: 
        return state; 
    } 
  } 
};
