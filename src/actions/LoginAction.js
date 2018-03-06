import { dispatch } from 'Main/dispatcher';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'LoginAction';

export default {
  presetUser(user) {
    return NoteApiClient.presetUser(user).then(isAuthenticated => {
      dispatch({ type: 'user/preset', user, isAuthenticated });
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
  confirmation(email, phone) {
    return NoteApiClient.confirmation(email, phone).then(user => {
      dispatch({ type: 'login/confirmation', user });
    });
  },
  changePassword(user, password) {
    return NoteApiClient.changePassword(user, password).then(() => {
      dispatch({ type: 'login/changepassword', user })
    });
  },
  registration(user, password, data) {
    return NoteApiClient.registration(user, password, data).then(() => {
      dispatch({ type: 'login/registration', user });
    })
  },
  rehydrate(state) {
    dispatch({ type: 'login/rehydrate/my', state: state.loginStore });
  }
};
