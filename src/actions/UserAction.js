import { dispatch } from 'Main/dispatcher';
import UserApiClient from 'Services/UserApiClient';

export default {
  presetAdmin(admin) {
    return UserApiClient.presetAdmin(admin).then(isAuthenticated => {
        dispatch({ type: 'admin/preset', admin, isAuthenticated });
      });
  },
  //prefetchUsers(admin) {
  //  return UserApiClient.prefetchUsers(admin).then(users => {
  //      dispatch({ type: 'user/prefetch', users });
  //    });
  //},
  fetchUsers(admin) {
    return UserApiClient.fetchUsers(admin).then(users => {
        dispatch({ type: 'user/fetch', users });
      });
  },
  create(admin) {
    return UserApiClient.createUser(admin, {}).then(user => {
        dispatch({ type: 'user/create', user });
      });
  },
  update(admin, user) {
    return UserApiClient.updateUser(admin, user).then(() => {
        dispatch({ type: 'user/update', user });
      });
  },
  pagenation(admin, page) {
    return UserApiClient.pageUser(admin, page).then(() => {
        dispatch({ type: 'user/pagenation', page });
      });
  },
  select(admin, ids) {
    return UserApiClient.selectUser(admin, ids).then(() => {
        dispatch({ type: 'user/select', ids });
      });
  },
  delete(admin, ids) {
    return UserApiClient.deleteUser(admin, ids).then(() => {
        dispatch({ type: 'user/delete', ids });
      });
  },
  sendmail(admin, ids) {
    return UserApiClient.sendmail(admin, ids).then(() => {
        dispatch({ type: 'user/sendmail', ids });
      });
  },
  createApproval(admin, ids) {
    return UserApiClient.createApproval(admin, ids).then(() => {
        dispatch({ type: 'approval/create', ids });
      });
  },
  deleteApproval(admin, ids) {
    return UserApiClient.deleteApproval(admin, ids).then(() => {
        dispatch({ type: 'approval/delete', ids });
      });
  },
  upload(admin, filename) {
    return UserApiClient.uploadNotes(admin, filename).then(notes => {
        dispatch({ type: 'user/upload', notes });
      });
  },
  download(admin, filename) {
    return UserApiClient.downloadNotes(admin, filename).then(notes => {
        dispatch({ type: 'user/download', notes });
      });
  },
  rehydrate(state) {
    dispatch({ type: 'user/rehydrate', state: state.managementStore });
  }
};
