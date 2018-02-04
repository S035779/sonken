import DashboardStore from './DashboardStore';
import NoteStore from './NoteStore';
import StarredNotesStore from './StarredNotesStore';

let stores;

export function createStores(dispatcher) {
  stores = {
    dashboardStore: new DashboardStore(dispatcher),
    noteStore: new NoteStore(dispatcher),
    starredNotesStore: new StarredNotesStore(dispatcher)
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
    dashboardStore: getState('dashboardStore'),
    noteStore: getState('noteStore'),
    starredNotesStore: getState('starredNotesStore')
  };
};
