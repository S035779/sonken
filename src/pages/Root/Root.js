import React              from 'react';
import { BrowserRouter, Switch }
                          from 'react-router-dom';
import { renderRoutes }   from 'react-router-config';
import getRoutes          from 'Routes';

import { MuiThemeProvider, createMuiTheme } 
                          from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette:{
    primary: {
      main: '#ffa726'
    , light: '#ffd95b'
    , dark: '#c77800'
    , contrastText: '#fff'
    }
  , secondary: {
      main: '#e65100'
    , light: '#ff833a'
    , dark: '#ac1900'
    , contrastText: '#fff'
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
