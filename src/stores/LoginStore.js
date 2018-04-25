import { ReduceStore } from 'flux/utils';
import std              from 'Utilities/stdutils';

const displayName = 'LoginStore';

export default class LoginStore extends ReduceStore {
  getInitialState() {
    return { 
      user:             ''
    , isAuthenticated:  false
    , admin:            ''
    , profile: {
        name:           ''
      , kana:           ''
      , email:          ''
      , phone:          ''
      , username:       ''
      , plan:           ''
      }
    , preference: {
        from:           ''
      , agreement:      ''
      , menu:           []
      , advertisement:  { url1: '', url2: '', url3: '', url4: '' }
      }
    , categorys:        []
    };
  }
  
  updateCategory(state, action) {
    return state.categorys.map(category => action.id === category._id
      ? Object.assign({}, category, action.category) : category);
  }

  deleteCategory(state, action) {
    const isCategory = obj => action.ids.some(id => id === obj._id);
    return state.categorys.filter(category => !isCategory(category));
  }

  reduce(state, action) {
    //std.logDebug(displayName, 'Store', action);
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
      case 'category/prefetch/my':
        return Object.assign({}, state, {
          categorys: action.categorys
        });
      case 'category/fetch/my':
        return Object.assign({}, state, {
          categorys: action.categorys
        });
      case 'category/create':
        return Object.assign({}, state, {
          categorys: [action.category, ...state.categorys]
        });
      case 'category/update':
        return Object.assign({}, state, {
          categorys: this.updateCategory(state, action)
        });
      case 'category/delete':
        return Object.assign({}, state, {
          categorys: this.deleteCategory(state, action)
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
