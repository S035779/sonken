import React from 'react';
import PropTypes from 'prop-types'
import { withRouter } from 'react-router';

import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import AccountCircle from 'material-ui-icons/AccountCircle';
import Switch from 'material-ui/Switch';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import Menu, { MenuItem } from 'material-ui/Menu';
import Button from 'material-ui/Button';

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

  render() {
    const {classes} = this.props;
    const {auth, anchorEl} = this.state;
    const open = Boolean(anchorEl);
    return <div className={classes.root}>
      <FormGroup>
      <FormControlLabel
        control={
          <Switch checked={auth}
            onChange={this.handleChange.bind(this)}
            aria-label="LoginSwitch" />
        }
        label={auth ? 'Logout' : 'Login'} />
      </FormGroup>
      <AppBar position="static"><Toolbar>
        <IconButton className={classes.menuButton}
          color="inherit" aria-label="Menu">
        <MenuIcon />
        </IconButton>
        <Typography className={classes.title}
          type="title" color="inherit" >Watch Note</Typography>
          <Button color="inherit"
            onClick={this.handleStarred.bind(this)}>Starred</Button>
          {auth && (
            <div>
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
            </div>
          )}
      </Toolbar></AppBar>
      </div>;
  }
};

const styles = {
  root:       { width: '100%' },
  title:      { flex: 1 },
  menuButton: { marginLeft: -12, marginRight: 20 }
};

GlobalHeader.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(GlobalHeader));
