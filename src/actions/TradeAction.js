import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const displayName = 'TradeAction';

export default {
  //deleteItem(user, ids) {
  //  return NoteApiClient.deleteItem(user, ids).then(() => {
  //    dispatch({ type: 'item/delete/traded', ids });
  //  });
  //},
  deleteBids(user, ids) {
    return NoteApiClient.deleteBids(user, ids)
      .then(() => {
        dispatch({ type: 'bids/delete', ids });
      })
    ;
  },
  create(user, ids) {
    return NoteApiClient.createTrade(user, ids)
      .then(() => {
        dispatch({ type: 'trade/create', ids });
      })
    ;
  },
  delete(user, ids) {
    return NoteApiClient.deleteTrade(user, ids)
      .then(() => {
        dispatch({ type: 'trade/delete', ids });
      })
    ;
  },
  pagenation(user, page) {
    return NoteApiClient.pageTrade(user, page)
      .then(() => {
        dispatch({ type: 'trade/pagenation', page });
      })
    ;
  },
  select(user, ids) {
    return NoteApiClient.selectTrade(user, ids)
      .then(() => {
        dispatch({ type: 'trade/select', ids });
      })
    ;
  },
  filter(user, filter) {
    return NoteApiClient.filterTrade(user, filter)
      .then(() => {
        dispatch({ type: 'trade/filter', filter });
      })
    ;
  },
  download(user, items) {
    return NoteApiClient.downloadItems(user, items)
      .then(file => {
        dispatch({ type: 'trade/download', file });
      })
    ;
  },
  rehydrate(state) {
    dispatch({ type: 'trade/rehydrate', state: state.tradedNotesStore });
  }
};
