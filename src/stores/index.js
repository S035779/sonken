import DashboardStore from 'Stores/DashboardStore';
import BidedNotesStore from 'Stores/BidedNotesStore';
import TradedNotesStore from 'Stores/TradedNotesStore';
import LoginStore from 'Stores/LoginStore';
import PublicStore from 'Stores/PublicStore';

let stores;

export function createStores(dispatcher) {
  stores = {
    dashboardStore: new DashboardStore(dispatcher)
  , bidedNotesStore: new BidedNotesStore(dispatcher)
  , tradedNotesStore: new TradedNotesStore(dispatcher)
  , loginStore: new LoginStore(dispatcher)
  , publicStore: new PublicStore(dispatcher)
  };
};

export function getStore(name) {
  return stores[name];
};

export function getStores(names) {
  return names.map(name => getStore(name));
};

export function getState(name) {
  return getStore(name).getState();
};

export function dehydrateState() {
  return {
    dashboardStore: getState('dashboardStore')
  , bidedNotesStore: getState('bidedNotesStore')
  , tradedNotesStore: getState('tradedNotesStore')
  , loginStore: getState('loginStore')
  , publicStore: getState('publicStore')
  };
};
