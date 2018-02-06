import React from 'react';
import PropTypes from 'prop-types'
import { withRouter } from 'react-router';

import { withStyles } from 'material-ui/styles';
import { AppBar, Toolbar, Typography
       , IconButton, Switch, Menu, Button } from 'material-ui';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import { MenuItem } from 'material-ui/Menu';
import { Menu as MenuIcon
       , AccountCircle as AccountCircle } from 'material-ui-icons';

class GlobalHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      auth: true,
      anchorEl: null
    };
  }

  handleChange(event, checked) {
    this.setState({ auth: checked });
  }

  handleMenu(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  handleStarred() {
    this.props.history.push('/starred');
  }

  handleClickNav() {
    this.props.onClickNav();
  }

  renderSwitch(auth) {
    return <Switch checked={auth}
      onChange={this.handleChange.bind(this)}
      aria-label="LoginSwitch" />;
  }

  renderIcon(auth, anchorEl) {
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
        <MenuItem onClick={this.handleClose.bind(this)}>
          Profile
        </MenuItem>
        <MenuItem onClick={this.handleClose.bind(this)}>
          My account
        </MenuItem>
      </Menu>
    </div>);
  }

  render() {
    const {classes} = this.props;
    const {auth, anchorEl} = this.state;
    const renderSwitch = this.renderSwitch(auth);
    const renderIcon = this.renderIcon(auth, anchorEl);
    return <div className={classes.appBar}>
      <FormGroup>
      <FormControlLabel
        control={renderSwitch}
        label={auth ? 'Logout' : 'Login'} />
      </FormGroup>
      <AppBar position="static">
      <Toolbar>
        <IconButton className={classes.navIcon}
          color="inherit" aria-label="open drawer"
          onClick={this.handleClickNav.bind(this)}>
        <MenuIcon />
        </IconButton>
        <Typography type="title" color="inherit" 
          className={classes.title} noWrap>Watch Note</Typography>
        <Button color="inherit"
          onClick={this.handleStarred.bind(this)}>Starred</Button>
        {renderIcon}
      </Toolbar>
      </AppBar>
    </div>;
  }
};

const drawerWidthMdUp = 240;
const styles = theme => ({
  appBar:     { position: 'absolute'
              , width: '100%'
              , [theme.breakpoints.up('md')]: {
                  width: `calc(100% - ${drawerWidthMdUp}px)`
                , marginLeft: drawerWidthMdUp
              }},
  title:      { flex: 1 },
  navIcon:    { marginLeft: -12, marginRight: 20
              , [theme.breakpoints.up('md')]: {
                  display: 'none'
              }}
});

GlobalHeader.propTypes = {
  classes:  PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(GlobalHeader));
