import React              from 'react';
import { BrowserRouter }  from 'react-router-dom';
import { renderRoutes }   from 'react-router-config';
//import { hot }            from 'react-hot-loader/root';
import getRoutes          from 'Routes';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette:{
    primary: { main: '#ffa726', light: '#ffd95b', dark: '#c77800', contrastText: '#fff' }
  , secondary: { main: '#e65100', light: '#ff833a', dark: '#ac1900', contrastText: '#fff' }
  }
, typography: { useNextVariants: true }
});

class Root extends React.Component {
  componentDidMount() {
    const jssEl = document.getElementById('jss-server-side');
    if (jssEl && jssEl.parentNode) jssEl.parentNode.removeChild(jssEl);
  }

  render() {
    const routes = getRoutes();
    return (
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          {renderRoutes(routes)}
        </BrowserRouter>
      </MuiThemeProvider>
    );
  }
}
export default Root;
//export default hot(Root);
