import React              from 'react';
import {
  BrowserRouter, Switch
}                         from 'react-router-dom';
import { renderRoutes }   from 'react-router-config';
import getRoutes          from 'Main/routes';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import { green, red } from 'material-ui/colors';

const theme = createMuiTheme();

export default class Root extends React.Component {
  componentDidMount() {
    const jssStyles = document.getElementById('jss-server-side');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  render() {
    const routes = getRoutes();
    return <MuiThemeProvider theme={theme}>
      <BrowserRouter>
        {renderRoutes(routes)}
      </BrowserRouter>
    </MuiThemeProvider>;
  }
};
