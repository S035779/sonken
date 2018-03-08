import { dispatch } from 'Main/dispatcher';
import LoginApiClient from 'Services/LoginApiClient';
import UserApiClient from 'Services/UserApiClient';
import NoteApiClient from 'Services/NoteApiClient';

const pspid = 'LoginAction';

export default {
  presetAdmin(admin) {
    return UserApiClient.presetAdmin(admin).then(isAuthenticated => {
      dispatch({ type: 'admin/preset', admin, isAuthenticated });
    });
  },
  presetUser(user) {
    return NoteApiClient.presetUser(user).then(isAuthenticated => {
      dispatch({ type: 'user/preset', user, isAuthenticated });
    });
  },
  authenticate(user, password) {
    return LoginApiClient.authenticate(user, password)
      .then(isAuthenticated => {
      dispatch({ type: 'login/authenticate', isAuthenticated });
    });
  },
  signout(user) {
    return LoginApiClient.signout(user).then(isAuthenticated => {
      dispatch({ type: 'login/authenticate', isAuthenticated });
    });
  },
  confirmation(email, phone) {
    return LoginApiClient.confirmation(email, phone).then(user => {
      dispatch({ type: 'login/confirmation', user });
    });
  },
  changePassword(user, password) {
    return LoginApiClient.changePassword(user, password).then(() => {
      dispatch({ type: 'login/changepassword', user })
    });
  },
  registration(user, password, data) {
    return LoginApiClient.registration(user, password, data).then(() => {
      dispatch({ type: 'login/registration', user });
    })
  },
  rehydrate(state) {
    dispatch({ type: 'login/rehydrate/my', state: state.loginStore });
  }
};
