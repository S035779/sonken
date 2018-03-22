import { ReduceStore } from 'flux/utils';

const displayName = 'PostedFaqsStore';

export default class PostedFaqsStore extends ReduceStore {
  getInitialState() {
    return { 
      user:             ''
    , isAuthenticated:  false
    , faqs: []
    };
  }
  
  reduce(state, action) {
    switch (action.type) { 
      case 'user/preset':
        return Object.assign({}, state, {
          user:   action.user
        , isAuthenticated: action.isAuthenticated
        });
      case 'login/authenticate':
        return Object.assign({}, state, {
          isAuthenticated: action.isAuthenticated
        });
      case 'faq/prefetch/posted':
        return Object.assign({}, state, {
          faqs: action.faqs 
        });
      case 'faq/fetch/posted':
        return Object.assign({}, state, {
          faqs: action.faqs
        });
      case 'faq/rehydrate/posted':
        return action.state;
      default: 
        return state; 
    } 
  } 
};
