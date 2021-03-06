import loadable       from '@loadable/component';
import React                    from 'react';
import PropTypes                from 'prop-types';
import { Redirect }             from 'react-router-dom';
import { renderRoutes }         from 'react-router-config';
import { Container }            from 'flux/utils';
import UserAction               from 'Actions/UserAction';
import { getStores, getState }  from 'Stores';
import std                      from 'Utilities/stdutils';
import Spinner                  from 'Utilities/Spinner';

import { withStyles }           from '@material-ui/core/styles';
const AdminSearch  = loadable(() => import('Components/AdminSearch/AdminSearch'));
const AdminButtons = loadable(() => import('Components/AdminButtons/AdminButtons'));
const AdminList    = loadable(() => import('Components/AdminList/AdminList'));

class Management extends React.Component {
  static getStores() {
    return getStores(['managementStore']);
  }

  static calculateState() {
    return getState('managementStore');
  }

  static prefetch({ admin }) {
    if(!admin) return null;
    std.logInfo(Management.displayName, 'fetch', { admin });
    return UserAction.presetAdmin(admin)
      .then(() => UserAction.fetchUsers());
  }

  componentDidMount() {
    this.spn = Spinner.of('app');
    const { isAuthenticated, admin } = this.state;
    if(isAuthenticated) {
      this.spn.start();
      //std.logInfo(Management.displayName, 'fetch', 'Management');
      //UserAction.fetchUsers(admin)
      Management.prefetch({ admin })
        .then(() => this.spn.stop());
    }
  }

  componentWillUnmount() {
    this.spn.stop();
  }

  userPage(number, page) {
    return number < page.perPage ? number : page.perPage;
  }

  render() {
    //std.logInfo(Management.displayName, 'State', this.state);
    //std.logInfo(Management.displayName, 'Props', this.props);
    const { classes, match, route, location } = this.props;
    const { isAuthenticated, admin, users, page, ids, preference } = this.state;
    const _id = match.params.id;
    const category = match.params.category ? match.params.category : 'users';
    const user = users.find(obj => obj._id === _id);
    const number = users.length;
    users.length = this.userPage(number, page);
    return isAuthenticated
      ? ( <div className={classes.root}>
            <AdminSearch admin={admin} category={category} userNumber={number} userPage={page} />
            <div className={classes.body}>
            <div className={classes.userList}>
              <AdminButtons admin={admin} users={users} selectedUserId={ids} />
              <AdminList admin={admin} category={category} users={users} selectedUserId={ids} userPage={page}/>
            </div>
            <div className={classes.userEdit}>
              { route.routes ? renderRoutes(route.routes,{ admin, user, preference }) : null }
            </div>
          </div>
        </div> )
      : ( <Redirect to={{ pathname: '/login/authenticate', state: { from: location } }} /> );
  }
}
Management.displayName = 'Management';
Management.defaultProps = {};
Management.propTypes = {
  classes: PropTypes.object.isRequired
, match: PropTypes.object.isRequired
, route: PropTypes.object.isRequired
, location: PropTypes.object.isRequired
};
const barHeightSmUp     = 112;
const barHeightSmDown   = 104;
const listWidth         = 400;
const searchHeight      = 62;
const userHeightSmUp    = `calc(100vh - ${barHeightSmUp}px - ${searchHeight}px)`;
const userHeightSmDown  = `calc(100vh - ${barHeightSmDown}px - ${searchHeight}px)`;
const styles = theme => ({
  root:     { display: 'flex', flexDirection: 'column' }
, body:     { display: 'flex', flexDirection: 'row' }
, userList: { width: listWidth, minWidth: listWidth, height: userHeightSmDown
            , [theme.breakpoints.up('sm')]: { height: userHeightSmUp }}
, userEdit: { flex: 1 }
});
export default withStyles(styles)(Container.create(Management));
