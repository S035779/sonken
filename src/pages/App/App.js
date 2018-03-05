import React            from 'react';
import PropTypes        from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Container }    from 'flux/utils';
import LoginAction      from 'Actions/LoginAction';
import { getStores, getState }
                        from 'Stores';

import { withStyles }   from 'material-ui/styles';
import { Reboot }       from 'material-ui';
import RssHeader        from 'Components/RssHeader/RssHeader';
import ErrorBoundary    from 'Components/ErrorBoundary/ErrorBoundary';

class App extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState('loginStore');
  }

  logInfo(name, message) {
    console.info('>>> Info', name, message);
  }

  render() {
    const { classes, route } = this.props;
    const { user, isAuthenticated } = this.state;
    return <div className={classes.root}>
      <ErrorBoundary>
      <Reboot />
      <div className={classes.appFrame}>
        <RssHeader user={user} isAuthenticated={isAuthenticated}/>
        <div className={classes.content}>
          {renderRoutes(route.routes)}
        </div>
      </div>
      </ErrorBoundary>
    </div>;
  }
};

const barHeightSmUp = 112;
const barHeightSmDown = 104;
const styles = theme => ({
  root:     { width: '100%', zIndex: 1
            , overflow: 'hidden', height: '100vh' },
  appFrame: { position: 'relative'
            , display: 'flex', flexDirection: 'column'
            , width: '100%'},
  content:  { position: 'absolute'
            , width: '100%'
            , height: `calc(100vh - ${barHeightSmDown}px)`
            , marginTop: barHeightSmDown
            , [theme.breakpoints.up('sm')]: {
              height: `calc(100vh - ${barHeightSmUp}px)`
            , marginTop: barHeightSmUp }}
});
App.displayName = 'App';
App.defaultProps = {};
App.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(App));
