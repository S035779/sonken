import { ReduceStore } from 'flux/utils';
import * as R from 'ramda';

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
        return R.merge(state, { user:   action.user , isAuthenticated: action.isAuthenticated });
      case 'login/authenticate':
        return R.merge(state, { isAuthenticated: action.isAuthenticated });
      //case 'faq/prefetch/posted':
      //  return R.merge(state, { faqs: action.faqs });
      case 'faq/fetch/posted':
        return R.merge(state, { faqs: action.faqs });
      case 'faq/rehydrate/posted':
        return action.state;
      default: 
        return state; 
    } 
  } 
}
PostedFaqsStore.displayName = 'PostedFaqsStore';

