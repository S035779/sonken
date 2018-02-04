import NoteAction from './NoteAction';
import StarAction from './StarAction';

export function rehydrateState(state) {
  NoteAction.rehydrate(state);
  StarAction.rehydrate(state);
};
