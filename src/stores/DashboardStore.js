import { ReduceStore } from 'flux/utils';

const pspid = 'DashboardStore';

export default class DashboardStore extends ReduceStore {
  getInitialState() {
    return { 
      notes: []
    , page: {
        maxNumer: 0
      , number: 0
      , perPage: 20
    }
    , selected: false
    , ids: []
    };
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
          notes:  state.notes.map(note => action.id === note.id
              ? Object.assign({}, note, action.note) : note )
        });
      case 'note/pagenation':
        return Object.assign({}, state, {
          notes:  action.notes 
        , page:   action.page
        });
      case 'note/select':
        return Object.assign({}, state, {
          ids:    action.ids
        });
      case 'note/delete':
        return Object.assign({}, state, {
          notes:  action.notes
        , ids:    action.ids
        });
      default: 
        return state; 
    } 
  } 
};
