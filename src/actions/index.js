import NoteAction from 'Actions/NoteAction';
import BidsAction from 'Actions/BidsAction';
import TradeAction from 'Actions/TradeAction';
import LoginAction from 'Actions/LoginAction';
import PublicAction from 'Actions/PublicAction';

export function rehydrateState(state) {
  NoteAction.rehydrate(state);
  BidsAction.rehydrate(state);
  TradeAction.rehydrate(state);
  LoginAction.rehydrate(state);
  PublicAction.rehydrate(state);
};
