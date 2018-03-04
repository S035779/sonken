import { ReduceStore } from 'flux/utils';

const pspid = 'PublicStore';

export default class PublicStore extends ReduceStore {
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
        , isAuthenticated: action.isAuthenticated
        })
      case 'login/authenticate':
        return Object.assign({}, state, {
          isAuthenticated: action.isAuthenticated
        });
      case 'public/rehydrate/my':
        return    action.state;
      default: 
        return state; 
    } 
  } 
};