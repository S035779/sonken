import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

export default {
  presetUser(user) {
    return NoteApiClient.presetUser(user).then(isAuthenticated => {
        dispatch({ type: 'user/preset', user, isAuthenticated });
      });
  },
  deleteList(user, ids) {
    return NoteApiClient.deleteList(user, ids).then(() => {
        dispatch({ type: 'list/delete', ids });
      });
  },
  //prefetchBided(user, skip, limit) {
  //  return NoteApiClient.prefetchBidedNotes(user, skip, limit).then(notes => {
  //      dispatch({ type: 'bids/prefetch', notes });
  //    });
  //},
  fetchBided(user, skip, limit, filter) {
    return NoteApiClient.fetchBidedNotes(user, skip, limit, filter).then(notes => {
        dispatch({ type: 'bids/fetch', notes });
      });
  },
  create(user, ids) {
    return NoteApiClient.createBids(user, ids).then(() => {
        dispatch({ type: 'bids/create', ids });
      });
  },
  delete(user, ids) {
    return NoteApiClient.deleteBids(user, ids).then(() => {
        dispatch({ type: 'bids/delete', ids });
      });
  },
  pagenation(user, page) {
    return NoteApiClient.pageBids(user, page).then(() => {
        dispatch({ type: 'bids/pagenation', page });
      });
  },
  select(user, ids) {
    return NoteApiClient.selectBids(user, ids).then(() => {
        dispatch({ type: 'bids/select', ids });
      });
  },
  filter(user, filter) {
    return NoteApiClient.filterBids(user, filter).then(() => {
        dispatch({ type: 'bids/filter', filter });
      });
  },
  download(user, filter) {
    return NoteApiClient.downloadBids(user, filter).then(file => {
        dispatch({ type: 'bids/download', file });
      });
  },
  rehydrate(state) {
    dispatch({ type: 'bids/rehydrate', state: state.bidedNotesStore });
  }
};
