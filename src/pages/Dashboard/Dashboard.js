import React from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Container } from 'flux/utils';
import NoteAction from 'Actions/NoteAction';
import { getStores, getState } from 'Stores';
import getRoutes from 'Main/routes';

import { withStyles } from 'material-ui/styles';
import RssSearch from 'Components/RssSearch/RssSearch';
import RssButtons from 'Components/RssButtons/RssButtons';
import RssList from 'Components/RssList/RssList';

class Dashboard extends React.Component {
  static getStores() {
    return getStores(['dashboardStore']);
  }

  static calculateState() {
    return getState('dashboardStore');
  }

  static prefetch(props) {
    return NoteAction.fetchMyNotes();
  }

  componentDidMount() {
    Dashboard.prefetch(this.props);
  }

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  }

  render() {
    this.logInfo('render', this.state);
    const {classes, match, route} = this.props;
    const {notes} = this.state;
    const note = notes.find(note => note.id === Number(match.params.id));
    return <div className={classes.root}>
      <div>
        <RssSearch />
      </div>
      <div className={classes.body}>
        <div className={classes.noteList}>
          <RssButtons />
          <RssList notes={notes} selectedNoteId={match.params.id}/>
        </div>
        <div className={classes.noteEdit}>
          {route.routes ? renderRoutes(route.routes, {note: note}) : null}
        </div>
      </div>
    </div>;
  }
};

const barHeightSmUp = 112;
const barHeightSmDown = 104;
const listWidth = 400;
const searchHeight = 62;
const styles = theme => ({
  root:     { display: 'flex', flexDirection: 'column' }
, body:     { display: 'flex', flexDirection: 'row' }
, noteList: { width: listWidth, minWidth: listWidth
            , height:
                `calc(100vh - ${barHeightSmDown}px - ${searchHeight}px)`
            , [theme.breakpoints.up('sm')]: {
              height:
                `calc(100vh - ${barHeightSmUp}px - ${searchHeight}px)` }}
, noteEdit: { flex: 1 }
});
Dashboard.displayName = 'Dashboard';
Dashboard.defaultProps = {};
Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Dashboard));
