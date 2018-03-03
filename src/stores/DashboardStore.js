import { ReduceStore } from 'flux/utils';

const pspid = 'DashboardStore';

export default class DashboardStore extends ReduceStore {
  getInitialState() {
    return { 
      user: ''
      , notes:    []
      , page: {
        maxNumer: 0
      , number:   0
      , perPage:  20
      }
    , selected: false
    , ids:      []
    };
  }
  
  updateNote(state, action) {
    return state.notes.map(note => action.note.id === note.id
      ? Object.assign({}, note, action.note) : note);
  }

  deleteNote(state, action) {
    const isNote = obj => action.ids.some(id => id === obj.id)
    return state.notes.filter(note => !isNote(note));
  }

  createRead(state, action) {
    const isNote = obj => action.ids.some(id => id === obj.id)
    const setItem = obj => Object.assign({}, obj, { readed: true });
    const setItems = objs => objs.map(setItem)
    const setNote = obj => obj.items
      ? Object.assign({}, obj, { items: setItems(obj.items) }) : obj; 
    return state.notes.map(note => isNote(note) ? setNote(note) : note);
  }

  deleteRead(state, action) {
    const isNote = obj => action.ids.some(id => id === obj.id)
    const setItem = obj => Object.assign({}, obj, { readed: false });
    const setItems = objs => objs.map(setItem)
    const setNote = obj => obj.items
      ? Object.assign({}, obj, { items: setItems(obj.items) }) : obj; 
    return state.notes.map(note => isNote(note) ? setNote(note) : note);
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
        })
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
      case 'note/pagenation':
        return Object.assign({}, state, {
          page:   action.page
        });
      case 'note/select':
        return Object.assign({}, state, {
          ids:    action.ids
        });
      case 'note/delete':
        return Object.assign({}, state, {
          notes:  this.deleteNote(state, action)
        , ids:    []
        });
      case 'note/upload':
        return Object.assign({}, state, {
          notes:  [action.note, ...state.notes]
        });
      case 'note/download':
        return Object.assign({}, state, {
          notes:  action.notes
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
        return    action.state;
      default: 
        return state; 
    } 
  } 
};
