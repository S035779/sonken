import { dispatch }   from 'Main/dispatcher';
import LoginApiClient from 'Services/LoginApiClient';
import UserApiClient  from 'Services/UserApiClient';
import NoteApiClient  from 'Services/NoteApiClient';

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
  prefetchCategorys(user) {
    return NoteApiClient.prefetchCategorys(user).then(categorys => {
        dispatch({ type: 'category/prefetch/my', categorys });
      });
  },
  fetchCategorys(user) {
    return NoteApiClient.fetchCategorys(user).then(categorys => {
        dispatch({ type: 'category/fetch/my', categorys });
      });
  },
  fetchCategory(user, id) {
    return NoteApiClient.fetchCategory(user, id).then(category => {
        dispatch({ type: 'category/fetch', category });
      });
  },
  createCategory(user, data) {
    return NoteApiClient.createCategory(user, data).then(category => {
        dispatch({ type: 'category/create', category });
      });
  },
  updateCategory(user, id, data) {
    return NoteApiClient.updateCategory(user, id, data).then(category => {
        dispatch({ type: 'category/update', id, category });
      });
  },
  deleteCategory(user, ids) {
    return NoteApiClient.deleteCategory(user, ids).then(() => {
        dispatch({ type: 'category/delete', ids });
      });
  },
  fetchPreference() {
    return LoginApiClient.fetchPreference().then(preference => {
        dispatch({ type: 'preference/fetch',  preference });
      });
  },
  updatePreference(admin, data) {
    return LoginApiClient.updatePreference(admin, data).then(preference => {
        dispatch({ type: 'preference/update', preference });
      });
  },
  createPreference(admin) {
    return LoginApiClient.createPreference(admin).then(preference => {
        dispatch({ type: 'preference/create', preference });
      });
  },
  fetchProfile(admin) {
    return LoginApiClient.fetchProfile(admin).then(profile => {
        dispatch({ type: 'profile/fetch',  profile });
      });
  },
  updateProfile(user, password, data) {
    return LoginApiClient.updateProfile(user, password, data).then(profile => {
        dispatch({ type: 'profile/update', profile });
      });
  },
  authenticate(username, password, isAdmin, auto) {
    return LoginApiClient.authenticate(username, password, isAdmin, auto).then(isAuthenticated => {
        dispatch({ type: 'login/authenticate', isAuthenticated });
      });
  },
  autologin() {
    return LoginApiClient.autologin().then(obj => {
        const { user, isAuthenticated } = obj;
        dispatch({ type: 'login/authenticate', isAuthenticated });
        dispatch({ type: 'user/preset', user, isAuthenticated });
      });
  },
  signout(username, isAdmin) {
    return LoginApiClient.signout(username, isAdmin).then(isAuthenticated => {
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
       });
  },
  inquiry(user, { title, body }) {
    return LoginApiClient.inquiry(user, { title, body }).then(() => {
        dispatch({ type: 'login/sendmail' });
      });
  },
  rehydrate(state) {
    dispatch({ type: 'login/rehydrate/my', state: state.loginStore });
  }
};
