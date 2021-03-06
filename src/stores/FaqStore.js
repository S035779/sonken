import { ReduceStore } from 'flux/utils';
import * as R from 'ramda';

export default class FaqStore extends ReduceStore {
  getInitialState() {
    return { 
      admin:            ''
    , isAuthenticated:  false
    , faqs:             []
    , page: {
        maxNumer: 0
      , number:   0
      , perPage:  20
    }
    , selected: false
    , ids:      []
    };
  }
  
  updateFaq(state, action) {
    return state.faqs.map(faq => action.id === faq._id ? R.merge(faq, action.faq) : faq);
  }

  deleteFaq(state, action) {
    const isFaq = obj => action.ids.some(id => id === obj._id)
    return state.faqs.filter(faq => !isFaq(faq));
  }

  createPost(state, action) {
    const isFaq = obj => action.ids.some(id => id === obj._id)
    const setFaq = obj => R.merge(obj, { posted: true });
    return state.faqs.map(faq => isFaq(faq) ? setFaq(faq) : faq);
  }

  deletePost(state, action) {
    const isFaq = obj => action.ids.some(id => id === obj._id)
    const setFaq = obj => R.merge(obj, { posted: false });
    return state.faqs.map(faq => isFaq(faq) ? setFaq(faq) : faq);
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'admin/preset':
        return R.merge(state, { admin:   action.admin , isAuthenticated: action.isAuthenticated });
      case 'login/authenticate':
        return R.merge(state, { isAuthenticated: action.isAuthenticated });
      //case 'faq/prefetch':
      //  return R.merge(state, { faqs:  action.faqs });
      case 'faq/fetch':
        return R.merge(state, { faqs:  action.faqs });
      case 'faq/create':
        return R.merge(state, { faqs:  [action.faq, ...state.faqs] });
      case 'faq/update': 
        return R.merge(state, { faqs:  this.updateFaq(state, action) });
      case 'faq/pagenation':
        return R.merge(state, { page:   action.page });
      case 'faq/select':
        return R.merge(state, { ids:    action.ids });
      case 'faq/delete':
        return R.merge(state, { faqs:  this.deleteFaq(state, action) , ids:    [] });
      case 'post/create':
        return R.merge(state, { faqs: this.createPost(state, action) , ids:    [] });
      case 'post/delete':
        return R.merge(state, { faqs: this.deletePost(state, action) , ids:    [] });
      case 'faq/upload':
        return R.merge(state, { faq: this.updateFaq(state, action) });
      case 'faq/rehydrate':
        return    action.state;
      default: 
        return state; 
    } 
  } 
}
FaqStore.displayName = 'FaqStore';

