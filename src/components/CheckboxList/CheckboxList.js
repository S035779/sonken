import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import { List, Divider, Checkbox, IconButton } from 'material-ui';
import { ListItem, ListItemText
  , ListItemSecondaryAction } from 'material-ui/List';
import { Comment as CommentIcon } from 'material-ui-icons';

class ChechboxList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { checked: [0] };
  }

  handleToggle(value) {
    const { checked } = this.state;
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.setState({ checked: newChecked });
  }

  renderItem(note) {
    const {classes} = this.props;
    const textClass ={
      primary: classes.primary, secondary: classes.secondary };
    return <div key={note.id}>
      <ListItem button dense
        onClick={this.handleToggle.bind(this, note.id)}
        className={classes.listItem}>
        <Checkbox checked={this.state.checked.indexOf(note.id) !== -1}
          tabIndex={-1} disableRipple />
        <ListItemText classes={textClass}
          primary={note.title} secondary={note.updated}/>
        <ListItemSecondaryAction>
          <IconButton aria-label="Comments"
            component={Link} to={`/notes/${note.id}/edit`}>
            <CommentIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      <Divider light />
      </div>;
  }

  render() {
    const {classes, notes} = this.props;
    const items = notes.map(note => this.renderItem(note));
    return <div className={classes.noteList}>
      <List>{items}</List>
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
                  color: theme.palette.common.white }}}
});

ChechboxList.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ChechboxList);
