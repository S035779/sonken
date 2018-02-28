import NoteAction from 'Actions/NoteAction';
import BidsAction from 'Actions/BidsAction';
import TradeAction from 'Actions/TradeAction';

export function rehydrateState(state) {
  NoteAction.rehydrate(state);
  BidsAction.rehydrate(state);
  TradeAction.rehydrate(state);
};
