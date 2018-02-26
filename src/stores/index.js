import DashboardStore from 'Stores/DashboardStore';

let stores;

export function createStores(dispatcher) {
  stores = {
    dashboardStore: new DashboardStore(dispatcher)
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
  };
};
