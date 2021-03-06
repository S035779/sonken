import loadable       from '@loadable/component';
import React                    from 'react';
import PropTypes                from 'prop-types';
import { renderRoutes }         from 'react-router-config';
import { Container }            from 'flux/utils';
import { getStores, getState }  from 'Stores';
import LoginAction              from 'Actions/LoginAction';

import { withStyles }           from '@material-ui/core/styles';
import { CssBaseline }          from '@material-ui/core';
import ErrorBoundary            from 'Components/ErrorBoundary/ErrorBoundary';
const RssDrawer = loadable(() => import('Components/RssDrawer/RssDrawer'));

class App extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState('loginStore');
  }

  componentDidMount() {
    const { isAuthenticated } = this.state;
    if(!isAuthenticated) LoginAction.autologin();
  }

  render() {
    const { classes, route } = this.props;
    const { user, isAuthenticated, profile, preference, categorys, jobs } = this.state;
    return <div className={classes.root}>
      <ErrorBoundary>
      <CssBaseline />
      <div className={classes.appFrame}>
        <RssDrawer user={user} isAuthenticated={isAuthenticated} profile={profile} preference={preference} categorys={categorys} 
          jobs={jobs}>{renderRoutes(route.routes)}</RssDrawer>
      </div>
      </ErrorBoundary>
    </div>;
  }
}
App.displayName = 'App';
App.defaultProps = {};
App.propTypes = { classes:  PropTypes.object.isRequired, route: PropTypes.object.isRequired };
const styles = {
  root:     { width: '100vw', zIndex: 1, overflow: 'hidden', height: '100vh' }
, appFrame: { position: 'relative', display: 'flex', flexDirection: 'column', width: '100%' }
};
export default withStyles(styles)(Container.create(App));
