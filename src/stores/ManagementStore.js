import { ReduceStore } from 'flux/utils';

const displayName = 'ManagementStore';

export default class ManagementStore extends ReduceStore {
  getInitialState() {
    return { 
      admin: ''
    , preference: {
        from: ''
      , agreement: ''
      , menu: []
      , advertisement: { url1: '', url2: '', url3: '', url4: '' }
    }
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

  createApproval(state, action) {
    const isUser = obj => action.ids.some(id => id === obj._id)
    const setUser = obj => Object.assign({}, obj, { approved: true });
    return state.users.map(user => isUser(user) ? setUser(user) : user);
  }

  deleteApproval(state, action) {
    const isUser = obj => action.ids.some(id => id === obj._id)
    const setUser = obj => Object.assign({}, obj, { approved: false });
    return state.users.map(user => isUser(user) ? setUser(user) : user);
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'admin/preset':
        return Object.assign({}, state, {
          admin:   action.admin
        , isAuthenticated: action.isAuthenticated
        })
      case 'preference/fetch':
        return Object.assign({}, state, {
          preference: action.preference
        });
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
      case 'approval/create':
        return Object.assign({}, state, {
          users: this.createApproval(state, action)
        , ids: []
        });
      case 'approval/delete':
        return Object.assign({}, state, {
          users: this.deleteApproval(state, action)
        , ids: []
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
