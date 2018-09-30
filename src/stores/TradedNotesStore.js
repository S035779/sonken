import { ReduceStore }  from 'flux/utils';
import * as R           from 'ramda';
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
    const isItem = obj => R.any(id => id === obj.guid._)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { traded: true }) : obj;
    const setItems = R.map(setItem)
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj;
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  deleteTrade(state, action) {
    const isItem = obj => R.any(id => id === obj.guid._)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { traded: false }) : obj;
    const setItems = R.map(setItem)
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj;
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  deleteBids(state, action) {
    const isItem = obj => R.any(id => id === obj.guid._)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { bided: false }) : obj;
    const setItems = R.map(setItem)
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'user/preset':
        return R.merge(state, { user: action.user, isAuthenticated: action.isAuthenticated });
      case 'login/authenticate':
        return R.merge(state, { isAuthenticated: action.isAuthenticated });
      case 'bids/delete':
        return R.merge(state, { notes: this.deleteBids(state, action), ids: [] });
      case 'trade/prefetch':
        return R.merge(state, { notes: action.notes });
      case 'trade/fetch':
        return R.merge(state, { notes: action.notes });
      case 'trade/create':
        return R.merge(state, { notes: this.createTrade(state, action), ids: [] });
      case 'trade/delete':
        return R.merge(state, { notes: this.deleteTrade(state, action), ids: [] });
      case 'trade/pagenation':
        return R.merge(state, { page: action.page });
      case 'trade/select':
        return R.merge(state, { ids: action.ids });
      case 'trade/filter':
        return R.merge(state, { filter: action.filter });
      case 'trade/download':
        return R.merge(state, { file: action.file });
      case 'trade/rehydrate':
        return action.state;
      default: 
        return state; 
    } 
  } 
}
TradedNotesStore.displayName = 'TradedNotesStore';
