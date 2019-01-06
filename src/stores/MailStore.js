import { ReduceStore } from 'flux/utils';
import * as R from 'ramda';

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
      ? R.merge(mail, action.mail) : mail);
  }

  deleteMail(state, action) {
    const isMail = obj => action.ids.some(id => id === obj._id)
    return state.mails.filter(mail => !isMail(mail));
  }

  createSelect(state, action) {
    const isMail = obj => action.ids.some(id => id === obj._id)
    const setMail = obj => R.merge(obj, { selected: true });
    return state.mails.map(mail => isMail(mail) ? setMail(mail) : mail);
  }

  deleteSelect(state, action) {
    const isMail = obj => action.ids.some(id => id === obj._id)
    const setMail = obj => R.merge(obj, { selected: false });
    return state.mails.map(mail => isMail(mail) ? setMail(mail) : mail);
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'admin/preset':
        return R.merge(state, { admin:   action.admin, isAuthenticated: action.isAuthenticated })
      case 'login/authenticate':
        return R.merge(state, { isAuthenticated: action.isAuthenticated });
      //case 'mail/prefetch':
      //  return R.merge(state, { mails:  action.mails });
      case 'mail/fetch':
        return R.merge(state, { mails:  action.mails });
      case 'mail/create':
        return R.merge(state, { mails:  [action.mail, ...state.mails] });
      case 'mail/update': 
        return R.merge(state, { mails:  this.updateMail(state, action) });
      case 'mail/pagenation':
        return R.merge(state, { page:   action.page });
      case 'mail/select':
        return R.merge(state, { ids:    action.ids });
      case 'mail/delete':
        return R.merge(state, { mails:  this.deleteMail(state, action) , ids:    [] });
      case 'select/create':
        return R.merge(state, { mails: this.createSelect(state, action) , ids:    [] });
      case 'select/delete':
        return R.merge(state, { mails: this.deleteSelect(state, action) , ids:    [] });
      case 'mail/upload':
        return R.merge(state, { mail: this.updateMail(state, action) });
      case 'mail/rehydrate':
        return    action.state;
      default: 
        return state; 
    } 
  } 
}
MailStore.displayName = 'MailStore';

