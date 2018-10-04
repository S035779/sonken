import stream                           from 'stream';
import * as R                           from 'ramda';
import React                            from 'react';
import ReactDOMServer                   from 'react-dom/server';
import { matchRoutes }                  from 'react-router-config';
import { dehydrateState, createStores } from 'Stores';
import { createDispatcher }             from 'Main/dispatcher';
import getRoutes                        from 'Routes';
import log                              from 'Utilities/logutils';

import Html from 'Pages/Html/Html';

const docType = '<!DOCTYPE html>'

class ReactSSRenderer {
  constructor(options) {
    this.options = options;
  }

  static of(options) {
    return new ReactSSRenderer(options);
  }

  request() {
    return (req, res, next) => {
      const { user, admin } = req.session;
      const location = req.originalUrl;
      const category = R.split('/', location)[1];
      log.trace(ReactSSRenderer.displayName, 'Session', req.session);
      createStores(createDispatcher());
      const routes = getRoutes();
      const matchs = matchRoutes(routes, location);
      const appStream = this.setInitialData(location);
      const pass = new stream.PassThrough();
      pass.write(docType);
      this.getUserData(matchs, { user, admin, category })
        .then(objs => this.prefetchData(matchs, objs))
        .then(()   => appStream.pipe(pass).pipe(res))
        .then(()   => next())
        .catch(err => res.status(500).send({ error: { name: err.name, message: err.message, stack: err.stack }}));
    };
  }

  setInitialData(location) {
    const initialData = JSON.stringify(dehydrateState());
    //log.debug(ReactSSRenderer.displayName, 'InitialData:', initialData, location);
    return ReactDOMServer.renderToStaticNodeStream(<Html initialData={initialData} location={location}/>);
  }

  prefetchData(matchs, objs) {
    const promises = matchs.map(({ route, match }, index) => {
      //log.debug(ReactSSRenderer.displayName, 'prefetchData:', route, match);
      return route.component.prefetch 
        ? route.component.prefetch(objs[index], match) 
        : Promise.resolve(null)
    });
    return Promise.all(promises);
  }

  getUserData(matchs, options) {
    const  promises = matchs.map(({ route, match }) => {
      //log.debug(ReactSSRenderer.displayName, 'getUserData:', route, match);
      return route.loadData 
        ? route.loadData(options, match) 
        : Promise.resolve(null);
    });
    return Promise.all(promises);
  }
}
ReactSSRenderer.displayName = 'ReactSSRenderer';
export default ReactSSRenderer;
