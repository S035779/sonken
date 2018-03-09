import React            from 'react';
import PropTypes        from 'prop-types';
import { Redirect }     from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { Container }    from 'flux/utils';
import UserAction       from 'Actions/UserAction';
import { getStores, getState }
                        from 'Stores';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import AdminSearch        from 'Components/AdminSearch/AdminSearch';
import AdminButtons       from 'Components/AdminButtons/AdminButtons';
import AdminList          from 'Components/AdminList/AdminList';

class Management extends React.Component {
  static getStores() {
    return getStores(['managementStore']);
  }

  static calculateState() {
    return getState('managementStore');
  }

  static prefetch(options) {
    std.logInfo(Management.displayName, 'prefetch', options);
    return UserAction.presetAdmin(options.admin)
      .then(() => UserAction.prefetchUsers());
  }

  componentDidMount() {
    std.logInfo(Management.displayName, 'fetch', 'Management');
    UserAction.fetchUsers(this.state.admin);
  }

  notePage(number, page) {
    return number < page.perPage ? number : page.perPage;
  }

  render() {
    std.logInfo(Management.displayName, 'State', this.state);
    std.logInfo(Management.displayName, 'Props', this.props);
    const { classes, match, route, location } = this.props;
    const { isAuthenticated, admin, users, page, ids } = this.state;
    const _id = Number(match.params.id);
    const category =
      match.params.category ? match.params.category : 'users';
    const user = users.find(obj => obj.id === _id);
    const number = users.length;
    users.length = this.notePage(number, page);
    if(!isAuthenticated) {
      return <Redirect to={{
        pathname: '/login/authenticate', state: { from: location } }} />;
    }
    return <div className={classes.root}>
        <AdminSearch
          admin={admin}
          category={category}
          userNumber={number} userPage={page} />
      <div className={classes.body}>
        <div className={classes.noteList}>
          <AdminButtons
            admin={admin}
            users={users}
            selectedUserId={ids} />
          <AdminList
            admin={admin}
            category={category}
            users={users}
            selectedUserId={ids}
            userPage={page}/>
        </div>
        <div className={classes.noteEdit}>
        {route.routes ? renderRoutes(route.routes,{ admin, user }) : null}
        </div>
      </div>
    </div>;
  }
};

const barHeightSmUp     = 112;
const barHeightSmDown   = 104;
const listWidth         = 400;
const searchHeight      = 62;
const noteHeightSmUp    = 
  `calc(100vh - ${barHeightSmUp}px - ${searchHeight}px)`;
const noteHeightSmDown  =
  `calc(100vh - ${barHeightSmDown}px - ${searchHeight}px)`;
const styles = theme => ({
  root:     { display: 'flex', flexDirection: 'column' }
, body:     { display: 'flex', flexDirection: 'row' }
, noteList: { width: listWidth, minWidth: listWidth
            , height: noteHeightSmDown
            , [theme.breakpoints.up('sm')]: { height: noteHeightSmUp }}
, noteEdit: { flex: 1 }
});
Management.displayName = 'Management';
Management.defaultProps = {};
Management.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Management));
