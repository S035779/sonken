import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import StarButton from 'Components/StarButton/StarButton';
import { AccountCircle } from 'material-ui-icons';

class NoteHeader extends React.Component {
  isOwn() {
    return this.props.note.user === 'MyUserName';
  }

  handleClickEdit() {
    this.props.history.push(`/notes/${this.props.note.id}/edit`);
  }

  handleClickDelete() {
    if(window.confirm('Are you sure?')) this.props.onDeleteNote();
  }

  render() {
    const { note, classes } = this.props;
    return <div className={classes.root}>
      <h1 className={classes.title}>{note.title}</h1>
      <div className={classes.meta}>
        <span className={classes.author}>
          <AccountCircle className={classes.icon} />{note.user}
        </span>
        <span className={classes.updated}>{note.updated}</span>
      </div>
      <div className={classes.buttons}>
        <Button raised size="medium" color="default"
          className={classes.button}
          hidden={!this.isOwn()}
          onClick={this.handleClickEdit.bind(this)}>Edit</Button>
        <StarButton starred={note.starred} 
          onChange={this.props.onChangeStar.bind(this)} />
      </div>
    </div>;
  }
};
const styles = theme => ({
  root:       { position: 'relative'      , borderBottom: '1px solid #CCC'
              , padding:  '15px 5px' }
  , title:    { margin:   0               , padding: 0
              , fontSize: '32px'          , fontWeight:   'bold' }
  , meta:     { fontSize: '15px'          , marginTop:    '10px' }
  , author:   { display:  'inline-block'  , marginRight:  '10px' }
  , update:   { color:    '#666' }
  , buttons:  { position: 'absolute'      , right: 0, top: '68px' }
  , icon:     { margin: theme.spacing.unit, verticalAlign: 'middle' }
  , button:   { margin: theme.spacing.unit }
});
NoteHeader.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(NoteHeader));
