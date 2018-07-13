import { ReduceStore } from 'flux/utils';

const displayName = 'DashboardStore';

export default class DashboardStore extends ReduceStore {
  getInitialState() {
    return { 
      user: ''
    , isAuthenticated: false
    , notes: []
    , page: {
        maxNumer: 0
      , number:   0
      , perPage:  20
      }
    , selected:false
    , ids:     []
    , filter: {
        lastWeekAuction:  true
      , twoWeeksAuction:  true
      , lastMonthAuction: true
      , allAuction:       true
      , inAuction:        false
      , aucStartTime:     0
      , aucStopTime:      0
      }
    , file: null
    , categorys: []
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

  updateNote(state, action) {
    return state.notes.map(note => action.id === note._id
      ? Object.assign({}, note, action.note) : note);
  }

  deleteNote(state, action) {
    const isNote = obj => action.ids.some(id => id === obj._id)
    return state.notes.filter(note => !isNote(note));
  }

  createRead(state, action) {
    const isNote = obj => action.ids.some(id => id === obj._id)
    const setItem = obj => Object.assign({}, obj, { readed: true });
    const setItems = objs => objs.map(setItem)
    const setNote = obj => obj.items
      ? Object.assign({}, obj, { items: setItems(obj.items) }) : obj; 
    return state.notes.map(note => isNote(note) ? setNote(note) : note);
  }

  deleteRead(state, action) {
    const isNote = obj => action.ids.some(id => id === obj._id)
    const setItem = obj => Object.assign({}, obj, { readed: false });
    const setItems = objs => objs.map(setItem)
    const setNote = obj => obj.items
      ? Object.assign({}, obj, { items: setItems(obj.items) }) : obj; 
    return state.notes.map(note => isNote(note) ? setNote(note) : note);
  }

  createAdd(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj)
      ? Object.assign({}, obj, { added: true }) : obj;
    const setItems = objs => objs.map(setItem)
    const setNote = obj => obj.items
      ? Object.assign({}, obj, { items: setItems(obj.items) }) : obj; 
    return state.notes.map(setNote);
  }

  deleteAdd(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj)
      ? Object.assign({}, obj, { added: false }) : obj;
    const setItems = objs => objs.map(setItem)
    const setNote = obj => obj.items
      ? Object.assign({}, obj, { items: setItems(obj.items) }) : obj; 
    return state.notes.map(setNote);
  }

  createDelete(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj)
      ? Object.assign({}, obj, { deleted: true }) : obj;
    const setItems = objs => objs.map(setItem)
    const setNote = obj => obj.items
      ? Object.assign({}, obj, { items: setItems(obj.items) }) : obj; 
    return state.notes.map(setNote);
  }

  deleteDelete(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj)
      ? Object.assign({}, obj, { deleted: false }) : obj;
    const setItems = objs => objs.map(setItem)
    const setNote = obj => obj.items
      ? Object.assign({}, obj, { items: setItems(obj.items) }) : obj; 
    return state.notes.map(setNote);
  }

  createStar(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj)
      ? Object.assign({}, obj, { starred: true }) : obj;
    const setItems = objs => objs.map(setItem)
    const setNote = obj => obj.items
      ? Object.assign({}, obj, { items: setItems(obj.items) }) : obj; 
    return state.notes.map(setNote);
  }

  deleteStar(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj)
      ? Object.assign({}, obj, { starred: false }) : obj;
    const setItems = objs => objs.map(setItem)
    const setNote = obj => obj.items
      ? Object.assign({}, obj, { items: setItems(obj.items) }) : obj; 
    return state.notes.map(setNote);
  }

  createList(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj)
      ? Object.assign({}, obj, { listed: true }) : obj;
    const setItems = objs => objs.map(setItem)
    const setNote = obj => obj.items
      ? Object.assign({}, obj, { items: setItems(obj.items) }) : obj; 
    return state.notes.map(setNote);
  }

  deleteList(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj)
      ? Object.assign({}, obj, { listed: false }) : obj;
    const setItems = objs => objs.map(setItem)
    const setNote = obj => obj.items
      ? Object.assign({}, obj, { items: setItems(obj.items) }) : obj; 
    return state.notes.map(setNote);
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
      case 'note/create':
        return Object.assign({}, state, {
          notes:  [action.note, ...state.notes]
        });
      case 'note/update': 
        return Object.assign({}, state, {
          notes:  this.updateNote(state, action)
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
};
