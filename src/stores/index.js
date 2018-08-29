import DashboardStore     from 'Stores/DashboardStore';
import BidedNotesStore    from 'Stores/BidedNotesStore';
import TradedNotesStore   from 'Stores/TradedNotesStore';
import LoginStore         from 'Stores/LoginStore';
import ManagementStore    from 'Stores/ManagementStore';
import FaqStore           from 'Stores/FaqStore';
import MailStore          from 'Stores/MailStore';
import PostedFaqsStore    from 'Stores/PostedFaqsStore';

let stores;

export function createStores(dispatcher) {
  stores = {
    dashboardStore:     new DashboardStore(dispatcher)
  , bidedNotesStore:    new BidedNotesStore(dispatcher)
  , tradedNotesStore:   new TradedNotesStore(dispatcher)
  , loginStore:         new LoginStore(dispatcher)
  , managementStore:    new ManagementStore(dispatcher)
  , faqStore:           new FaqStore(dispatcher)
  , mailStore:          new MailStore(dispatcher)
  , postedFaqsStore:    new PostedFaqsStore(dispatcher)
  };
}

export function getStore(name) {
  return stores[name];
}

export function getStores(names) {
  return names.map(name => getStore(name));
}

export function getState(name) {
  return getStore(name).getState();
}

export function dehydrateState() {
  return {
    dashboardStore:     getState('dashboardStore')
  , bidedNotesStore:    getState('bidedNotesStore')
  , tradedNotesStore:   getState('tradedNotesStore')
  , loginStore:         getState('loginStore')
  , managementStore:    getState('managementStore')
  , faqStore:           getState('faqStore')
  , mailStore:          getState('mailStore')
  , postedFaqsStore:    getState('postedFaqsStore')
  };
}
