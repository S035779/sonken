import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'BidsAction';

export default {
  deleteItem(user, ids) {
    return NoteApiClient.deleteItem(user, ids).then(() => {
      dispatch({ type: 'item/delete/bided', ids });
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
  rehydrate(state) {
    dispatch({ type: 'bids/rehydrate', state: state.bidedNotesStore });
  }
};
