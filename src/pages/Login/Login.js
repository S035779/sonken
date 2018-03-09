import React            from 'react';
import PropTypes        from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Container }    from 'flux/utils';
import { getStores, getState }
                        from 'Stores';
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';

class Login extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState('loginStore');
  }

  static prefetch(user) {
    std.logInfo(Login.displayName, 'prefetch', user);
    return LoginAction.presetUser(user);
  }

  render() {
    std.logInfo(Login.displayName, 'Props', this.props);
    std.logInfo(Login.displayName, 'State', this.state);
    const { classes, route } = this.props;
    const { user, isAuthenticated } = this.state;
    return <div className={classes.loginFrame}>
      <div className={classes.drawArea}>
      <div className={classes.space}/>
      <div className={classes.container}>
        {route.routes
          ? renderRoutes(route.routes, { user, isAuthenticated }) : null}
      </div>
      <div className={classes.space}/>
      </div>
    </div>;
  }
};

const loginWidth  = 640;
const loginHeight = 800;
const rowHeight = 62;
const styles = theme => ({
  loginFrame: { display: 'flex', flexDirection: 'column'
              , justifyContent: 'center', alignItems: 'center'
              , height: '100vh' }
, drawArea:   { height: '100%', overFlow: 'scroll'}
, space:      { minHeight: '5%' }
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
