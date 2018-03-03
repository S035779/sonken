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
      const user = 'MyUserName';
      createStores(createDispatcher());
      const routes = getRoutes();
      const location = req.originalUrl;
      const matchs = matchRoutes(routes, location)
      console.log(matchs);
      this.getUserData(matchs, user)
      .then(objs => this.prefetchData(matchs, objs))
      .then(() => this.setInitialData(location).pipe(res))
      .then(() => next())
      .catch(err => res.status(500).send({ error:
          { name: err.name, message: err.message, stack: err.stack }}));
    };
  }

  setInitialData(location) {
    const initialData = JSON.stringify(dehydrateState());
    return ReactDOMServer.renderToStaticNodeStream(
      <Html initialData={initialData} location={location}/>
    );
  }

  prefetchData(matchs, objs) {
    console.log(objs);
    const promises = matchs.map(({ route, match }, index) =>
      route.component.prefetch 
        ? route.component.prefetch(objs[index], match)
        : Promise.resolve(null));
    return Promise.all(promises);
  }

  getUserData(matchs, user) {
    const  promises = matchs.map(({ route, match }) => 
      route.loadData
        ? route.loadData(user, match)
        : Promise.resolve(null));
    return Promise.all(promises);
  }
};
