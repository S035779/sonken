import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider';

class NoteList extends React.Component {
  renderItem(note) {
    const {classes} = this.props;
    return <div key={note.id}>
      <ListItem button>
      <Link to={`/notes/${note.id}/edit`} className={classes.link}>
        <ListItemText primary={note.title} secondary={note.updated}/>
      </Link>
      </ListItem>
      <Divider light />
      </div>;
  }
  render() {
    const {classes} = this.props;
    const items = this.props.notes.map(note => this.renderItem(note));
    return <div className={classes.root}>
      <List dense className={classes.list}>
      {items}
      </List>
      </div>;
  }
};

const styles = theme => ({
  root:     { width: '100%', minWidth: 260 },
  list:     { backgroundColor: theme.palette.background.paper },
  link: { textDecoration: 'none' }
});

NoteList.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NoteList);
