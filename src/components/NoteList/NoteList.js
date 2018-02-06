import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import { List, Divider } from 'material-ui';
import { ListItem, ListItemText } from 'material-ui/List';

class NoteList extends React.Component {
  renderItem(note) {
    const {classes} = this.props;
    return <div key={note.id}>
      <ListItem button className={classes.listItem}>
        <Link to={`/notes/${note.id}/edit`} className={classes.link}>
        <ListItemText
          classes={
            { primary: classes.primary, secondary: classes.secondary } }
          primary={note.title} secondary={note.updated}/>
        </Link>
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
  noteList: { width: '100%', minWidth: 260 },
  link:     { textDecoration: 'none' },
  primary:  {},
  secondary:  {},
  listItem: { '&:hover': {
                backgroundColor: theme.palette.primary.main
                , '& $primary, &secondary': {
                  color: theme.palette.common.white
  }}}
});

NoteList.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NoteList);
