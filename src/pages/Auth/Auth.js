import React from 'react';
import PropTypes from 'prop-types'
import { renderRoutes } from 'react-router-config';
import getRoutes from 'Main/routes';

import { withStyles } from 'material-ui/styles';
import { Reboot } from 'material-ui';
import ErrorBoundary from 'Components/ErrorBoundary/ErrorBoundary';

class Auth extends React.Component {
  render() {
    const { classes, route } = this.props;
    return <div className={classes.root}>
      <ErrorBoundary>
      <Reboot />
      <div className={classes.authFrame}>
        <div className={classes.content}>
          {renderRoutes(route.routes)}
        </div>
      </div>
      </ErrorBoundary>
    </div>;
  }
};

const styles = theme => ({
  root:       { width: '100%', zIndex: 1
              , overflow: 'hidden', height: '100vh' },
  authFrame:  { position: 'relative'
              , display: 'flex', flexDirection: 'column'
              , width: '100%'},
  content:    { position: 'absolute'
              , border: '1px solid #CCC'
              , width: '100%', height: '100vh' }
});
Auth.displayName = 'Auth';
Auth.defaultProps = {};
Auth.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(Auth);
