import React            from 'react';
import PropTypes        from 'prop-types';
import { Redirect }     from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { Container }    from 'flux/utils';
import NoteAction       from 'Actions/NoteAction';
import {
  getStores, getState
}                       from 'Stores';

import { withStyles }   from 'material-ui/styles';
import RssSearch        from 'Components/RssSearch/RssSearch';
import RssButtons       from 'Components/RssButtons/RssButtons';
import RssList          from 'Components/RssList/RssList';

class Dashboard extends React.Component {
  static getStores() {
    return getStores(['dashboardStore']);
  }

  static calculateState() {
    return getState('dashboardStore');
  }

  static prefetch(user) {
    console.info('prefetch', user);
    return NoteAction.presetUser(user)
      .then(() => NoteAction.prefetchNotes(user));
  }

  componentDidMount() {
    this.logInfo('fetch', 'Dashboard');
    NoteAction.fetchNotes(this.state.user);
  }

  logInfo(name, message) {
    console.info('[INFO]', name, message);
  }

  logTrace(name, message) {
    console.trace('[TRACE]', name, message);
  }

  notePage(number, page) {
    return number < page.perPage ? number : page.perPage;
  }

  render() {
    this.logInfo('State', this.state);
    this.logInfo('Props', this.props);
    const { classes, match, route, location } = this.props;
    const { isAuthenticated, user, notes, page, ids } = this.state;
    const _id = Number(match.params.id);
    const category =
      match.params.category ? match.params.category : 'marchant';
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
        <RssSearch
          user={user}
          category={category}
          noteNumber={number} notePage={page} />
      <div className={classes.body}>
        <div className={classes.noteList}>
          <RssButtons
            user={user}
            notes={_notes}
            selectedNoteId={ids} />
          <RssList
            user={user}
            notes={_notes}
            selectedNoteId={ids}
            notePage={page}/>
        </div>
        <div className={classes.noteEdit}>
        {route.routes ? renderRoutes(route.routes,{ user, note }) : null}
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
Dashboard.displayName = 'Dashboard';
Dashboard.defaultProps = {};
Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Dashboard));
