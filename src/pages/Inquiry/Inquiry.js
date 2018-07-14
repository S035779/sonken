import React            from 'react';
import PropTypes        from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Redirect }     from 'react-router-dom';
import { Container }    from 'flux/utils';
import { getStores, getState }
                        from 'Stores';
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import { CssBaseline }  from '@material-ui/core';
import ErrorBoundary    from 'Components/ErrorBoundary/ErrorBoundary';
import LoginHeader      from 'Components/LoginHeader/LoginHeader';
import iqryImg          from 'Assets/image/bg6.jpg';

const env = process.env.NODE_ENV || 'development';
const assets = process.env.ASSET_URL;
let image;
if(env === 'development') {
  image = assets;
} else
if(env === 'production' || env === 'staging') {
  image = assets + '/image';
}

class Inquiry extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState(['loginStore']);
  }

  static prefetch(options) {
    std.logInfo(Inquiry.displayName, 'prefetch', options);
    return LoginAction.presetUser(options.user);
  }

  render() {
    //std.logInfo(Inquiry.displayName, 'State', this.state);
    //std.logInfo(Inquiry.displayName, 'Props', this.props);
    const { classes, route, location } = this.props;
    const { user, isAuthenticated, preference } = this.state;
    const to = 
      { pathname: '/login/authenticate', state: { from: location } };
    if(!isAuthenticated) return <Redirect to={to} />;
    return <div className={classes.root}>
      <ErrorBoundary>
      <CssBaseline />
      <div className={classes.inquiryFrame}>
        <LoginHeader />
        <div className={classes.content}>
          {route.routes ?
            renderRoutes(route.routes, { user, preference }): null}
        </div>
      </div>
      </ErrorBoundary>
    </div>;
  }
};

const iqry_top = std.toRGBa('#8f2785', 0.8);
const iqry_btm = std.toRGBa('#e4b1db', 0.8);
const barHeightSmUp   = 64;
const barHeightSmDown = 56;
const rowHeight       = 62;
const styles = theme => ({
  root:         { width: '100vw', zIndex: 1, overflow: 'hidden'
                , height: '100vh'
                , background:
                    `linear-gradient(315deg, ${iqry_top}, ${iqry_btm})`
                      + `, url(${image + iqryImg})`
                , backgroundSize: 'cover' }
, inquiryFrame: { position: 'relative', height: '100%' }
, content:      { position: 'absolute', width: '100%'
                , display: 'flex', flexDirection: 'column'
                , justifyContent: 'center', alignItems: 'center'
                , height: `calc(100vh - ${barHeightSmDown}px)`
                , [theme.breakpoints.up('sm')]: {
                    height: `calc(100vh - ${barHeightSmUp}px)`
                }}
});
Inquiry.displayName = 'Inquiry';
Inquiry.defaultProps = {};
Inquiry.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Inquiry));
