import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'TradeAction';

export default {
  deleteItem(ids) {
    return NoteApiClient.deleteItem(ids).then(() => {
      dispatch({ type: 'item/delete/traded', ids });
    });
  },
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
  pagenation(page) {
    return NoteApiClient.pageTrade(page).then(() => {
      dispatch({ type: 'trade/pagenation', page });
    });
  },
  select(ids) {
    return NoteApiClient.selectTrade(ids).then(() => {
      dispatch({ type: 'trade/select', ids });
    });
  },
  filter(filter) {
    return NoteApiClient.filterTrade(filter).then(() => {
      dispatch({ type: 'trade/filter', filter });
    });
  },
  rehydrate(state) {
    dispatch({ type: 'trade/rehydrate', state: state.tradedNotesStore });
  }
};
