import { ReduceStore } from 'flux/utils';

const displayName = 'LoginStore';

export default class LoginStore extends ReduceStore {
  getInitialState() {
    return { 
      user:   ''
    , admin:  ''
    , profile: {
        name:     ''
      , kana:     ''
      , email:    ''
      , phone:    ''
      , username: ''
      , plan:     ''
    }
    , preference: {
        from: ''
      , agreement: ''
      , menu: []
      , advertisement: { url1: '', url2: '', url3: '', url4: '' }
    }
    , isAuthenticated: false
    };
  }
  
  reduce(state, action) {
    switch (action.type) { 
      case 'admin/preset':
        return Object.assign({}, state, {
          admin:   action.admin
        , isAuthenticated: action.isAuthenticated
        });
      case 'user/preset':
        return Object.assign({}, state, {
          user:   action.user
        , isAuthenticated: action.isAuthenticated
        });
      case 'preference/fetch':
        return Object.assign({}, state, {
          preference: action.preference
        });
      case 'preference/update':
        return Object.assign({}, state, {
          preference: action.preference
        });
      case 'preference/create':
        return Object.assign({}, state, {
          preference: action.preference
        });
      case 'profile/fetch':
        return Object.assign({}, state, {
          profile: action.profile
        });
      case 'profile/update':
        return Object.assign({}, state, {
          profile: action.profile
        });
      case 'login/authenticate':
        return Object.assign({}, state, {
          isAuthenticated: action.isAuthenticated
        });
      case 'login/confirmation':
        return Object.assign({}, state, {
          user: action.user
        });
      case 'login/changepassword':
        return Object.assign({}, state, {
          user: action.user
        });
      case 'login/registration':
        return Object.assign({}, state, {
          user: action.user
        });
      case 'login/rehydrate/my':
        return    action.state;
      default: 
        return state; 
    } 
  } 
};
