import React          from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes      from 'prop-types'
import classNames     from 'classnames';
import LoginAction    from 'Actions/LoginAction';

import { withStyles } from 'material-ui/styles';
import { IconButton } from 'material-ui';
import { Menu as MenuIcon }
                      from 'material-ui-icons';
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
      .then(() => history.push('/login/authenticate'));
  }

  handleToggle(event) {
    this.props.onClick();
  }

  render() {
    const { classes, user, preference, profile, open, children }
      = this.props;
    const { auth } = this.state;
    return <div className={classNames(classes.navHeader
      , open && classes.navHeaderShift)}>
      <LoginSwitch
        auth={auth}
        onChange={this.handleLogin.bind(this)}/>
      <div className={classes.navBar}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={this.handleToggle.bind(this)}
          className={classes.navIcon}>
          <MenuIcon />
        </IconButton>
        <RssButtonNav />
        <div className={classes.loginIcon}>
          <RssMenu
            auth={auth} 
            user={user}
            preference={preference}
            profile={profile}
          />
        </div>
      </div>
      <div className={classes.content}>
        {children}
      </div>
    </div>;
  }
};

const drawerMinWidthMdDown  = 0;
const drawerMinWidthMdUp    = 72;
const drawerWidth           = 240;
const navHeightSmUp         = 64;
const navHeightSmDown       = 56;
const barHeightSmUp         = 112;
const barHeightSmDown       = 104;
const styles = theme => ({
  navHeader:  {
    marginLeft: drawerMinWidthMdDown
  , [theme.breakpoints.up('md')]: {
      marginLeft: drawerMinWidthMdUp
    }
  , transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp
    , duration: theme.transitions.duration.leavingScreen
    })
  }
, navHeaderShift:{
    marginLeft: drawerMinWidthMdDown
  , [theme.breakpoints.up('md')]: {
      marginLeft: drawerWidth
    , width: `calc(100% - ${drawerWidth}px)`
    }
  , transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp
    , duration: theme.transitions.duration.enteringScreen
    })
  }
, navBar:     {
    display: 'flex', flexDirection: 'row'
  , wordBreak: 'keep-all', overflow: 'scroll' 
  , height: navHeightSmDown, padding: 2
  , [theme.breakpoints.up('sm')]: {
      height: navHeightSmUp, padding: 6
    }
  }  
, navIcon:    { marginLeft: -12, marginRight: 'auto' }
, loginIcon:  { marginLeft: 'auto' }
, content:  {
    width: '100%'
  , height: `calc(100vh - ${barHeightSmDown}px)`
  , [theme.breakpoints.up('sm')]: {
      height: `calc(100vh - ${barHeightSmUp}px)`
    }
  }
});
RssHeader.displayName = 'RssHeader';
RssHeader.defaultProps = {};
RssHeader.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(RssHeader));
