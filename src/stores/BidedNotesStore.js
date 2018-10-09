import { ReduceStore }  from 'flux/utils';
import * as R           from 'ramda';
import std              from 'Utilities/stdutils';

export default class BidedNotesStore extends ReduceStore {
  getInitialState() {
    return { 
      user: ''
    , isAuthenticated: false
    , notes: []
    , page: { maxNumer: 0, number: 1, perPage: 20 }
    , selected: false
    , ids: []
    , filter: {
        endBidding: true
      , allBidding: true
      , inBidding: false
      , bidStartTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
      , bidStopTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
      }
    , file: null
    };
  }
  
  createBids(state, action) {
    const isItem = obj => R.any(id => id === obj.guid__)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { bided: true }) : obj;
    const setItems = R.map(setItem)
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj;
    const setNotes = R.map(setNote)
    return setNotes(state.notes);
  }

  deleteBids(state, action) {
    const isItem = obj => R.any(id => id === obj.guid__)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { bided: false }) : obj;
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj;
    const setNotes = R.map(setNote)
    return setNotes(state.notes);
  }

  deleteList(state, action) {
    const isItem = obj => R.none(id => id === obj.guid__)(action.ids);
    const hasItems = R.filter(isItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: hasItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote)
    return setNotes(state.notes);
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'user/preset':
        return R.merge(state, { user: action.user, isAuthenticated: action.isAuthenticated });
      case 'login/authenticate':
        return R.merge(state, { isAuthenticated: action.isAuthenticated });
      case 'list/delete':
        return R.merge(state, { notes: this.deleteList(state, action), ids: [] });
      case 'bids/prefetch':
        return R.merge(state, { notes: action.notes });
      case 'bids/fetch':
        return R.merge(state, { notes: action.notes });
      case 'bids/create':
        return R.merge(state, { notes: this.createBids(state, action), ids: [] });
      case 'bids/delete':
        return R.merge(state, { notes: this.deleteBids(state, action), ids: [] });
      case 'bids/pagenation':
        return R.merge(state, { page: action.page });
      case 'bids/select':
        return R.merge(state, { ids: action.ids });
      case 'bids/filter':
        return R.merge(state, { filter: action.filter });
      case 'bids/download':
        return R.merge(state, { file: action.file });
      case 'bids/rehydrate':
        return action.state;
      default: 
        return state; 
    } 
  } 
}
BidedNotesStore.displayName = 'BidedNotesStore';
