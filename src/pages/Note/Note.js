import React from 'react';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import NoteAction from 'Actions/NoteAction';
import StarAction from 'Actions/StarAction';
import { getStores, getState } from 'Stores';

import { withStyles } from 'material-ui/styles';
import NoteHeader from 'Components/NoteHeader/NoteHeader';
import NoteBody from 'Components/NoteBody/NoteBody';

class Note extends React.Component {
  static getStores() {
    return getStores(['noteStore']);
  }

  static calculateState() {
    return getState('noteStore');
  }

  static prefetch(props) {
    console.log('Notes prefetch!!', 'Props:', props)
    return NoteAction.fetch(Number(props.match.params.id));;
  }

  componentDidMount() {
    console.log('Notes did mount!!');
    Note.prefetch(this.props);
  }

  handleChangeStar(starred) {
    const note = Object.assign({}, this.state.note, { starred });
    this.setState({ note });
    if(starred) StarAction.create(note.id);
    else StarAction.delete(note.id);
  }

  render() {
    const { classes } = this.props;
    const note = this.state.note;
    if(!note || !note.id) return null;
    return <div className={classes.root}>
      <NoteHeader note={note}
        onChangeStar={this.handleChangeStar.bind(this)} />
      <NoteBody body={note.body} />
    </div>;
  }
};
const styles = {
  root: {}
};
Note.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Note));
