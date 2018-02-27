import { ReduceStore } from 'flux/utils';

const pspid = 'DashboardStore';

export default class DashboardStore extends ReduceStore {
  getInitialState() {
    return { 
      notes:    []
      , page: {
        maxNumer: 0
      , number:   0
      , perPage:  20
      }
      , filter: {
        endBidding:   true
      , allBidding:   true
      , inBidding:    false
      , bidStartTime: 0
      , bidStopTime:  0
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
    return state.notes.map(note => isNote(note) ? Object.assign({}, note
    , { readed: true }) : note);
  }

  deleteRead(state, action) {
    const isNote = obj => action.ids.some(id => id === obj.id)
    return state.notes.map(note => isNote(note) ? Object.assign({}, note
    , { readed: false }) : note);
  }

  deleteItem(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const delItems = objs => objs.filter(item => !isItem(item));
    return state.notes.map(note => note.items ? Object.assign({}, note
    , { items: delItems(note.items) }) : note );
  }

  createTrade(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj) ? Object.assign({}, obj
    , { traded: true }) : obj;
    const setItems = objs => objs.map(item =>setItem(item))
    return state.notes.map(note => note.items ? Object.assign({}, note
    , { items: setItems(note.items) }) : note );
  }

  deleteTrade(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj) ? Object.assign({}, obj
    , { traded: false }) : obj;
    const setItems = objs => objs.map(item =>setItem(item))
    return state.notes.map(note => note.items ? Object.assign({}, note
    , { items: setItems(note.items) }) : note );
  }

  createBids(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj)? Object.assign({}, obj
    , { bided: true }) : obj;
    const setItems = objs => objs.map(item =>setItem(item))
    return state.notes.map(note => note.items ? Object.assign({}, note
    , { items: setItems(note.items) }) : note );
  }

  deleteBids(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj) ? Object.assign({}, obj
    , { bided: false }) : obj;
    const setItems = objs => objs.map(item =>setItem(item))
    return state.notes.map(note => note.items ? Object.assign({}, note
    , { items: setItems(note.items) }) : note );
  }

  createStar(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj)? Object.assign({}, obj
    , { starred: true }) : obj;
    const setItems = objs => objs.map(item =>setItem(item))
    return state.notes.map(note => note.items ? Object.assign({}, note
    , { items: setItems(note.items) }) : note );
  }

  deleteStar(state, action) {
    const isItem = obj => action.ids.some(id => id === obj.guid._);
    const setItem = obj => isItem(obj) ? Object.assign({}, obj
    , { starred: false }) : obj;
    const setItems = objs => objs.map(item =>setItem(item))
    return state.notes.map(note => note.items ? Object.assign({}, note
    , { items: setItems(note.items) }) : note );
  }

  reduce(state, action) {
    switch (action.type) { 
      case 'note/rehydrate/my':
        return    action.state;
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
      case 'star/create/read':
        return Object.assign({}, state, {
          notes: this.createRead(state, action)
        , ids:    []
        });
      case 'star/delete/read':
        return Object.assign({}, state, {
          notes: this.deleteRead(state, action)
        , ids:    []
        });
      case 'item/delete':
        return Object.assign({}, state, {
          notes:  this.deleteItem(state, action)
        , ids:    []
        });
      case 'item/filter':
        return Object.assign({}, state, {
          filter: action.filter
        });
      case 'star/create/trade':
        return Object.assign({}, state, {
          notes: this.createTrade(state, action)
        , ids:    []
        });
      case 'star/delete/trade':
        return Object.assign({}, state, {
          notes: this.deleteTrade(state, action)
        , ids:    []
        });
      case 'star/create/bids':
        return Object.assign({}, state, {
          notes: this.createBids(state, action)
        , ids:    []
        });
      case 'star/delete/bids':
        return Object.assign({}, state, {
          notes: this.deleteBids(state, action)
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
      default: 
        return state; 
    } 
  } 
};
