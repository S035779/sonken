import React          from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes      from 'prop-types'
import classNames     from 'classnames';
import LoginAction    from 'Actions/LoginAction';
import std            from 'Utilities/stdutils';

import { withStyles } from 'material-ui/styles';
import { AppBar, Toolbar, Typography, Button }
                      from 'material-ui';
import { Menu, MoreVert }
                      from 'material-ui-icons';
import RssMenu        from 'Components/RssMenu/RssMenu';

class RssHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: props.isAuthenticated
    };
  }

  handleToggle(event) {
    this.props.onClick();
  }

  render() {
    std.logInfo(RssHeader.displayName, 'Props', this.props);
    std.logInfo(RssHeader.displayName, 'State', this.state);
    const {
      classes, user, preference, profile, open, children, location
    } = this.props;
    const { auth } = this.state;
    let category = location.pathname.split('/')[1];
    switch(category) {
      case 'marchant':
        category='Merchandise';
        break;
      case 'sellers':
        category='Sellers';
        break;
      case 'bids':
        category='Bids';
        break;
      case 'trade':
        category='Trade';
        break;
      default:
        category='Merchandise';
        break;
    }
    return <div className={
        classNames(classes.navHeader, open && classes.navHeaderShift)
      }>
      <AppBar
        color="default"
        position="static"
        className={classes.navBar}>
      <Toolbar>
        <Button
          mini
          variant="fab"
          color="primary"
          onClick={this.handleToggle.bind(this)}
          className={classes.navIcon}>
          {open ? <MoreVert /> : <Menu />}
        </Button>
        <Typography
          variant="title"
          color="inherit"
          className={classes.title}>
          {category}
        </Typography>
        <div className={classes.loginIcon}>
          <RssMenu
            auth={auth} 
            user={user}
            preference={preference}
            profile={profile}
          />
        </div>
      </Toolbar>
      </AppBar>
      <div className={classes.content}>
        {children}
      </div>
    </div>;
  }
};

const drawerMinWidthMdUp    = 72;
const drawerMinWidthMdDown  = 0;
const drawerWidth           = 240;
const navHeightSmUp         = 64;
const navHeightSmDown       = 56;
const barHeightSmUp         = 64;//112;
const barHeightSmDown       = 56;//104;
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
//    display: 'flex', flexDirection: 'row'
//  , wordBreak: 'keep-all', overflow: 'scroll' 
    height: navHeightSmDown, padding: 2
  , [theme.breakpoints.up('sm')]: {
      height: navHeightSmUp, padding: 6
    }
  }
, navIcon:    {
  //margin: theme.spacing.unit
  marginLeft: -12, marginRight: 20
}
, title: {
    flex: 1, color: '#888888'
  }
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
