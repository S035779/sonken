import { ReduceStore }  from 'flux/utils';
import std              from 'Utilities/stdutils';

export default class BidedNotesStore extends ReduceStore {
  getInitialState() {
    return { 
      user: ''
      , isAuthenticated: false
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
      , bidStartTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
      , bidStopTime:  std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
      }
    , file: null
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

  //deleteItem(state, action) {
  //  const isItem = obj => action.ids.some(id => id === obj.guid._);
  //  const delItems = objs => objs.filter(item => !isItem(item));
  //  return state.notes.map(note => note.items ? Object.assign({}, note
  //  , { items: delItems(note.items) }) : note );
  //}

  deleteList(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj)
      ? Object.assign({}, obj, { listed: false }) : obj;
    const setItems = objs => objs.map(setItem)
    const setNote = obj => obj.items
      ? Object.assign({}, obj, { items: setItems(obj.items) }) : obj; 
    return state.notes.map(setNote);
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'user/preset':
        return Object.assign({}, state, {
          user: action.user
        , isAuthenticated: action.isAuthenticated
        });
      case 'login/authenticate':
        return Object.assign({}, state, {
          isAuthenticated: action.isAuthenticated
        });
      case 'note/prefetch/bided':
        return Object.assign({}, state, {
          notes: action.notes
        });
      case 'note/fetch/bided':
        return Object.assign({}, state, {
          notes: action.notes
        });
      //case 'item/delete/bided':
      //  return Object.assign({}, state, {
      //    notes:  this.deleteItem(state, action)
      //  , ids:    []
      //  });
      case 'list/delete':
        return Object.assign({}, state, {
          notes: this.deleteList(state, action)
        , ids:    []
        });
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
      case 'bids/pagenation':
        return Object.assign({}, state, {
          page:   action.page
        });
      case 'bids/select':
        return Object.assign({}, state, {
          ids:    action.ids
        });
      case 'bids/filter':
        return Object.assign({}, state, {
          filter: action.filter
        });
      case 'bids/download':
        return Object.assign({}, state, {
          file:  action.file
        });
      case 'bids/rehydrate':
        return action.state;
      default: 
        return state; 
    } 
  } 
}
BidedNotesStore.displayName = 'BidedNotesStore';

