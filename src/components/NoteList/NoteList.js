import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import { List, Divider, Avatar } from 'material-ui';
import { ListItem, ListItemText } from 'material-ui/List';
import deepPurple from 'material-ui/colors/deepPurple';

class NoteList extends React.Component {
  renderItem(note) {
    const {classes} = this.props;
    return <div key={note.id}>
      <ListItem button
        component={Link} to={`/notes/${note.id}/edit`}
        className={classes.listItem}>
        <Avatar  className={classes.avatar}>M</Avatar>
        <ListItemText
          classes={
            { primary: classes.primary, secondary: classes.secondary } }
          primary={note.title} secondary={note.updated}/>
      </ListItem>
      <Divider light />
      </div>;
  }
  render() {
    const {classes} = this.props;
    const items = this.props.notes.map(note => this.renderItem(note));
    return <div className={classes.noteList}>
      <List dense>
      {items}
      </List>
      </div>;
  }
};

const styles = theme => ({
  noteList:   { width: '100%' },
  primary:    {},
  secondary:  {},
  listItem:   { '&:hover': {
                backgroundColor: theme.palette.primary.main
                , '& $primary, $secondary': {
                  color: theme.palette.common.white }}},
  avatar:     { color: '#fff'
              , backgroundColor: deepPurple[500] }
});

NoteList.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NoteList);
