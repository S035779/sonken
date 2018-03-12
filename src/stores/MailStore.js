import { ReduceStore } from 'flux/utils';

const displayName = 'MailStore';

export default class MailStore extends ReduceStore {
  getInitialState() {
    return { 
      admin: ''
      , isAuthenticated: false
      , mails:    []
      , page: {
        maxNumer: 0
      , number:   0
      , perPage:  20
      }
    , selected: false
    , ids:      []
    };
  }
  
  updateMail(state, action) {
    return state.mails.map(mail => action.id === mail._id
      ? Object.assign({}, mail, action.mail) : mail);
  }

  deleteMail(state, action) {
    const isMail = obj => action.ids.some(id => id === obj._id)
    return state.mails.filter(mail => !isMail(mail));
  }

  createSelect(state, action) {
    const isMail = obj => action.ids.some(id => id === obj._id)
    const setMail = obj => Object.assign({}, obj, { selected: true });
    return state.mails.map(mail => isMail(mail) ? setMail(mail) : mail);
  }

  deleteSelect(state, action) {
    const isMail = obj => action.ids.some(id => id === obj._id)
    const setMail = obj => Object.assign({}, obj, { selected: false });
    return state.mails.map(mail => isMail(mail) ? setMail(mail) : mail);
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
      case 'mail/prefetch':
        return Object.assign({}, state, {
          mails:  action.mails
        });
      case 'mail/fetch':
        return Object.assign({}, state, {
          mails:  action.mails
        });
      case 'mail/create':
        return Object.assign({}, state, {
          mails:  [action.mail, ...state.mails]
        });
      case 'mail/update': 
        return Object.assign({}, state, {
          mails:  this.updateMail(state, action)
        });
      case 'mail/pagenation':
        return Object.assign({}, state, {
          page:   action.page
        });
      case 'mail/select':
        return Object.assign({}, state, {
          ids:    action.ids
        });
      case 'mail/delete':
        return Object.assign({}, state, {
          mails:  this.deleteMail(state, action)
        , ids:    []
        });
      case 'select/create':
        return Object.assign({}, state, {
          mails: this.createSelect(state, action)
        , ids:    []
        });
      case 'select/delete':
        return Object.assign({}, state, {
          mails: this.deleteSelect(state, action)
        , ids:    []
        });
      case 'mail/rehydrate':
        return    action.state;
      default: 
        return state; 
    } 
  } 
};
