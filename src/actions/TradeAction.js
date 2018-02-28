import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'TradeAction';

export default {
  create(ids) {
    return NoteApiClient.createTrade(ids).then(() => {
      dispatch({ type: 'trade/create', ids });
    });
  },
  delete(ids) {
    return NoteApiClient.deleteTrade(ids).then(() => {
      dispatch({ type: 'trade/delete', ids });
    });
  },
  rehydrate(state) {
    dispatch({ type: 'trade/rehydrate', state: state.tradedNotesStore });
  }};
