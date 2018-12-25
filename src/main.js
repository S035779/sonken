import React                from 'react';
import { hydrate }          from 'react-dom';
import { createDispatcher } from 'Main/dispatcher';
import { rehydrateState }   from 'Main/actions';
import { createStores }     from 'Main/stores';
import Root                 from 'Pages/Root/Root';
import 'Assets/fonts/index.css';

const rootEl = document.getElementById('app');
const dataEl = document.getElementById('initial-data');
if(dataEl) {
  const data = JSON.parse(dataEl.getAttribute('data-init'));
  const dispatcher = createDispatcher();

  createStores(dispatcher);
  rehydrateState(data);
  hydrate(<Root />, rootEl);
}
