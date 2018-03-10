import { ReduceStore } from 'flux/utils';

const pspid = 'ManagementStore';

export default class ManagementStore extends ReduceStore {
  getInitialState() {
    return { 
      admin: ''
      , isAuthenticated: false
      , users:    []
      , page: {
        maxNumer: 0
      , number:   0
      , perPage:  20
      }
    , selected: false
    , ids:      []
    };
  }

  updateUser(state, action) {
    return state.users.map(user => action.user._id === user._id
      ? Object.assign({}, user, action.user) : user);
  }

  deleteUser(state, action) {
    const isUser = obj => action.ids.some(id => id === obj._id)
    return state.users.filter(user => !isUser(user));
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
      case 'user/prefetch':
        return Object.assign({}, state, {
          users:  action.users
        });
      case 'user/fetch':
        return Object.assign({}, state, {
          users:  action.users
        });
      case 'user/create':
        return Object.assign({}, state, {
          users:  [action.user, ...state.users]
        });
      case 'user/update': 
        return Object.assign({}, state, {
          users:  this.updateUser(state, action)
        });
      case 'user/pagenation':
        return Object.assign({}, state, {
          page:   action.page
        });
      case 'user/select':
        return Object.assign({}, state, {
          ids:    action.ids
        });
      case 'user/delete':
        return Object.assign({}, state, {
          users:  this.deleteUser(state, action)
        , ids:    []
        });
      case 'user/sendmail':
        return Object.assign({}, state, {
          ids: []
        });
      case 'user/approval':
        return Object.assign({}, state, {
          ids: []
        });
      case 'user/upload':
        return Object.assign({}, state, {
          users:  [action.user, ...state.users]
        });
      case 'user/download':
        return Object.assign({}, state, {
          users:  action.users
        });
      case 'user/rehydrate':
        return    action.state;
      default: 
        return state; 
    } 
  } 
};
