import React            from 'react';
import PropTypes        from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Container }    from 'flux/utils';
import { getStores, getState }
                        from 'Stores';
import LoginAction      from 'Actions/LoginAction';
//import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';

class Login extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState('loginStore');
  }

  static prefetch(options) {
    const { user, admin } = options;
    //std.logInfo(Login.displayName, 'prefetch', options);
    if(user) return LoginAction.presetUser(user);
    if(admin) return LoginAction.presetAdmin(admin);
  }

  render() {
    //std.logInfo(Login.displayName, 'State', this.state);
    //std.logInfo(Login.displayName, 'Props', this.props);
    const { classes, route } = this.props;
    const { user, isAuthenticated, preference } = this.state;
    return <div className={classes.loginFrame}>
        { route.routes ? renderRoutes(route.routes, { user, isAuthenticated, preference }) : null }
      </div>;
  }
}
Login.displayName = 'Login';
Login.defaultProps = {};
Login.propTypes = { classes: PropTypes.object.isRequired, route: PropTypes.object.isRequired };
const styles = {
  loginFrame: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
              , height: '100%' }
};
export default withStyles(styles)(Container.create(Login));
