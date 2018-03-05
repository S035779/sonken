import React            from 'react';
import PropTypes        from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Container }    from 'flux/utils';
import { getStores, getState }
                        from 'Stores';
import LoginAction      from 'Actions/LoginAction';

import { withStyles }   from 'material-ui/styles';

class Login extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState('loginStore');
  }

  static prefetch(user) {
    console.info('prefetch', user);
    return LoginAction.presetUser(user);
  }

  logTrace(name, message) {
    console.trace('[TRACE]', name, message);
  }

  logInfo(name, message) {
    console.info('[INFO]', name, message);
  }

  render() {
    this.logInfo('Props', this.props);
    this.logInfo('State', this.state);
    const { classes, route } = this.props;
    const { isAuthenticated } = this.state;
    return <div className={classes.loginFrame}>
      <div className={classes.container}>
        {route.routes
          ? renderRoutes(route.routes, { isAuthenticated }) : null}
      </div>
    </div>;
  }
};

const loginWidth  = 640;
const loginHeight = 800;
const rowHeight = 62;
const styles = theme => ({
  loginFrame: { display: 'flex', justifyContent: 'center'
              , alignItems: 'center', height: '100vh' }
, container:  { width: loginWidth, height: loginHeight
              , border: '1px solid #CCC', borderRadius: 4
              , paddingLeft: theme.spacing.unit * 4
              , paddingRight: theme.spacing.unit * 4 }
});
Login.displayName = 'Login';
Login.defaultProps = {};
Login.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Login));
