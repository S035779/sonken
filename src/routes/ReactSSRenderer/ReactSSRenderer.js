import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { matchRoutes } from 'react-router-config';
import { dehydrateState, createStores } from 'Stores';
import { createDispatcher } from 'Main/dispatcher';
import getRoutes from 'Main/routes';
import { logs as log } from 'Utilities/logutils';

import Html from 'Pages/Html/Html';

export default class ReactSSRenderer {
  constructor(options) {
    this.options = options;
  }

  static of(options) {
    return new ReactSSRenderer(options);
  }

  request() {
    return (req, res, next) => {
      createStores(createDispatcher());
      const routes = getRoutes();
      const location = req.originalUrl;
      const matchs = matchRoutes(routes, location)
      console.log(matchs, location);
      this.getUserData(matchs)
      .then(objs => this.prefetch(matchs, objs[0]))
      .then(() => this.setInitialData(location).pipe(res))
      .then(() => next())
      .catch(err => res.status(500)
        .send({ error:
          { name: err.name, message: err.message, stack: err.stack }
        })
      );
    };
  }

  setInitialData(location) {
    const initialData = JSON.stringify(dehydrateState());
    return ReactDOMServer.renderToStaticNodeStream(
      <Html initialData={initialData} location={location}/>
    );
  }

  prefetch(matchs, data) {
    let promises = [];
    matchs.some(({ route, match }) => {
      if(route.component.prefetch)
        promises.push(route.component.prefetch(data));
      return route.component.prefetch;
    });
    return Promise.all(promises);
  }

  getUserData(matchs) {
    let promises = [];
    matchs.some(({ route, match }) => {
      if(route.loadData) promises.push(route.loadData(match));
      return route.loadData;
    });
    return Promise.all(promises);
  }
};
