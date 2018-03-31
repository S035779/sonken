import React            from 'react';
import PropTypes        from 'prop-types'
import { renderRoutes } from 'react-router-config';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { CssBaseline }  from 'material-ui';
import LoginHeader      from 'Components/LoginHeader/LoginHeader';
import ErrorBoundary    from 'Components/ErrorBoundary/ErrorBoundary';
import authImg          from 'Assets/image/full-screen-image-2.jpg';
import rgstImg          from 'Assets/image/bg5.jpg';
import cnfmImg          from 'Assets/image/bg4.jpg';

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
        <div className={classes.content}>
          {renderRoutes(route.routes)}
        </div>
      </div>
      </ErrorBoundary>
    </div>;
  }
};

const root = {
  width: '100%', zIndex: 1, overflow: 'hidden', height: '100vh'
  , backgroundSize: 'cover'
};
const auth_top = std.toRGBa('#797979', 0.8);
const auth_btm = std.toRGBa('#797979', 0.8);
const rgst_top = std.toRGBa('#FFA534', 0.8);
const rgst_btm = std.toRGBa('#FF5221', 0.8);
const cnfm_top = std.toRGBa('#9368E9', 0.8);
const cnfm_btm = std.toRGBa('#943BEA', 0.8);
const barHeightSmDown = 56;
const barHeightSmUp = 64;
const styles = theme => ({
  authenticate: Object.assign({}, root, { background:
    `linear-gradient(to bottom, ${auth_top}, ${auth_btm}), url(${authImg})`
  })
, registration: Object.assign({}, root, { background:
    `linear-gradient(to bottom, ${rgst_top}, ${rgst_btm}), url(${rgstImg})`
  })
, confirmation: Object.assign({}, root, { background:
    `linear-gradient(to bottom, ${cnfm_top}, ${cnfm_btm}), url(${cnfmImg})`
  })
, authFrame:{ position: 'relative'
            , display: 'flex', flexDirection: 'column'
            , width: '100%' }
, content:  { position: 'absolute'
            , width: '100%'
            , height: `calc(100vh - ${barHeightSmDown}px)`
            , marginTop: barHeightSmDown
            , [theme.breakpoints.up('sm')]: {
              height: `calc(100vh - ${barHeightSmUp}px)`
            , marginTop: barHeightSmUp }}
});
Auth.displayName = 'Auth';
Auth.defaultProps = {};
Auth.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(Auth);
