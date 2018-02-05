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

  handleClickNew() {
    return NoteAction.create();
  }

  render() {
    //console.log('>>> render!!', 'State:', this.state);
    console.log('>>> render!!', 'Props:', this.props);
    const {classes, match, route} = this.props;
    const {notes} = this.state;
    const note = notes.find(note => note.id === Number(match.params.id));
    return <div className={classes.root}>
      <div className={classes.list}>
        <div className={classes.listHead}>
          <Button raised size="medium" color="primary"
            className={classes.button}
            onClick={this.handleClickNew.bind(this)}>
          New Note</Button>
        </div>
        <NoteList notes={notes} selectedNoteId={match.params.id}/>
      </div>
      <div className={classes.noteEdit}>
        {route.routes ? renderRoutes(route.routes, {note: note}) : null}
      </div>
    </div>;
  }
};

const styles = theme => ({
  root:     { display: 'flex', flexDirection: 'row' },
  list:     { width: '260px', height: 'calc(100vh - 112px)'
            , borderRight: '1px solid #CCC' },
  listHead: { height: '62px', boxSizing: 'border-box', padding: '5px'
            , borderBottom: '1px solid #CCC' },
  button:   { margin: theme.spacing.unit },
  noteEdit: { flex: 1 }
});

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Dashboard));
