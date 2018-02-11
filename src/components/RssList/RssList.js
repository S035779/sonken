import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import { List, Paper, Checkbox, Button, Typography } from 'material-ui';
import {
  ListItem, ListItemText, ListItemSecondaryAction
} from 'material-ui/List';

class RssList extends React.Component {
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
    return <div key={note.id} className={classes.noteItem}>
      <ListItem button dense className={classes.listItem}>
        <Checkbox className={classes.checkbox}
          onClick={this.handleToggle.bind(this, note.id)}
          checked={this.state.checked.indexOf(note.id) !== -1}
          tabIndex={-1} disableRipple />
        <Paper className={classes.paper}>
          <ListItemText classes={textClass}
            primary={note.title} secondary={note.updated}/>
          <ListItemSecondaryAction>
            <Button className={classes.button}
              variant="raised" color="primary"
              component={Link} to={`/notes/${note.id}/edit`}>編集</Button>
          </ListItemSecondaryAction>
        </Paper>
      </ListItem>
      <div className={classes.notice}>
        <Typography noWrap>{'1件 NEW'}</Typography>
      </div>
    </div>;
  }

  render() {
    const {classes, notes} = this.props;
    const items = notes.map(note => this.renderItem(note));
    return <List className={classes.noteList}>
      {items}
    </List>;
  }
};

const barHeightSmUp = 112;
const barHeightSmDown = 104;
const titleHeight = 62;
const searchHeight = 62;
const styles = theme => ({
  noteList:     { width: '100%', overflow: 'scroll', height: `calc(100vh - ${barHeightSmDown}px - ${titleHeight}px - ${searchHeight}px)`
                , [theme.breakpoints.up('sm')]: { height: `calc(100vh - ${barHeightSmUp}px - ${titleHeight}px - ${searchHeight}px)` }}
  , noteItem:   { display: 'flex', flexDirection: 'row'
                , alignItems: 'center' }
  , listItem:   { '&:hover':  { backgroundColor: theme.palette.primary.main
                  , '& $checkbox': { color: theme.palette.common.white }}}
  , checkbox:   {}
  , button:     { margin: theme.spacing.unit, wordBreak: 'keep-all'
                , minWidth: 64
                , '&:hover':  { color: theme.palette.common.white }}
  , paper:      { width: '100%'
                , height: 64, padding: theme.spacing.unit /2
                , '&:hover':  { backgroundColor: theme.palette.primary.main
                  , '& $primary, $secondary': {
                    color: theme.palette.common.white }}}   
  , primary:    {}
  , secondary:  {}
  , notice:     { flex:1, padding: theme.spacing.unit /2 }
});

RssList.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(RssList);
