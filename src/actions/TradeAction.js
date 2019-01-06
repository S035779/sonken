import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

export default {
  presetUser(user) {
    return NoteApiClient.presetUser(user).then(isAuthenticated => {
        dispatch({ type: 'user/preset', user, isAuthenticated });
      });
  },
  deleteBids(user, ids) {
    return NoteApiClient.deleteBids(user, ids).then(() => {
        dispatch({ type: 'bids/delete', ids });
      });
  },
  //prefetchTraded(user, skip, limit) {
  //  return NoteApiClient.prefetchTradedNotes(user, skip, limit).then(notes => {
  //      dispatch({ type: 'trade/prefetch', notes });
  //    });
  //},
  fetchTraded(user, skip, limit, filter) {
    return NoteApiClient.fetchTradedNotes(user, skip, limit, filter).then(notes => {
        dispatch({ type: 'trade/fetch', notes });
      });
  },
  create(user, ids) {
    return NoteApiClient.createTrade(user, ids).then(() => {
        dispatch({ type: 'trade/create', ids });
      });
  },
  delete(user, ids) {
    return NoteApiClient.deleteTrade(user, ids).then(() => {
        dispatch({ type: 'trade/delete', ids });
      });
  },
  pagenation(user, page) {
    return NoteApiClient.pageTrade(user, page).then(() => {
        dispatch({ type: 'trade/pagenation', page });
      });
  },
  select(user, ids) {
    return NoteApiClient.selectTrade(user, ids).then(() => {
        dispatch({ type: 'trade/select', ids });
      });
  },
  filter(user, filter) {
    return NoteApiClient.filterTrade(user, filter).then(() => {
        dispatch({ type: 'trade/filter', filter });
      });
  },
  download(user, filter) {
    return NoteApiClient.downloadTrade(user, filter).then(file => {
        dispatch({ type: 'trade/download', file });
      });
  },
  rehydrate(state) {
    dispatch({ type: 'trade/rehydrate', state: state.tradedNotesStore });
  }
};
