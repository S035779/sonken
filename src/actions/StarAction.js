import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'StarAction';

export default {
  rehydrate(state) {
    dispatch({ type: 'star/rehydrate', state: state.starredNotesStore });
  },
  create(id) {
    return NoteApiClient.createStar(id).then(() => {
      dispatch({ type: 'star/create', noteId: id });
    });
  },
  delete(id) {
    return NoteApiClient.deleteStar(id).then(id => {
      dispatch({ type: 'star/delete', noteId: id });
    });
  }
};
