import { ReduceStore }  from 'flux/utils';
import * as R           from 'ramda';
import std              from 'Utilities/stdutils';

export default class DashboardStore extends ReduceStore {
  getInitialState() {
    return { 
      user: ''
    , isAuthenticated: false
    , notes: []
    , page: { maxNumer: 0, number: 1, perPage: 20 }
    , selected:false
    , ids: []
    , filter: {
        lastWeekAuction: true
      , twoWeeksAuction: true
      , lastMonthAuction: true
      , allAuction: true
      , inAuction: false
      , aucStartTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
      , aucStopTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
      }
    , file: null
    , categorys: []
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
    const isItem = obj => R.any(id => id === obj.guid._)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { added: true }) : obj;
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  deleteAdd(state, action) {
    const isItem = obj => R.any(id => id === obj.guid._)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { added: false }) : obj;
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  createDelete(state, action) {
    const isItem = obj => R.any(id => id === obj.guid._)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { deleted: true }) : obj;
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  deleteDelete(state, action) {
    const isItem = obj => R.any(id => id === obj.guid._)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { deleted: false }) : obj;
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  createStar(state, action) {
    const isItem = obj => R.any(id => id === obj.guid._)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { starred: true }) : obj;
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  deleteStar(state, action) {
    const isItem = obj => R.any(id => id === obj.guid._)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { starred: false }) : obj;
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  createList(state, action) {
    const isItem = obj => R.any(id => id === obj.guid._)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { listed: true }) : obj;
    const setItems = R.map(setItem);
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
  }

  deleteList(state, action) {
    const isItem = obj => R.any(id => id === obj.guid._)(action.ids);
    const setItem = obj => isItem(obj) ? R.merge(obj, { listed: false }) : obj;
    const setItems = R.map(setItem)
    const setNote = obj => obj.items ? R.merge(obj, { items: setItems(obj.items) }) : obj; 
    const setNotes = R.map(setNote);
    return setNotes(state.notes);
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
          categorys:  [action.category, ...state.categorys]
        });
      case 'category/update': 
        return Object.assign({}, state, {
          categorys:  this.updateCategory(state, action)
        });
      case 'category/delete':
        return Object.assign({}, state, {
          categorys:  this.deleteCategory(state, action)
        });
      case 'note/prefetch/my':
        return Object.assign({}, state, {
          notes:  action.notes
        });
      case 'note/fetch/my':
        return Object.assign({}, state, {
          notes:  action.notes
        });
      case 'note/fetch': 
        return Object.assign({}, state, {
          notes:  this.fetchNote(state, action)
        });
      case 'note/create':
        return Object.assign({}, state, {
          notes:  [action.note, ...state.notes]
        });
      case 'note/update': 
        return Object.assign({}, state, {
          notes:  this.fetchNote(state, action)
        });
      case 'note/delete':
        return Object.assign({}, state, {
          notes:  this.deleteNote(state, action)
        , ids:    []
        });
      case 'note/pagenation':
        return Object.assign({}, state, {
          page:   action.page
        });
      case 'note/select':
        return Object.assign({}, state, {
          ids:    action.ids
        });
      case 'note/filter':
        return Object.assign({}, state, {
          filter: action.filter
        });
      case 'note/upload/my':
        return Object.assign({}, state, {
          notes:  action.notes
        });
      case 'note/download/my':
        return Object.assign({}, state, {
          file:  action.file
        });
      case 'note/download/items':
        return Object.assign({}, state, {
          file:  action.file
        });
      case 'add/create':
        return Object.assign({}, state, {
          notes: this.createAdd(state, action)
        , ids:    []
        });
      case 'add/delete':
        return Object.assign({}, state, {
          notes: this.deleteAdd(state, action)
        , ids:    []
        });
      case 'delete/create':
        return Object.assign({}, state, {
          notes: this.createDelete(state, action)
        , ids:    []
        });
      case 'delete/delete':
        return Object.assign({}, state, {
          notes: this.deleteDelete(state, action)
        , ids:    []
        });
      case 'read/create':
        return Object.assign({}, state, {
          notes: this.createRead(state, action)
        , ids:    []
        });
      case 'read/delete':
        return Object.assign({}, state, {
          notes: this.deleteRead(state, action)
        , ids:    []
        });
      case 'star/create':
        return Object.assign({}, state, {
          notes: this.createStar(state, action)
        , ids:    []
        });
      case 'star/delete':
        return Object.assign({}, state, {
          notes: this.deleteStar(state, action)
        , ids:    []
        });
      case 'list/create':
        return Object.assign({}, state, {
          notes: this.createList(state, action)
        , ids:    []
        });
      case 'list/delete':
        return Object.assign({}, state, {
          notes: this.deleteList(state, action)
        , ids:    []
        });
      case 'note/rehydrate/my':
        return action.state;
      default: 
        return state; 
    } 
  } 
}
DashboardStore.displayName = 'DashboardStore';

