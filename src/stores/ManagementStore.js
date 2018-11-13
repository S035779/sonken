import * as R           from 'ramda';
import { ReduceStore }  from 'flux/utils';

export default class ManagementStore extends ReduceStore {
  getInitialState() {
    return { 
      admin: ''
    , isAuthenticated: false
    , users:    []
    , page: { maxNumer: 0, number:   0, perPage:  20 }
    , selected: false
    , ids:      []
    , preference: {
        from: ''
      , agreement: ''
      , menu: []
      , advertisement: { url1: '', url2: '', url3: '', url4: '' }
      }
    };
  }

  updateUser(state, action) {
    const setUser = user => action.user._id === user._id ? R.merge(user, action.user) : user;
    const setUsers = R.map(setUser);
    return setUsers(state.users);
  }

  deleteUser(state, action) {
    const isUser = obj => action.ids.some(id => id === obj._id)
    const hasUsers = R.filter(user => !isUser(user));
    return hasUsers(state.users);
  }

  createApproval(state, action) {
    const isUser = obj => action.ids.some(id => id === obj._id)
    const setUser = obj => R.merge(obj, { approved: true });
    const setUsers = R.map(user => isUser(user) ? setUser(user) : user);
    return setUsers(state.users);
  }

  deleteApproval(state, action) {
    const isUser = obj => action.ids.some(id => id === obj._id)
    const setUser = obj => R.merge(obj, { approved: false });
    const setUsers = R.map(user => isUser(user) ? setUser(user) : user);
    return setUsers(state.users);
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'admin/preset':
        return R.merge(state, { admin: action.admin, isAuthenticated: action.isAuthenticated })
      case 'preference/fetch':
        return R.merge(state, { preference: action.preference });
      case 'login/authenticate':
        return R.merge(state, { isAuthenticated: action.isAuthenticated });
      case 'user/prefetch':
        return R.merge(state, { users: action.users });
      case 'user/fetch':
        return R.merge(state, { users: action.users });
      case 'user/create':
        return R.merge(state, { users: [action.user, ...state.users] });
      case 'user/update': 
        return R.merge(state, { users: this.updateUser(state, action) });
      case 'user/pagenation':
        return R.merge(state, { page: action.page });
      case 'user/select':
        return R.merge(state, { ids: action.ids });
      case 'user/delete':
        return R.merge(state, { users: this.deleteUser(state, action) });
      case 'user/sendmail':
        return R.merge(state, {});
      case 'approval/create':
        return R.merge(state, { users: this.createApproval(state, action) });
      case 'approval/delete':
        return R.merge(state, { users: this.deleteApproval(state, action) });
      case 'user/upload':
        return R.merge(state, { users: [action.user, ...state.users] });
      case 'user/download':
        return R.merge(state, { users: action.users });
      case 'user/rehydrate':
        return action.state;
      default: 
        return state; 
    } 
  } 
}
ManagementStore.displayName = 'ManagementStore';

