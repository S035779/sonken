import React            from 'react';
import PropTypes        from 'prop-types'
import { withRouter }   from 'react-router-dom';
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import { IconButton, Menu, Divider, ListItemIcon, MenuItem } from '@material-ui/core';
import { AccountCircle, ImportContacts, Feedback, PowerSettingsNew, SettingsEthernet } from '@material-ui/icons';
import LoginPreference  from 'Components/LoginPreference/LoginPreference';

class RssMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl:     null
    , isPreference: false
    };
  }

  componentDidMount() {
    if(!this.props.user) return;
    std.logInfo(RssMenu.displayName, 'fetch', 'RssMenu');
    LoginAction.fetchPreference()
      .then(() => LoginAction.fetchProfile(this.props.user));
  }

  handleLogin(event, checked) {
    const { user, history } = this.props;
    this.setState({ auth: checked });
    if(!checked) LoginAction.signout(user, false)
      .then(() => LoginAction.presetUser(''))
      .then(() => history.push('/login/authenticate'));
  }

  handleClickButton(name, event) {
    switch(name) {
      case 'faq':
        this.props.history.push('/faqs');
        break;
      case 'inquiry':
        this.props.history.push('/inquiry');
        break;
    }
  }

  handleMenu(event) {
    std.logInfo(RssMenu.displayName, 'handleMenu', event.currentTarget);
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose(name, event) {
    std.logInfo(RssMenu.displayName, 'handleClose', name);
    this.setState({ anchorEl: null});
  }

  handleOpenDialog(name, event) {
    std.logInfo(RssMenu.displayName, 'handleOpenDialog', name);
    this.setState({ [name]: true });
  }

  handleCloseDialog(name, event) {
    std.logInfo(RssMenu.displayName, 'handleCloseDialog', name);
    this.setState({ [name]: false });
  }

  render() {
    //std.logInfo(RssMenu.displayName, 'State', this.state);
    const { classes, auth, profile, preference } = this.props;
    const { anchorEl, isPreference } = this.state;
    const { name, user, kana, email, phone, plan } = profile;
    const open = Boolean(anchorEl);
    return auth && (<div>
      <IconButton
        aria-owns={open ? 'menu-appbar' : null}
        aria-haspopup="true"
        onClick={this.handleMenu.bind(this)}
        color="inherit" ><AccountCircle /></IconButton>
      <Menu id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right'}}
        open={open}
        onClose={this.handleClose.bind(this)}>
        <MenuItem
          onClick={this.handleClickButton.bind(this, 'faq')}>
          <ListItemIcon><ImportContacts /></ListItemIcon>
          FAQ
        </MenuItem>
        <MenuItem
          onClick={this.handleClickButton.bind(this, 'inquiry')}>
          <ListItemIcon><Feedback /></ListItemIcon>
          Help Center
        </MenuItem>
        <MenuItem
          onClick={this.handleOpenDialog.bind(this, 'isPreference')}>
          <ListItemIcon><Settings /></ListItemIcon>
          Setting
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={this.handleLogin.bind(this)}>
          <ListItemIcon><PowerSettingsNew /></ListItemIcon>
          Log Out
        </MenuItem>
        <LoginPreference
          open={isPreference}
          profile={profile}
          preference={preference}
          name={name}
          user={user}
          plan={plan} 
          onClose={this.handleCloseDialog.bind(this, 'isPreference')}
        />
      </Menu>
    </div>);
  }
};
const styles = theme => ({
  title: { margin: theme.spacing.unit * 1.75 }
});
RssMenu.displayName = 'RssMenu';
RssMenu.defaultProps = {};
RssMenu.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(RssMenu));
