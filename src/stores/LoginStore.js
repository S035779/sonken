import { ReduceStore } from 'flux/utils';
import * as R           from 'ramda';

export default class LoginStore extends ReduceStore {
  getInitialState() {
    return { 
      admin:            ''
    , user:             ''
    , isAuthenticated:  false
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
    , jobs:             []
    };
  }
  
  updateCategory(state, action) {
    const setCategory = obj => action.id === obj._id ? R.merge(obj, action.category) : obj;
    const setCategorys = R.map(setCategory);
    return setCategorys(state.categorys);
  }

  deleteCategory(state, action) {
    const isCategory = obj => R.any(id => id === obj._id)(action.ids);
    const hasCategorys = R.filter(obj => !isCategory(obj));
    return hasCategorys(state.categorys);
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'admin/preset':
        return R.merge(state, { admin: action.admin, isAuthenticated: action.isAuthenticated });
      case 'user/preset':
        return R.merge(state, { user: action.user, isAuthenticated: action.isAuthenticated });
      case 'category/prefetch/my':
        return R.merge(state, { categorys: action.categorys });
      case 'category/fetch/my':
        return R.merge(state, { categorys: action.categorys });
      case 'category/create':
        return R.merge(state, { categorys: [action.category, ...state.categorys] });
      case 'category/update':
        return R.merge(state, { categorys: this.updateCategory(state, action) });
      case 'category/delete':
        return R.merge(state, { categorys: this.deleteCategory(state, action) });
      case 'preference/fetch':
        return R.merge(state, { preference: action.preference });
      case 'preference/update':
        return R.merge(state, { preference: action.preference });
      case 'preference/create':
        return R.merge(state, { preference: action.preference });
      case 'profile/fetch':
        return R.merge(state, { profile: action.profile });
      case 'profile/update':
        return R.merge(state, { profile: action.profile });
      case 'login/authenticate':
        return R.merge(state, { isAuthenticated: action.isAuthenticated });
      case 'login/confirmation':
        return R.merge(state, { user: action.user });
      case 'login/changepassword':
        return R.merge(state, { user: action.user });
      case 'login/registration':
        return R.merge(state, { user: action.user });
      case 'login/rehydrate/my':
        return action.state;
      case 'jobs/fetch':
        return R.merge(state, { jobs: action.jobs });
      default: 
        return state; 
    } 
  } 
}
LoginStore.displayName = 'LoginStore';
