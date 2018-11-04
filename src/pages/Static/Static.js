import React              from 'react';
import PropTypes          from 'prop-types';
import { StaticRouter }   from 'react-router-dom';
import { renderRoutes }   from 'react-router-config';
import getRoutes          from 'Routes';

import { JssProvider }    from 'react-jss';
import { createGenerateClassName, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: { main: '#ffa726', light: '#ffd95b', dark: '#c77800', contrastText: '#fff' }
  , secondary: { main: '#e65100', light: '#ff833a', dark: '#ac1900', contrastText: '#fff' }  
  }
, typography: { useNextVariants: true }
});

export default class Static extends React.Component {
  render() {
    const { sheets, location } = this.props;
    const context = {};
    const routes = getRoutes();
    const classname = createGenerateClassName();
    return <JssProvider registry={sheets} generateClassName={classname}>
      <MuiThemeProvider theme={theme} sheetsManager={new Map()}>
        <StaticRouter location={location} context={context}>{renderRoutes(routes)}</StaticRouter>
      </MuiThemeProvider>
    </JssProvider>;
  }
}
Static.displayName = 'Static';
Static.defaultProps = {};
Static.propTypes = {
  sheets: PropTypes.object.isRequired
, location: PropTypes.string.isRequired
};
