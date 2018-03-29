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
    , contrastText: '#FFFFFF'
    }
  , secondary: {
      main: '#E55200'
    , contrastText: '#FFFFFF'
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
