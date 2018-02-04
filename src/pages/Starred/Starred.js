import React from 'react';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import NoteAction from 'Actions/NoteAction';
import { getStores, getState } from 'Stores';

import { withStyles } from 'material-ui/styles';
import StarredNoteList from 'Components/StarredNoteList/StarredNoteList';

class Starred extends React.Component {
  static getStores() {
    return getStores(['starredNotesStore']);
  }

  static calculateState() {
    return getState('starredNotesStore');
  }

  static prefetch(props) {
    console.log('Starred prefetch!!', 'Props:', props)
    return NoteAction.fetchStarred();
  }

  componentDidMount() {
    console.log('Starred did mount!!');
    Starred.prefetch(this.props);
  }

  render() {
    console.log(this.state.notes);
    const { classes } = this.props;
    return <div className={classes.root}>
      <h1 className={classes.title}>Starred Notes</h1>
      <StarredNoteList notes={this.state.notes} />
      </div>;
  }
};
const styles = {
  root:   { padding: '10px' },
  title:  { fontSize: '32px', fontWeight: 'bold', margin: '20px 10px' }
};
Starred.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Starred));
