import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'LoginAction';

export default {
  presetUser(user) {
    return NoteApiClient.presetUser(user).then(() => {
      dispatch({ type: 'user/preset', user });
    });
  },
  authenticate(user, password) {
    return NoteApiClient.authenticate(user, password)
      .then(isAuthenticated => {
      dispatch({ type: 'login/authenticate', isAuthenticated });
    });
  },
  signout(user) {
    return NoteApiClient.signout(user).then(isAuthenticated => {
      dispatch({ type: 'login/authenticate', isAuthenticated });
    });
  },
  rehydrate(state) {
    dispatch({ type: 'login/rehydrate/my', state: state.loginStore });
  }
};
