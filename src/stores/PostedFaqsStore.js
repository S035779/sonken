import { ReduceStore } from 'flux/utils';

export default class PostedFaqsStore extends ReduceStore {
  getInitialState() {
    return { 
      faqs: []
    };
  }
  
  reduce(state, action) {
    switch (action.type) { 
      case 'star/rehydrate':
        return action.state;
      case 'faq/fetch/posted':
        return { faqs: action.faqs };
      default: 
        return state; 
    } 
  } 
};
