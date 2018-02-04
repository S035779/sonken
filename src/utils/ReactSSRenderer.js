import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { matchRoutes } from 'react-router-config';
import { dehydrateState, createStores } from 'Stores';
import { createDispatcher } from 'Main/dispatcher';
import getRoutes from 'Main/routes';

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
      this.prefetch(matchs).then(() => {
        const initialData = JSON.stringify(dehydrateState());
        ReactDOMServer
          .renderToStaticNodeStream(
            <Html initialData={initialData} location={location}/>)
          .pipe(res);
        next();
      }).catch(err => {
        res.status(500)
          .send({ error:
            { name: err.name, message: err.message, stack: err.stack }
          });
      });
    };
  }

  prefetch(matchs) {
    const promises = matchs.map(({ route, match }) =>
      route.component.prefetch
        ? route.component.prefetch(match) : Promise.resolve(null));
    return Promise.all(promises);
  }
};
