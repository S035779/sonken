import DashboardStore from 'Stores/DashboardStore';
import BidedNotesStore from 'Stores/BidedNotesStore';
import TradedNotesStore from 'Stores/TradedNotesStore';

let stores;

export function createStores(dispatcher) {
  stores = {
    dashboardStore: new DashboardStore(dispatcher)
  , bidedNotesStore: new BidedNotesStore(dispatcher)
  , tradedNotesStore: new TradedNotesStore(dispatcher)
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
  };
};
