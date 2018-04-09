import React            from 'react';
import PropTypes        from 'prop-types';
import { Redirect }     from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { Container }    from 'flux/utils';
import NoteAction       from 'Actions/NoteAction';
import { getStores, getState }
                        from 'Stores';
import std              from 'Utilities/stdutils';

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

  static prefetch(options) {
    std.logInfo(Dashboard.displayName, 'prefetch', options);
    return NoteAction.presetUser(options.user)
      .then(() => NoteAction.prefetchNotes(options.user));
  }

  componentDidMount() {
    std.logInfo(Dashboard.displayName, 'fetch', 'Dashboard');
    NoteAction.fetchNotes(this.state.user);
  }

  notePage(number, page) {
    return number < page.perPage ? number : page.perPage;
  }

  render() {
    //std.logInfo(Dashboard.displayName, 'State', this.state);
    //std.logInfo(Dashboard.displayName, 'Props', this.props);
    const { classes, match, route, location } = this.props;
    const { isAuthenticated, user, notes, page, ids, file } = this.state;
    const _id = match.params.id;
    const category =
      match.params.category ? match.params.category : 'marchant';
    const _notes =
      notes ? notes.filter(obj => obj.category === category) : [];
    const note = notes.find(obj => obj._id === _id);
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
          note={note}
          file={file}
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
