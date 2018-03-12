import { ReduceStore } from 'flux/utils';

const displayName = 'FaqStore';

export default class FaqStore extends ReduceStore {
  getInitialState() {
    return { 
      admin: ''
      , isAuthenticated: false
      , faqs:    []
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
    return state.faqs.map(faq => action.id === faq._id
      ? Object.assign({}, faq, action.faq) : faq);
  }

  deleteFaq(state, action) {
    const isFaq = obj => action.ids.some(id => id === obj._id)
    return state.faqs.filter(faq => !isFaq(faq));
  }

  createPost(state, action) {
    const isFaq = obj => action.ids.some(id => id === obj._id)
    const setFaq = obj => Object.assign({}, obj, { posted: true });
    return state.faqs.map(faq => isFaq(faq) ? setFaq(faq) : faq);
  }

  deletePost(state, action) {
    const isFaq = obj => action.ids.some(id => id === obj._id)
    const setFaq = obj => Object.assign({}, obj, { posted: false });
    return state.faqs.map(faq => isFaq(faq) ? setFaq(faq) : faq);
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'admin/preset':
        return Object.assign({}, state, {
          admin:   action.admin
        , isAuthenticated: action.isAuthenticated
        })
      case 'login/authenticate':
        return Object.assign({}, state, {
          isAuthenticated: action.isAuthenticated
        });
      case 'faq/prefetch':
        return Object.assign({}, state, {
          faqs:  action.faqs
        });
      case 'faq/fetch':
        return Object.assign({}, state, {
          faqs:  action.faqs
        });
      case 'faq/create':
        return Object.assign({}, state, {
          faqs:  [action.faq, ...state.faqs]
        });
      case 'faq/update': 
        return Object.assign({}, state, {
          faqs:  this.updateFaq(state, action)
        });
      case 'faq/pagenation':
        return Object.assign({}, state, {
          page:   action.page
        });
      case 'faq/select':
        return Object.assign({}, state, {
          ids:    action.ids
        });
      case 'faq/delete':
        return Object.assign({}, state, {
          faqs:  this.deleteFaq(state, action)
        , ids:    []
        });
      case 'post/create':
        return Object.assign({}, state, {
          faqs: this.createPost(state, action)
        , ids:    []
        });
      case 'post/delete':
        return Object.assign({}, state, {
          faqs: this.deletePost(state, action)
        , ids:    []
        });
      case 'faq/rehydrate':
        return    action.state;
      default: 
        return state; 
    } 
  } 
};
