import { dispatch } from 'Main/dispatcher';
import UserApiClient from 'Services/UserApiClient';
import NoteApiClient from 'Services/NoteApiClient';

const displayName = 'FaqAction';

export default {
  presetAdmin(admin) {
    return UserApiClient.presetAdmin(admin)
      .then(isAuthenticated => {
        dispatch({ type: 'admin/preset', admin, isAuthenticated });
      })
    ;
  },
  presetUser(user) {
    return NoteApiClient.presetUser(user)
      .then(isAuthenticated => {
        dispatch({ type: 'user/preset', user, isAuthenticated });
      })
    ;
  },
  prefetchFaqs(admin) {
    return UserApiClient.prefetchFaqs(admin)
      .then(faqs => {
        dispatch({ type: 'faq/prefetch', faqs });
      })
    ;
  },
  fetchFaqs(admin) {
    return UserApiClient.fetchFaqs(admin)
      .then(faqs => {
        dispatch({ type: 'faq/fetch', faqs });
      })
    ;
  },
  prefetchPostedFaqs() {
    return UserApiClient.prefetchPostedFaqs()
      .then(faqs => {
        dispatch({ type: 'faq/prefetch/posted', faqs });
      })
    ;
  },
  fetchPostedFaqs() {
    return UserApiClient.fetchPostedFaqs()
      .then(faqs => {
        dispatch({ type: 'faq/fetch/posted', faqs });
      })
    ;
  },
  //fetch(admin, id) {
  //  dispatch({ type: 'faq/fetch/before' });
  //  return UserApiClient.fetchFaq(admin, id)
  //    .then(faq => {
  //      dispatch({ type: 'faq/fetch', faq });
  //    })
  //  ;
  //},
  create(admin) {
    return UserApiClient.createFaq(admin)
      .then(faq => {
        dispatch({ type: 'faq/create', faq });
      })
    ;
  },
  update(admin, id, { title, body }) {
    return UserApiClient.updateFaq(admin, id, { title, body })
      .then(() => {
        dispatch({ type: 'faq/update', id, faq: { title, body } });
      })
    ;
  },
  pagenation(admin, page) {
    return UserApiClient.pageFaq(admin, page)
      .then(() => {
        dispatch({ type: 'faq/pagenation', page });
      })
    ;
  },
  select(admin, ids) {
    return UserApiClient.selectFaq(admin, ids)
      .then(() => {
        dispatch({ type: 'faq/select', ids });
      })
    ;
  },
  delete(admin, ids) {
    return UserApiClient.deleteFaq(admin, ids)
      .then(() => {
        dispatch({ type: 'faq/delete', ids });
      })
    ;
  },
  createPost(admin, ids) {
    return UserApiClient.createPost(admin, ids)
      .then(() => {
        dispatch({ type: 'post/create', ids });
      })
    ;
  },
  deletePost(admin, ids) {
    return UserApiClient.deletePost(admin, ids)
      .then(() => {
        dispatch({ type: 'post/delete', ids });
      })
    ;
  },
  upload(admin, id, file) {
    return UserApiClient.uploadFaq(admin, id, file)
      .then(faq => {
        dispatch({ type: 'faq/upload', faq });
      })
    ;
  },
  rehydrate(state) {
    dispatch({ type: 'faq/rehydrate', state: state.faqStore });
    dispatch(
      { type: 'faq/rehydrate/posted', state: state.postedFaqsStore });
  }
};
