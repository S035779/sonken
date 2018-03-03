import React from 'react';
import PropTypes from 'prop-types'

import { withStyles } from 'material-ui/styles';
import { IconButton } from 'material-ui';
import { Menu as MenuIcon } from 'material-ui-icons';
import LoginMenu from 'Components/LoginMenu/LoginMenu';
import LoginSwitch from 'Components/LoginMenu/LoginSwitch';
import RssButtonNav from 'Components/RssButtonNav/RssButtonNav';

class RssHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state ={ auth: true };
  }

  handleLogin(event, checked) {
    this.setState({ auth: checked });
  }

  handleMenu(event) {
    this.props.onClickMenu();
  }

  render() {
    const {classes} = this.props;
    const {auth} = this.state;
    return <div className={classes.navHeader}>
      <LoginSwitch auth={auth} onChange={this.handleLogin.bind(this)}/>
      <div className={classes.navBar}>
        <IconButton className={classes.navIcon}
          color="inherit" aria-label="open drawer"
          onClick={this.handleMenu.bind(this)}>
          <MenuIcon />
        </IconButton>
        <RssButtonNav />
        <div className={classes.loginIcon}>
        <LoginMenu auth={auth} />
        </div>
      </div>
    </div>;
  }
};
const navHeightSmDown = 56;
const navHeightSmUp = 64;
const styles = theme => ({
  navHeader:    { position: 'absolute', width: '100%' }
  , navIcon:    { marginLeft: -12, marginRight: 'auto' }
  , navBar:     { display: 'flex', flexDirection: 'row'
                , wordBreak: 'keep-all'
                , height: navHeightSmDown, padding: 2, overflow: 'scroll' 
                , [theme.breakpoints.up('sm')]: {
                  height: navHeightSmUp, padding: 6
                }
                }  
  , loginIcon:  { marginLeft: 'auto' }
});
RssHeader.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(RssHeader);
