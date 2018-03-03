import React from 'react';
import PropTypes from 'prop-types'
import { renderRoutes } from 'react-router-config';
import getRoutes from 'Main/routes';

import { withStyles } from 'material-ui/styles';
import { Reboot } from 'material-ui';
import ErrorBoundary from 'Components/ErrorBoundary/ErrorBoundary';

class Login extends React.Component {
  render() {
    const { classes, route } = this.props;
    return <div className={classes.root}>
      <ErrorBoundary>
      <Reboot />
      <div className={classes.appFrame}>
      <div className={classes.content}>
      </div>
      </div>
      </ErrorBoundary>
    </div>;
  }
};

const barHeightSmUp = 112;
const barHeightSmDown = 104;
const styles = theme => ({
  root:     { width: '100%', zIndex: 1
            , overflow: 'hidden', height: '100vh' },
  appFrame: { position: 'relative'
            , display: 'flex', flexDirection: 'column'
            , width: '100%'},
  content:  { position: 'absolute'
            , border: '1px solid #CCC'
            , width: '80%'
            , height: `calc(100vh - ${barHeightSmDown}px)`
            , marginTop: barHeightSmDown
            , [theme.breakpoints.up('sm')]: {
              height: `calc(100vh - ${barHeightSmUp}px)`
            , marginTop: barHeightSmUp }}
});
Login.displayName = 'Login';
Login.defaultProps = {};
Login.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(Login);
