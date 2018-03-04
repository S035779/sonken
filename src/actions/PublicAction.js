import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'PublicAction';

export default {
  presetUser(user) {
    return NoteApiClient.presetUser(user).then(isAuthenticated => {
      dispatch({ type: 'user/preset', user, isAuthenticated });
    });
  },
  rehydrate(state) {
    dispatch({ type: 'public/rehydrate/my', state: state.publicStore });
  }
};
