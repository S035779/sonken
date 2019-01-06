import loadable         from '@loadable/component';
import React            from 'react';
import PropTypes        from 'prop-types'
import { withRouter }   from 'react-router-dom';
import LoginAction      from 'Actions/LoginAction';
//import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import { IconButton, Menu, Divider, ListItemIcon, MenuItem } from '@material-ui/core';
import { AccountCircle, ImportContacts, Feedback, PowerSettingsNew, SettingsEthernet } from '@material-ui/icons';
const LoginPreference = loadable(() => import('Components/LoginPreference/LoginPreference'));

class RssMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl:     null
    , isPreference: false
    };
  }

  componentDidMount() {
    //std.logInfo(RssMenu.displayName, 'fetch', 'RssMenu');
    if(this.props.isAuthenticated) {
      LoginAction.fetchPreference()
        .then(() => LoginAction.fetchProfile(this.props.user));
    }
  }

  handleLogout() {
    const { user, history } = this.props;
    LoginAction.signout(user, false)
      .then(() => LoginAction.presetUser(''))
      .then(() => history.push('/login/authenticate'));
  }

  handleClickButton(name) {
    const { history } = this.props;
    switch(name) {
      case 'faq':
        history.push('/faqs');
        break;
      case 'inquiry':
        history.push('/inquiry');
        break;
    }
  }

  handleMenu(event) {
    //std.logInfo(RssMenu.displayName, 'handleMenu', event.currentTarget);
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    //std.logInfo(RssMenu.displayName, 'handleClose', name);
    this.setState({ anchorEl: null});
  }

  handleOpenDialog(name) {
    //std.logInfo(RssMenu.displayName, 'handleOpenDialog', name);
    this.setState({ [name]: true });
  }

  handleCloseDialog(name) {
    //std.logInfo(RssMenu.displayName, 'handleCloseDialog', name);
    this.setState({ [name]: false });
  }

  render() {
    //std.logInfo(RssMenu.displayName, 'State', this.state);
    const { isAuthenticated, profile, preference } = this.props;
    const { anchorEl, isPreference } = this.state;
    const { name, user, plan } = profile;
    const open = Boolean(anchorEl);
    return isAuthenticated && (<div>
      <IconButton aria-owns={open ? 'menu-appbar' : null} aria-haspopup="true"
        onClick={this.handleMenu.bind(this)} color="inherit" ><AccountCircle /></IconButton>
      <Menu id="menu-appbar" anchorEl={anchorEl} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right'}} open={open}
        onClose={this.handleClose.bind(this)}>
        <MenuItem onClick={this.handleClickButton.bind(this, 'faq')}>
          <ListItemIcon><ImportContacts /></ListItemIcon>FAQ</MenuItem>
        <MenuItem onClick={this.handleClickButton.bind(this, 'inquiry')}>
          <ListItemIcon><Feedback /></ListItemIcon>Help Center</MenuItem>
        <MenuItem onClick={this.handleOpenDialog.bind(this, 'isPreference')}>
          <ListItemIcon><SettingsEthernet /></ListItemIcon>Setting</MenuItem>
        <Divider />
        <MenuItem onClick={this.handleLogout.bind(this)}>
          <ListItemIcon><PowerSettingsNew /></ListItemIcon>Log Out</MenuItem>
        <LoginPreference open={isPreference} profile={profile} preference={preference} name={name} user={user}
          plan={plan} onClose={this.handleCloseDialog.bind(this, 'isPreference')} />
      </Menu>
    </div>);
  }
}
RssMenu.displayName = 'RssMenu';
RssMenu.defaultProps = {};
RssMenu.propTypes = {
  classes:  PropTypes.object.isRequired
, user: PropTypes.string.isRequired
, history: PropTypes.object.isRequired
, isAuthenticated: PropTypes.bool.isRequired
, profile: PropTypes.object.isRequired
, preference: PropTypes.object.isRequired
};
const styles = theme => ({ title: { margin: theme.spacing.unit * 1.75 } });
export default withStyles(styles)(withRouter(RssMenu));
