import loadable       from '@loadable/component';
import React                    from 'react';
import PropTypes                from 'prop-types';
import { renderRoutes }         from 'react-router-config';
import { Container }            from 'flux/utils';
import { getStores, getState }  from 'Stores';

import { withStyles }           from '@material-ui/core/styles';
import { CssBaseline }          from '@material-ui/core';
import ErrorBoundary            from 'Components/ErrorBoundary/ErrorBoundary';
const AdminHeader = loadable(() => import('Components/AdminHeader/AdminHeader'));

class Admin extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState('loginStore');
  }

  render() {
    const { classes, route } = this.props;
    const { admin, isAuthenticated, profile, preference } = this.state;
    return <div className={classes.root}>
      <ErrorBoundary>
      <CssBaseline />
      <div className={classes.adminFrame}>
        <AdminHeader admin={admin} preference={preference} profile={profile} isAuthenticated={isAuthenticated}/>
        <div className={classes.content}>
          {renderRoutes(route.routes)}
        </div>
      </div>
      </ErrorBoundary>
    </div>;
  }
}
Admin.displayName = 'Admin';
Admin.defaultProps = {};
Admin.propTypes = { classes:  PropTypes.object.isRequired, route: PropTypes.object.isRequired };
const barHeightSmUp = 112;
const barHeightSmDown = 104;
const styles = theme => ({
  root:     { width: '100%', zIndex: 1, overflow: 'hidden', height: '100vh' },
  adminFrame: { position: 'relative', display: 'flex', flexDirection: 'column', width: '100%'},
  content:  { position: 'absolute' , width: '100%', height: `calc(100vh - ${barHeightSmDown}px)`
            , marginTop: barHeightSmDown, [theme.breakpoints.up('sm')]: { 
                height: `calc(100vh - ${barHeightSmUp}px)`, marginTop: barHeightSmUp }}
});
export default withStyles(styles)(Container.create(Admin));
