import React from 'react';
import PropTypes from 'prop-types'

import { withStyles } from 'material-ui/styles';
import { IconButton, Menu } from 'material-ui';
import { MenuItem } from 'material-ui/Menu';
import { AccountCircle as AccountCircle } from 'material-ui-icons';

class LoginMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state ={ anchorEl: null };
  }

  handleMenu(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  render() {
    const { auth } = this.props;
    const { anchorEl } = this.state;
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
};
const styles = theme => ({});
LoginMenu.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(LoginMenu);
