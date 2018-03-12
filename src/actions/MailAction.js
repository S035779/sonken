import { dispatch } from 'Main/dispatcher';
import UserApiClient from 'Services/UserApiClient';

const pspid = 'MailAction';

export default {
  presetAdmin(admin) {
    return UserApiClient.presetAdmin(admin).then(isAuthenticated => {
      dispatch({ type: 'admin/preset', admin, isAuthenticated });
    });
  },
  prefetchMails(admin) {
    return UserApiClient.prefetchMails(admin).then(mails => {
      dispatch({ type: 'mail/prefetch', mails });
    });
  },
  fetchMails(admin) {
    return UserApiClient.fetchMails(admin).then(mails => {
      dispatch({ type: 'mail/fetch', mails });
    });
  },
  //fetch(admin, id) {
  //  dispatch({ type: 'mail/fetch/before' });
  //  return UserApiClient.fetchMail(admin, id).then(mail => {
  //    dispatch({ type: 'mail/fetch', mail });
  //  });
  //},
  create(admin) {
    return UserApiClient.createMail(admin).then(mail => {
      dispatch({ type: 'mail/create', mail });
    });
  },
  update(admin, id, { title, body }) {
    return UserApiClient.updateMail(admin, id, { title, body }).then(() => {
      dispatch({ type: 'mail/update', id, mail: { title, body } });
    });
  },
  pagenation(admin, page) {
    return UserApiClient.pageMail(admin, page).then(() => {
      dispatch({ type: 'mail/pagenation', page });
    });
  },
  select(admin, ids) {
    return UserApiClient.selectMail(admin, ids).then(() => {
      dispatch({ type: 'mail/select', ids });
    });
  },
  delete(admin, ids) {
    return UserApiClient.deleteMail(admin, ids).then(() => {
      dispatch({ type: 'mail/delete', ids });
    });
  },
  createSelect(admin, ids) {
    return UserApiClient.createSelect(admin, ids).then(() => {
      dispatch({ type: 'select/create', ids });
    });
  },
  deleteSelect(admin, ids) {
    return UserApiClient.deleteSelect(admin, ids).then(() => {
      dispatch({ type: 'select/delete', ids });
    });
  },
  rehydrate(state) {
    dispatch({ type: 'mail/rehydrate', state: state.mailStore });
  }
};
