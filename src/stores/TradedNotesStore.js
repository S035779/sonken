import { ReduceStore }  from 'flux/utils';
import std              from 'Utilities/stdutils';

export default class TradedNotesStore extends ReduceStore {
  getInitialState() {
    return { 
      user: ''
    , isAuthenticated: false
    , notes: []
    , page: { maxNumer: 0, number: 1, perPage: 20 }
    , selected: false
    , ids: []
    , filter: {
        endTrading: true
      , allTrading: true
      , inBidding: false
      , bidStartTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
      , bidStopTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
      }
    , file: null
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
      case 'user/preset':
        return Object.assign({}, state, {
          user:   action.user
        , isAuthenticated: action.isAuthenticated
        });
      case 'login/authenticate':
        return Object.assign({}, state, {
          isAuthenticated: action.isAuthenticated
        });
      case 'note/prefetch/traded':
        return Object.assign({}, state, {
          notes:  action.notes
        });
      case 'note/fetch/traded':
        return Object.assign({}, state, {
          notes:  action.notes
        });
      case 'bids/delete':
        return Object.assign({}, state, {
          notes: this.deleteBids(state, action)
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
      case 'trade/download':
        return Object.assign({}, state, {
          file:  action.file
        });
      case 'trade/rehydrate':
        return action.state;
      default: 
        return state; 
    } 
  } 
}
TradedNotesStore.displayName = 'TradedNotesStore';

