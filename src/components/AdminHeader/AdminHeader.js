import loadable             from '@loadable/component';
import React                from 'react';
import { withRouter }       from 'react-router-dom';
import PropTypes            from 'prop-types'
import LoginAction          from 'Actions/LoginAction';
import std                  from 'Utilities/stdutils';

import { withStyles }       from '@material-ui/core/styles';
import { IconButton }       from '@material-ui/core';
import { Menu as MenuIcon } from '@material-ui/icons';
const LoginSwitch    = loadable(() => import('Components/LoginSwitch/LoginSwitch'));
const AdminMenu      = loadable(() => import('Components/AdminMenu/AdminMenu'));
const AdminButtonNav = loadable(() => import('Components/AdminButtonNav/AdminButtonNav'));

class AdminHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: props.isAuthenticated
    };
  }

  handleLogin(event, checked) {
    const { admin, history } = this.props;
    this.setState({ auth: checked });
    if(!checked) LoginAction.signout(admin, true)
      .then(() => LoginAction.presetAdmin(''))
      .then(() => history.push('/login/authenticate'));
  }

  handleMenu(event) {
    std.logInfo(AdminHeader.displayName, 'handleMenu', event);
  }

  render() {
    const { classes, admin, preference, profile } = this.props;
    const { auth } = this.state;
    return <div className={classes.navHeader}>
      <LoginSwitch auth={auth} onChange={this.handleLogin.bind(this)}/>
      <div className={classes.navBar}>
        <IconButton className={classes.navIcon}
          color="inherit" aria-label="open drawer"
          onClick={this.handleMenu.bind(this)}>
          <MenuIcon />
        </IconButton>
        <AdminButtonNav />
        <div className={classes.loginIcon}>
        <AdminMenu auth={auth} admin={admin}
          preference={preference} profile={profile} />
        </div>
      </div>
    </div>;
  }
}

const navHeightSmDown = 56;
const navHeightSmUp = 64;
const styles = theme => ({
  navHeader:    { position: 'absolute', width: '100%' }
  , navIcon:    { marginLeft: -12, marginRight: 'auto' }
  , navBar:     { display: 'flex', flexDirection: 'row'
                , wordBreak: 'keep-all'
                , height: navHeightSmDown, padding: 2, overflow: 'hidden' 
                , [theme.breakpoints.up('sm')]: {
                  height: navHeightSmUp, padding: 6
                }
                }  
  , loginIcon:  { marginLeft: 'auto' }
});
AdminHeader.displayName = 'AdminHeader';
AdminHeader.defaultProps = {};
AdminHeader.propTypes = {
  classes:  PropTypes.object.isRequired
, isAuthenticated: PropTypes.bool.isRequired
, admin: PropTypes.string.isRequired
, history: PropTypes.object.isRequired
, preference: PropTypes.object.isRequired
, profile: PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(AdminHeader));
