import React            from 'react';
import PropTypes        from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Container }    from 'flux/utils';
import LoginAction      from 'Actions/LoginAction';
import { getStores, getState }
                        from 'Stores';

import { withStyles }   from '@material-ui/core/styles';
import { CssBaseline }  from '@material-ui/core';
import AdminHeader      from 'Components/AdminHeader/AdminHeader';
import ErrorBoundary    from 'Components/ErrorBoundary/ErrorBoundary';

class Admin extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState('loginStore');
  }

  render() {
    const { classes, route } = this.props;
    const { admin, isAuthenticated, profile, preference }
      = this.state;
    return <div className={classes.root}>
      <ErrorBoundary>
      <CssBaseline />
      <div className={classes.adminFrame}>
        <AdminHeader admin={admin}
          preference={preference} profile={profile}
          isAuthenticated={isAuthenticated}/>
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
  adminFrame: { position: 'relative'
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
Admin.displayName = 'Admin';
Admin.defaultProps = {};
Admin.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Admin));
