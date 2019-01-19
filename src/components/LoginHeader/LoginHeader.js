import loadable                 from '@loadable/component';
import React                    from 'react';
import PropTypes                from 'prop-types'
import { Link }                 from 'react-router-dom';
//import std                      from 'Utilities/stdutils';

import { withStyles }           from '@material-ui/core/styles';
import { AppBar, Toolbar }      from '@material-ui/core';
import { BlurOn, Fingerprint }  from '@material-ui/icons';
//import { BlurOn, PieChartOutlined, Fingerprint, PhoneIphone, LockOpen } from '@material-ui/icons';
const RssButton = loadable(() => import('Components/RssButton/RssButton'));

const app_name = process.env.APP_NAME;
const isBeta = process.env.NODE_ENV !== 'staging';

class LoginHeader extends React.Component {
  render() {
    //std.logInfo(LoginHeader.displayName, 'Props', this.props);
    const { classes } = this.props;
    const to = isBeta ? '/marchant' : '/sellers';
    return <div className={classes.navHeader}>
      <AppBar position="static" className={classes.navBar}>
      <Toolbar className={classes.navBar}>
        <div className={classes.title}>
        <RssButton color="flatWhite" component={Link} to={to} className={classes.name}>
          <BlurOn className={classes.icon} />
          {app_name}
        </RssButton>
        </div>
        <div className={classes.link}>
        {/*
        <RssButton color="flatWhite" component={Link} to="/marchant">
          <PieChartOutlined className={classes.icon} />
          Dashboard
        </RssButton>
        */}
        <RssButton color="flatWhite" component={Link} to="/login/registration">
          <Fingerprint className={classes.icon} />
          新規利用登録
        </RssButton>
        {/*
        <RssButton color="flatWhite" component={Link} to="/login/authenticate">
          <PhoneIphone className={classes.icon} />
          Login
        </RssButton>
        <RssButton color="flatWhite" component={Link} to="/login/confirmation">
          <LockOpen className={classes.icon} />
          Unlock
        </RssButton>
        */}
        </div>
      </Toolbar>
      </AppBar>
    </div>;
  }
}
LoginHeader.displayName = 'LoginHeader';
LoginHeader.defaultProps = {};
LoginHeader.propTypes = { classes:  PropTypes.object.isRequired };
const navHeightSmDown = 56;
const navHeightSmUp = 64;
const styles = theme => ({
  navHeader:  { flexGrow: 1 }
, navBar:     { background: 'transparent', justifyContent: 'space-around', display: 'flex', flexDirection: 'row'
              , height: navHeightSmDown, width: '100%', [theme.breakpoints.up('sm')]: { height: navHeightSmUp }}  
, title:      { flex: 2 }
, name:       { fontSize: 20 }
, link:       { flex: 3, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }
, icon:       { marginRight: theme.spacing.unit }
});
export default withStyles(styles)(LoginHeader);
