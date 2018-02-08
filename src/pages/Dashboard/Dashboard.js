import React from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Container } from 'flux/utils';
import NoteAction from 'Actions/NoteAction';
import { getStores, getState } from 'Stores';
import getRoutes from 'Main/routes';

import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import NoteList from 'Components/NoteList/NoteList';
import NoteButtons from 'Components/NoteButtons/NoteButtons';
import NoteSearch from 'Components/NoteSearch/NoteSearch';

class Dashboard extends React.Component {
  static getStores() {
    return getStores(['dashboardStore']);
  }

  static calculateState() {
    return getState('dashboardStore');
  }

  static prefetch(props) {
    console.log('>>> prefetch start!!', 'Props:', props);
    return NoteAction.fetchMyNotes();
  }

  componentDidMount() {
    Dashboard.prefetch(this.props);
  }

  render() {
    //console.log('>>> render!!', 'State:', this.state);
    console.log('>>> render!!', 'Props:', this.props);
    const {classes, match, route} = this.props;
    const {notes} = this.state;
    const note = notes.find(note => note.id === Number(match.params.id));
    return <div className={classes.root}>
      <div className={classes.head}>
        <NoteSearch />
      </div>
      <div className={classes.body}>
        <div className={classes.noteList}>
          <NoteButtons />
          <NoteList notes={notes} selectedNoteId={match.params.id}/>
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
const listWidth = 360;
const searchHeight = 62;
const styles = theme => ({
  root:     { display: 'flex', flexDirection: 'column' }
, head:     {}
, body:     { display: 'flex', flexDirection: 'row' }
, noteList: { width: listWidth, minWidth: listWidth
            , height:
                `calc(100vh - ${barHeightSmDown}px - ${searchHeight}px)`
            , [theme.breakpoints.up('sm')]: {
              height:
                `calc(100vh - ${barHeightSmUp}px - ${searchHeight}px)`
            }
            , borderRight: '1px solid #CCC' }
, noteEdit: { flex: 1 }
});

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Dashboard));
