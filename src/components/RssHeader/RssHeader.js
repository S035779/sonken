import React          from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes      from 'prop-types'
import LoginAction    from 'Actions/LoginAction';

import { withStyles } from 'material-ui/styles';
import { IconButton } from 'material-ui';
import {
  Menu as MenuIcon
}                     from 'material-ui-icons';
import LoginSwitch    from 'Components/LoginSwitch/LoginSwitch';
import RssMenu        from 'Components/RssMenu/RssMenu';
import RssButtonNav   from 'Components/RssButtonNav/RssButtonNav';

class RssHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: props.isAuthenticated
    };
  }

  handleLogin(event, checked) {
    const { user, history } = this.props;
    this.setState({ auth: checked });
    if(!checked) LoginAction.signout(user, false)
      .then(() => LoginAction.presetUser(''))
      .then(() => history.push('/login'));
  }

  handleMenu(event) {
  }

  render() {
    const { classes, user, profile } = this.props;
    const { auth } = this.state;
    return <div className={classes.navHeader}>
      <LoginSwitch auth={auth} onChange={this.handleLogin.bind(this)}/>
      <div className={classes.navBar}>
        <IconButton className={classes.navIcon}
          color="primary" aria-label="open drawer"
          onClick={this.handleMenu.bind(this)}>
          <MenuIcon />
        </IconButton>
        <RssButtonNav />
        <div className={classes.loginIcon}>
        <RssMenu auth={auth} user={user} profile={profile}/>
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
RssHeader.displayName = 'RssHeader';
RssHeader.defaultProps = {};
RssHeader.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(RssHeader));
