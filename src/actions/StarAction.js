import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'StarAction';

export default {
  rehydrate(state) {
    dispatch({ type: 'star/rehydrate', state: state.starredNotesStore });
  },
  createRead(ids) {
    return NoteApiClient.createRead(ids).then(() => {
      dispatch({ type: 'star/create/read', readIds: ids });
    });
  },
  deleteRead(ids) {
    return NoteApiClient.deleteStar(ids).then(ids => {
      dispatch({ type: 'star/delete/read', readIds: ids });
    });
  }
};
