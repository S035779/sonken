import React                    from 'react';
import PropTypes                from 'prop-types';
import { renderRoutes }         from 'react-router-config';
import { Container }            from 'flux/utils';
import { getStores, getState }  from 'Stores';

import { withStyles }           from '@material-ui/core/styles';
import { CssBaseline }          from '@material-ui/core';
import ErrorBoundary            from 'Components/ErrorBoundary/ErrorBoundary';
import RssDrawer                from 'Components/RssDrawer/RssDrawer';

class App extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState('loginStore');
  }

  render() {
    const { classes, route } = this.props;
    const { user, isAuthenticated, profile, preference, categorys } = this.state;
    return <div className={classes.root}>
      <ErrorBoundary>
      <CssBaseline />
      <div className={classes.appFrame}>
        <RssDrawer user={user} isAuthenticated={isAuthenticated} profile={profile} preference={preference}
          categorys={categorys} >
          {renderRoutes(route.routes)}
        </RssDrawer>
      </div>
      </ErrorBoundary>
    </div>;
  }
}
App.displayName = 'App';
App.defaultProps = {};
App.propTypes = {
  classes:  PropTypes.object.isRequired
, route: PropTypes.object.isRequired
};

const styles = {
  root:     { width: '100vw', zIndex: 1, overflow: 'hidden', height: '100vh' }
, appFrame: { position: 'relative', display: 'flex', flexDirection: 'column', width: '100%' }
};
export default withStyles(styles)(Container.create(App));
