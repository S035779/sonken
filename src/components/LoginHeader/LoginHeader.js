import React          from 'react';
import PropTypes      from 'prop-types'
import { Link }       from 'react-router-dom';
import std            from 'Utilities/stdutils';

import { withStyles } from 'material-ui/styles';
import { AppBar, Toolbar, Typography, Button }
                      from 'material-ui';
import { RssFeed, PieChartOutlined, Fingerprint, PhoneIphone, LockOpen }
                      from 'material-ui-icons';
import RssButton      from 'Components/RssButton/RssButton';

class LoginHeader extends React.Component {
  render() {
    //std.logInfo(LoginHeader.displayName, 'Props', this.props);
    const { classes } = this.props;
    return <div className={classes.navHeader}>
      <AppBar position="static" className={classes.navBar}>
      <Toolbar className={classes.navBar}>
        <div className={classes.title}>
        <RssButton color="flatWhite"
          component={Link} to="/marchant"
          className={classes.name}>
          <RssFeed className={classes.icon} />
          アルファOne
        </RssButton>
        </div>
        <div className={classes.link}>
        <RssButton color="flatWhite"
          component={Link} to="/marchant">
          <PieChartOutlined className={classes.icon} />
          Dashboard
        </RssButton>
        <RssButton color="flatWhite"
          component={Link} to="/login/registration">
          <Fingerprint className={classes.icon} />
          Register
        </RssButton>
        <RssButton color="flatWhite"
          component={Link} to="/login/authenticate">
          <PhoneIphone className={classes.icon} />
          Login
        </RssButton>
        <RssButton color="flatWhite"
          component={Link} to="/login/confirmation">
          <LockOpen className={classes.icon} />
          Unlock
        </RssButton>
        </div>
      </Toolbar>
      </AppBar>
    </div>;
  }
};

const navHeightSmDown = 56;
const navHeightSmUp = 64;
const styles = theme => ({
  navHeader:  { flexGrow: 1 }
, navBar:     { background: 'transparent'
              , justifyContent: 'space-around'
              , display: 'flex', flexDirection: 'row'
              , height: navHeightSmDown, width: '100%'
              , [theme.breakpoints.up('sm')]: { height: navHeightSmUp }}  
, title:      { flex: 2 }
, name:       { fontSize: 20 }
, link:       { flex: 3
              , display: 'flex', flexDirection: 'row'
              , justifyContent: 'center' }
, icon:       { marginRight: theme.spacing.unit }
});
LoginHeader.displayName = 'LoginHeader';
LoginHeader.defaultProps = {};
LoginHeader.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(LoginHeader);
