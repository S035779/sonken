import React            from 'react';
import PropTypes        from 'prop-types';
import { Redirect }     from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { Container }    from 'flux/utils';
import LoginAction       from 'Actions/LoginAction';
import {
  getStores, getState
}                       from 'Stores';

import { withStyles }   from 'material-ui/styles';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToRefferer: false
    };
  }

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

  handleLogin() {
    const { user, password } = this.state;
    LoginAction.authenticate(user, 'Test123$')
      .then(() => {
        if(this.state.isAuthenticated)
          this.setState({ redirectToRefferer: true });
      });
  }

  renderMessage(from) {
    return <div>
      <p>You must log in to view the page at {from}</p>
      <button onClick={this.handleLogin.bind(this)}>Log in</button>
    </div>
  }

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  }

  render() {
    this.logInfo('render', this.state);
    const { classes, location } = this.props;
    const { redirectToRefferer } = this.state;
    const from = location.state || { pathname: '/' };
    if(redirectToRefferer) return <Redirect to={from} />;
    const message = this.renderMessage(from.pathname);
    return <div className={classes.root}>
      <div className={classes.body}>
        <div className={classes.login}>
        {message}
        </div>
      </div>
    </div>;
  }
};

const loginWidth  = 640;
const loginHeight = 800;
const styles = theme => ({
  root:   { display: 'flex', flexDirection: 'column' }
, body:   { display: 'flex', flexDirection: 'row' }
, login:  { width: loginWidth, minWidth: loginWidth
          , height: loginHeight }
});
Login.displayName = 'Login';
Login.defaultProps = {};
Login.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Login));
