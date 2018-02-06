import DashboardStore from 'Stores/DashboardStore';
import DraftsStore from 'Stores/DraftsStore';
import TrashStore from 'Stores/TrashStore';
import NoteStore from 'Stores/NoteStore';
import StarredNotesStore from 'Stores/StarredNotesStore';

let stores;

export function createStores(dispatcher) {
  stores = {
    dashboardStore: new DashboardStore(dispatcher),
    draftsStore: new DraftsStore(dispatcher),
    trashStore: new TrashStore(dispatcher),
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
    draftsStore: getState('draftsStore'),
    trashStore: getState('trashStore'),
    noteStore: getState('noteStore'),
    starredNotesStore: getState('starredNotesStore')
  };
};
