import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'StarAction';

export default {
  rehydrate(state) {
    dispatch({ type: 'star/rehydrate', state: state.starredNotesStore });
  }};
