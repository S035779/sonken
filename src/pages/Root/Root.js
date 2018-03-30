import React              from 'react';
import { BrowserRouter, Switch }
                          from 'react-router-dom';
import { renderRoutes }   from 'react-router-config';
import getRoutes          from 'Routes';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';

const theme = createMuiTheme({
  palette:{
    primary: {
      main: '#FEA826'
    , contrastText: '#FFF'
    }
  , secondary: {
      main: '#E55200'
    , contrastText: '#FFF'
    }
  , error: {
      main: '#FA404B'
    , contrastText: '#FFF'
    }
  }
});

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
