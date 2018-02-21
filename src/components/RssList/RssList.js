import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import NoteAction from 'Actions/NoteAction';

import { withStyles } from 'material-ui/styles';
import { List, Paper, Checkbox, Button, Typography } from 'material-ui';
import { ListItem, ListItemText, ListItemSecondaryAction
  } from 'material-ui/List';
import RssFormDialog from 'Components/RssFormDialog/RssFormDialog';

class RssList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { checked: [], opened: [], notes: props.notes };
  }

  componentWillReceiveProps(props) {
    this.setState({ notes: props.notes });
  }

  handleChangeDialog(id, event) {
    console.log('>>> handleChangeDialog:', id);
    const { opened } = this.state;
    const currentIndex = opened.indexOf(id);
    const newOpened = [...opened];
    if (currentIndex === -1)  newOpened.push(id);
    else newOpened.splice(currentIndex, 1);
    this.setState({ opened: newOpened });
  }

  handleChangeCheckbox(id, event) {
    console.log('>>> handleChangeCheckbox:', id);
    const { checked } = this.state;
    const currentIndex = checked.indexOf(id);
    const newChecked = [...checked];
    if (currentIndex === -1)  newChecked.push(id);
    else newChecked.splice(currentIndex, 1);
    this.setState({ checked: newChecked });
  }
  
  componentDidUpdate(prevProps, prevState) {
    NoteAction.selected(this.state.cheched);
  }

  handleChangeTitle(id, title) {
    console.log('>>> handleChangeTitle:', title);
    const { notes } = this.state;
    const currentNote = notes.filter(note => note.id === id);
    const newNote = Object.assign({}, currentNote, { title });
    const newNotes = notes.map(note => note.id === id ? newNote : note);
    this.setState({ note: newNotes});
    NoteAction.update(id, { title });
  }

  handleDelete(id) {
    if(window.confirm('Are you sure?')) {
      NoteAction.delete(this.state.note.id);
    }
  }

  renderItem(note) {
    const {classes} = this.props;
    const textClass ={
      primary: classes.primary, secondary: classes.secondary };
    const linkTo = `/${note.category}/${note.id}/edit`;
    return <div key={note.id} className={classes.noteItem}>
      <Checkbox className={classes.checkbox}
        onClick={this.handleChangeCheckbox.bind(this, note.id)}
        checked={this.state.checked.indexOf(note.id) !== -1}
        tabIndex={-1} disableRipple />
      <Paper className={classes.paper}>
        <ListItem dense button disableGutters className={classes.listItem}
          component={Link} to={linkTo}>
            <ListItemText classes={textClass}
              primary={note.title} secondary={note.updated}/>
            <ListItemSecondaryAction>
              <Button className={classes.button}
                onClick={this.handleChangeDialog.bind(this, note.id)}
                color="primary">編集</Button>
              <RssFormDialog title="タイトルを編集する"
                content={note}
                open={this.state.opened.indexOf(note.id) !== -1}
                onClose={this.handleChangeDialog.bind(this, note.id)}
                onSubmit={this.handleChangeTitle.bind(this, note.id)}>
                {note.title}</RssFormDialog>
            </ListItemSecondaryAction>
        </ListItem>
      </Paper>
      <div className={classes.notice}>
        <Typography noWrap>{'99件 NEW'}</Typography>
      </div>
    </div>;
  }

  render() {
    const { classes } = this.props;
    const { notes } = this.state;
    const items = notes.map(note => this.renderItem(note));
    return <List className={classes.noteList}>
      {items}
    </List>;
  }
};

const barHeightSmDown   = 104;
const barHeightSmUp     = 112;
const titleHeight       = 62;
const searchHeight      = 62;
const itemHeight        = 64;
const listHeightSmDown  = `calc(100vh - ${barHeightSmDown}px - ${titleHeight}px - ${searchHeight}px)`;
const listHeightSmUp    = `calc(100vh - ${barHeightSmUp}px - ${titleHeight}px - ${searchHeight}px)`;
const noticeWidth       = 72;
const styles = theme => ({
  noteList:     { width: '100%', overflow: 'scroll'
                , height: listHeightSmDown
                , [theme.breakpoints.up('sm')]: { height: listHeightSmUp }}
  , noteItem:   { display: 'flex', flexDirection: 'row'
                , alignItems: 'center' }
  , listItem:   { height: itemHeight, padding: theme.spacing.unit /2
                , '&:hover':  { backgroundColor: theme.palette.primary.main
                  , '& $checkbox': { color: theme.palette.common.white }}}
  , checkbox:   {}
  , button:     { wordBreak: 'keep-all'
                , margin: '8px 0'
                , minWidth: 0
                , '&:hover':  { color: theme.palette.common.white }}
  , paper:      { width: '100%', margin: theme.spacing.unit /8
                , '&:hover':  { backgroundColor: theme.palette.primary.main
                  , '& $primary, $secondary': {
                    color: theme.palette.common.white }}}   
  , primary:    {}
  , secondary:  {}
  , notice:     { flex:1, padding: theme.spacing.unit /2
                , minWidth: noticeWidth }
});
RssList.displayName = 'RssList';
RssList.defaultProps = { notes: null }
RssList.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssList);
