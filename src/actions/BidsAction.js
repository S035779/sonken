import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'BidsAction';

export default {
  deleteItem(ids) {
    return NoteApiClient.deleteItem(ids).then(() => {
      dispatch({ type: 'item/delete/bided', ids });
    });
  },
  create(ids) {
    return NoteApiClient.createBids(ids).then(() => {
      dispatch({ type: 'bids/create', ids });
    });
  },
  delete(ids) {
    return NoteApiClient.deleteBids(ids).then(() => {
      dispatch({ type: 'bids/delete', ids });
    });
  },
  pagenation(page) {
    return NoteApiClient.pageBids(page).then(() => {
      dispatch({ type: 'bids/pagenation', page });
    });
  },
  select(ids) {
    return NoteApiClient.selectBids(ids).then(() => {
      dispatch({ type: 'bids/select', ids });
    });
  },
  filter(filter) {
    return NoteApiClient.filterBids(filter).then(() => {
      dispatch({ type: 'bids/filter', filter });
    });
  },
  rehydrate(state) {
    dispatch({ type: 'bids/rehydrate', state: state.bidedNotesStore });
  }
};
