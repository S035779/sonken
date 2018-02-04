import { Dispatcher } from 'flux';

let dispatcher;

export function createDispatcher() {
  dispatcher = new Dispatcher();
  return dispatcher;
};

export function dispatch(...args) {
  dispatcher.dispatch(...args);
};
