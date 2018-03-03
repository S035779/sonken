import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'PublicAction';

export default {
  presetUser(user) {
    return NoteApiClient.presetUser(user).then(() => {
      dispatch({ type: 'user/preset', user });
    });
  },
  rehydrate(state) {
    dispatch({ type: 'public/rehydrate/my', state: state.publicStore });
  }
};
