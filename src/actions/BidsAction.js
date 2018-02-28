import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'BidsAction';

export default {
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
  rehydrate(state) {
    dispatch({ type: 'bids/rehydrate', state: state.bidedNotesStore });
  }};
