import NoteAction from 'Actions/NoteAction';
import BidsAction from 'Actions/BidsAction';
import TradeAction from 'Actions/TradeAction';
import LoginAction from 'Actions/LoginAction';
import UserAction from 'Actions/UserAction';
import FaqAction from 'Actions/FaqAction';

export function rehydrateState(state) {
  NoteAction.rehydrate(state);
  BidsAction.rehydrate(state);
  TradeAction.rehydrate(state);
  LoginAction.rehydrate(state);
  UserAction.rehydrate(state);
  FaqAction.rehaydrate(state);
};
