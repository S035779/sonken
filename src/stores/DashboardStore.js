import * as R           from 'ramda';
import { ReduceStore }  from 'flux/utils';
import std              from 'Utilities/stdutils';

export default class DashboardStore extends ReduceStore {
  getInitialState() {
    return { 
      user: ''
    , isAuthenticated: false
    , notes: []
    , page: { maxNumer: 0, number: 1, perPage: 20 }
    , selected: false
    , ids: []
    , filter: {
        lastWeekAuction: true
      , twoWeeksAuction: true
      , lastMonthAuction: true
      , allAuction: true
      , inAuction: false
      , aucStartTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
      , aucStopTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
      , sold: 0
      }
    , file: null
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
    , categorys: []
    , images: null
    , status: null
    };
  }
  
  updateCategory(state, action) {
    const setCategory = category => action.id === category._id ? R.merge(category, action.category) : category;
    const setCategorys = R.map(setCategory);
    return setCategorys(state.categorys);
  }

  deleteCategory(state, action) {
    const isCategory = obj => R.any(id => id === obj._id)(action.ids);
    const hasCategorys = R.filter(category => !isCategory(category));
    return hasCategorys(state.categorys);
  }

  fetchNote(state, action) {
    const setNote = note => action.id === note._id ? R.merge(note, action.note) : note;
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  deleteNote(state, action) {
    const isNote = obj => R.any(id => id === obj._id)(action.ids);
    const hasNotes = R.filter(note => !isNote(note))
    return hasNotes(state.notes);
  }

  createRead(state, action) {
    const setItem = obj => R.merge(obj, { readed: true });
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const isNote = obj => R.any(id => id === obj._id)(action.ids);
    const setNotes = R.map(note => isNote(note) ? setNote(note) : note);
    return setNotes(state.notes);
  }

  deleteRead(state, action) {
    const setItem = obj => R.merge(obj, { readed: false });
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const isNote = obj => R.any(id => id === obj._id)(action.ids);
    const setNotes = R.map(note => isNote(note) ? setNote(note) : note);
    return setNotes(state.notes);
  }

  createAdd(state, action) {
    const isItem = obj => R.any(id => id === obj.guid__)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { added: true }) : obj;
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  deleteAdd(state, action) {
    const isItem = obj => R.any(id => id === obj.guid__)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { added: false }) : obj;
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  createDelete(state, action) {
    const isItem = obj => R.any(id => id === obj.guid__)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { deleted: true }) : obj;
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  deleteDelete(state, action) {
    const isItem = obj => R.any(id => id === obj.guid__)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { deleted: false }) : obj;
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  createStar(state, action) {
    const isItem = obj => R.any(id => id === obj.guid__)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { starred: true }) : obj;
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  deleteStar(state, action) {
    const isItem = obj => R.any(id => id === obj.guid__)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { starred: false }) : obj;
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  createList(state, action) {
    const isItem = obj => R.any(id => id === obj.guid__)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { listed: true }) : obj;
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  deleteList(state, action) {
    const isItem = obj => R.any(id => id === obj.guid__)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { listed: false }) : obj;
    const setItems = R.map(setItem)
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'user/preset':
        return R.merge(state, { user: action.user, isAuthenticated: action.isAuthenticated })
      case 'login/authenticate':
        return R.merge(state, { isAuthenticated: action.isAuthenticated });
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
      case 'note/prefetch/my':
        return R.merge(state, { notes: action.notes });
      case 'note/fetch/my':
        return R.merge(state, { notes: action.notes });
      case 'note/fetch': 
        return R.merge(state, { notes: this.fetchNote(state, action) });
      case 'note/create':
        return R.merge(state, { notes: [action.note, ...state.notes] });
      case 'note/update': 
        return R.merge(state, { notes: this.fetchNote(state, action) });
      case 'note/delete':
        return R.merge(state, { notes: this.deleteNote(state, action) });
      case 'note/pagenation':
        return R.merge(state, { page: action.page });
      case 'note/select':
        return R.merge(state, { ids: action.ids });
      case 'note/filter':
        return R.merge(state, { filter: action.filter });
      case 'note/upload/my':
        return R.merge(state, { notes: action.notes });
      case 'note/download/my':
        return R.merge(state, { file: action.file });
      case 'note/download/items':
        return R.merge(state, { file: action.file });
      case 'note/download/images':
        return R.merge(state, { images: action.images });
      case 'job/create':
        return R.merge(state, { status: action.status });
      case 'add/create':
        return R.merge(state, { notes: this.createAdd(state, action) });
      case 'add/delete':
        return R.merge(state, { notes: this.deleteAdd(state, action) });
      case 'delete/create':
        return R.merge(state, { notes: this.createDelete(state, action) });
      case 'delete/delete':
        return R.merge(state, { notes: this.deleteDelete(state, action) });
      case 'read/create':
        return R.merge(state, { notes: this.createRead(state, action) });
      case 'read/delete':
        return R.merge(state, { notes: this.deleteRead(state, action) });
      case 'star/create':
        return R.merge(state, { notes: this.createStar(state, action) });
      case 'star/delete':
        return R.merge(state, { notes: this.deleteStar(state, action) });
      case 'list/create':
        return R.merge(state, { notes: this.createList(state, action) });
      case 'list/delete':
        return R.merge(state, { notes: this.deleteList(state, action) });
      case 'note/rehydrate/my':
        return action.state;
      default: 
        return state; 
    } 
  } 
}
DashboardStore.displayName = 'DashboardStore';

