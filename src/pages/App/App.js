import React            from 'react';
import PropTypes        from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Container }    from 'flux/utils';
import { getStores, getState }
                        from 'Stores';
import LoginAction      from 'Actions/LoginAction';

import { withStyles }   from 'material-ui/styles';
import { CssBaseline }
                        from 'material-ui';
import ErrorBoundary    from 'Components/ErrorBoundary/ErrorBoundary';
import DrawerNav        from 'Components/DrawerNav/DrawerNav';

class App extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState('loginStore');
  }

  render() {
    const { classes, route } = this.props;
    const { user, isAuthenticated, profile, preference } = this.state;
    return <div className={classes.root}>
      <ErrorBoundary>
      <CssBaseline />
      <div className={classes.appFrame}>
        <DrawerNav
          user={user}
          isAuthenticated={isAuthenticated}
          profile={profile}
          preference={preference}/>
        <div className={classes.content}>
          {renderRoutes(route.routes)}
        </div>
      </div>
      </ErrorBoundary>
    </div>;
  }
};

const drawerWidthMdUp = 240;
const barHeightSmUp = 112;
const barHeightSmDown = 104;
const styles = theme => ({
  root:     { width: '100%', zIndex: 1
            , overflow: 'hidden', height: '100vh' },
  appFrame: { position: 'relative'
            , display: 'flex', flexDirection: 'column'
            , width: '100%'},
  content:  { position: 'absolute'
            , width: '100%', height: `calc(100vh - ${barHeightSmDown}px)`
            , marginTop: barHeightSmDown
            , [theme.breakpoints.up('md')]: {
                width: `calc(100% - ${drawerWidthMdUp}px)`
              , marginLeft: drawerWidthMdUp
              }
            , [theme.breakpoints.up('sm')]: {
                height: `calc(100vh - ${barHeightSmUp}px)`
              , marginTop: barHeightSmUp
              }
            }
});
App.displayName = 'App';
App.defaultProps = {};
App.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(App));
