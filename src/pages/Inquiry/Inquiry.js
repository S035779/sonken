import React                    from 'react';
import PropTypes                from 'prop-types';
import { renderRoutes }         from 'react-router-config';
import { Redirect }             from 'react-router-dom';
import { Container }            from 'flux/utils';
import { getStores, getState }  from 'Stores';
import LoginAction              from 'Actions/LoginAction';
import std                      from 'Utilities/stdutils';

import { withStyles }           from '@material-ui/core/styles';
import { CssBaseline }          from '@material-ui/core';
import ErrorBoundary            from 'Components/ErrorBoundary/ErrorBoundary';
import LoginHeader              from 'Components/LoginHeader/LoginHeader';
import iqryImg                  from 'Assets/image/bg6.jpg';

class Inquiry extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState(['loginStore']);
  }

  static prefetch(options) {
    const { user } = options;
    if(!user) return null;
    std.logInfo(Inquiry.displayName, 'prefetch', options);
    return LoginAction.presetUser(user);
  }

  render() {
    //std.logInfo(Inquiry.displayName, 'State', this.state);
    //std.logInfo(Inquiry.displayName, 'Props', this.props);
    const { classes, route, location } = this.props;
    const { user, isAuthenticated, preference } = this.state;
    return isAuthenticated
      ? ( <div className={classes.root}>
          <ErrorBoundary>
          <CssBaseline />
          <div className={classes.inquiryFrame}>
            <LoginHeader />
            <div className={classes.content}>
              {route.routes ? renderRoutes(route.routes, { user, preference }): null}
            </div>
          </div>
          </ErrorBoundary>
        </div> )
      : ( <Redirect to={{ pathname: '/login/authenticate', state: { from: location } }} /> );
  }
}
Inquiry.displayName = 'Inquiry';
Inquiry.defaultProps = {};
Inquiry.propTypes = {
  classes: PropTypes.object.isRequired
, route: PropTypes.object.isRequired
, location: PropTypes.object.isRequired
};
const iqry_top = std.toRGBa('#8f2785', 0.8);
const iqry_btm = std.toRGBa('#e4b1db', 0.8);
const barHeightSmUp   = 64;
const barHeightSmDown = 56;
const styles = theme => ({
  root: {
    width: '100vw', zIndex: 1, overflow: 'hidden', height: '100vh'
  , background: `linear-gradient(315deg, ${iqry_top}, ${iqry_btm}), url(${iqryImg})`
  , backgroundSize: 'cover'
  }
, inquiryFrame: { position: 'relative', height: '100%' }
, content:      { position: 'absolute', width: '100%' , display: 'flex', flexDirection: 'column'
                , justifyContent: 'center', alignItems: 'center', height: `calc(100vh - ${barHeightSmDown}px)`
                , [theme.breakpoints.up('sm')]: { height: `calc(100vh - ${barHeightSmUp}px)` }}
});
export default withStyles(styles)(Container.create(Inquiry));
