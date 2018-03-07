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

  static prefetch(admin) {
    std.logInfo('prefetch', admin);
    return UserAction.presetAdmin(admin)
      .then(() => UserAction.prefetchUsers(admin));
  }

  componentDidMount() {
    std.logInfo('fetch', 'Management');
    UserAction.fetchUsers(this.state.admin);
  }

  notePage(number, page) {
    return number < page.perPage ? number : page.perPage;
  }

  render() {
    std.logInfo('State', this.state);
    std.logInfo('Props', this.props);
    const { classes, match, route, location } = this.props;
    const { isAuthenticated, admin, notes, page, ids } = this.state;
    const _id = Number(match.params.id);
    const category =
      match.params.category ? match.params.category : 'user';
    const _notes =
      notes ? notes.filter(obj => obj.category === category) : [];
    const note = notes.find(obj => obj.id === _id);
    const number = _notes.length;
    _notes.length = this.notePage(number, page);
    if(!isAuthenticated) {
      return <Redirect to={{
        pathname: '/login/authenticate', state: { from: location } }} />;
    }
    return <div className={classes.root}>
        <AdminSearch
          user={admin}
          category={category}
          noteNumber={number} notePage={page} />
      <div className={classes.body}>
        <div className={classes.noteList}>
          <AdminButtons
            user={admin}
            notes={_notes}
            selectedNoteId={ids} />
          <AdminList
            user={admin}
            notes={_notes}
            selectedNoteId={ids}
            notePage={page}/>
        </div>
        <div className={classes.noteEdit}>
        {route.routes ? renderRoutes(route.routes,{ admin, note }) : null}
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
