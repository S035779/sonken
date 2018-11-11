import React            from 'react';
import PropTypes        from 'prop-types'
import { renderRoutes } from 'react-router-config';
import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import { CssBaseline }  from '@material-ui/core';
import ErrorBoundary    from 'Components/ErrorBoundary/ErrorBoundary';
import LoginHeader      from 'Components/LoginHeader/LoginHeader';
import authImg          from 'Assets/image/full-screen-image-2.jpg';
import mgmtImg          from 'Assets/image/full-screen-image-1.jpg';
import rgstImg          from 'Assets/image/bg5.jpg';
import cnfmImg          from 'Assets/image/bg4.jpg';

const node_env  = process.env.NODE_ENV || 'development';
const asetPath  = process.env.ASSET_URL;
const rootPath  = process.env.PLATFORM === 'local' ? '/' : '';
let image;
if(node_env === 'development') {
  image = asetPath + rootPath;
} else 
if(node_env === 'production' || node_env === 'staging') {
  image = asetPath + '/image' + rootPath;
}

class Auth extends React.Component {
  render() {
    //std.logInfo(Auth.displayName, 'Props', this.props);
    const { classes, route, match } = this.props;
    const page = match.params.page !== ''  ? match.params.page : '';
    return <div className={classes[page]}>
      <ErrorBoundary>
      <CssBaseline />
      <div className={classes.authFrame}>
        <LoginHeader />
        <div className={classes.content}>{ renderRoutes(route.routes) }</div>
      </div>
      </ErrorBoundary>
    </div>;
  }
}
Auth.displayName = 'Auth';
Auth.defaultProps = {};
Auth.propTypes = {
  classes:  PropTypes.object.isRequired
, route: PropTypes.object.isRequired
, match: PropTypes.object.isRequired
};

const auth_top = std.toRGBa('#797979', 0.8);
const auth_btm = std.toRGBa('#797979', 0.8);
const rgst_top = std.toRGBa('#FFA534', 0.8);
const rgst_btm = std.toRGBa('#FF5221', 0.8);
const cnfm_top = std.toRGBa('#9368E9', 0.8);
const cnfm_btm = std.toRGBa('#943BEA', 0.8);
const barHeightSmUp   = 64;
const barHeightSmDown = 56;
const root =  { width: '100vw', zIndex: 1, overflow: 'hidden', height: '100vh' };
const styles = theme => ({
  authenticate: Object.assign({}, root, {
    background: `linear-gradient(to bottom, ${auth_top}, ${auth_btm}), url(${image}${authImg})`
  , backgroundSize: 'cover'
  })
, management: Object.assign({}, root, {
    background: `linear-gradient(to bottom, ${auth_top}, ${auth_btm}), url(${image}${mgmtImg})`
  , backgroundSize: 'cover'
  })
, registration: Object.assign({}, root, {
    background: `linear-gradient(to bottom, ${rgst_top}, ${rgst_btm}), url(${image}${rgstImg})`
  , backgroundSize: 'cover'
  })
, confirmation: Object.assign({}, root, {
    background: `linear-gradient(to bottom, ${cnfm_top}, ${cnfm_btm}), url(${image}${cnfmImg})`
  , backgroundSize: 'cover'
  })
, authFrame:  { position: 'relative', height: '100%' } 
, content:    { position: 'absolute', width: '100%'
              , display: 'flex', flexDirection: 'column'
              , justifyContent: 'center', alignItems: 'center'
              , height: `calc(100vh - ${barHeightSmDown}px)`
              , [theme.breakpoints.up('sm')]: {
                  height: `calc(100vh - ${barHeightSmUp}px)`
              }}
});
export default withStyles(styles)(Auth);
