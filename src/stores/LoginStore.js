import { ReduceStore } from 'flux/utils';

const pspid = 'LoginStore';

export default class LoginStore extends ReduceStore {
  getInitialState() {
    return { 
      user: ''
    , isAuthenticated: false
    };
  }
  
  reduce(state, action) {
    switch (action.type) { 
      case 'user/preset':
        return Object.assign({}, state, {
          user:   action.user
        });
      case 'login/authenticate':
        return Object.assign({}, state, {
          isAuthenticated: action.isAuthenticated
        });
      case 'login/rehydrate/my':
        return    action.state;
      default: 
        return state; 
    } 
  } 
};
