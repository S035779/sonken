import React from 'react';
import { hydrate, unmountComponentAtNode } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { createDispatcher } from './dispatcher';
import { rehydrateState } from './actions';
import { createStores } from './stores';
import Root from './pages/Root/Root';

const dispatcher = createDispatcher();
createStores(dispatcher);
rehydrateState(JSON.parse(
  document.getElementById('initial-data').getAttribute('data-init')
));
const rootEl = document.getElementById('app');
const renderRoot = () => {
  hydrate(
    <AppContainer>
      <Root />
    </AppContainer>
    , rootEl,
  );
};

if (module.hot) {
  module.hot.accept('./pages/Root/Root' , () => {
    setImmediate(() => {
      unmountComponentAtNode(rootEl);
      renderRoot();
    });
  });
}

renderRoot()
