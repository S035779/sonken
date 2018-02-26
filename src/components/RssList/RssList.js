import React          from 'react';
import PropTypes      from 'prop-types';
import { Link }       from 'react-router-dom';
import NoteAction     from 'Actions/NoteAction';
import std            from 'Utilities/stdutils';

import { withStyles } from 'material-ui/styles';
import {
  List, Paper, Checkbox, Button, Typography
}                     from 'material-ui';
import {
  ListItem, ListItemText, ListItemSecondaryAction
}                     from 'material-ui/List';
import RssFormDialog  from 'Components/RssFormDialog/RssFormDialog';

class RssList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opened:   []
    , checked:  props.selectedNoteId
    , notes:    props.notes
    };
  }

  componentWillReceiveProps(props) {
    this.logInfo('comopnentWillReceiveProps', props);
    const checked = props.selectedNoteId;
    const notes = props.notes;
    this.setState({ checked, notes });
  }

  handleChangeDialog(id, event) {
    this.logInfo('handleChangeDialog', id);
    const { opened } = this.state;
    const currentIndex = opened.indexOf(id);
    const newOpened = [...opened];
    if (currentIndex === -1)  newOpened.push(id);
    else newOpened.splice(currentIndex, 1);
    this.setState({ opened: newOpened });
  }

  handleChangeCheckbox(id, event) {
    this.logInfo('handleChangeCheckbox', id);
    const { checked } = this.state;
    const currentIndex = checked.indexOf(id);
    const newChecked = [...checked];
    if (currentIndex === -1)  newChecked.push(id);
    else newChecked.splice(currentIndex, 1);
    NoteAction.select(newChecked);
  }
  
  handleChangeTitle({ id, title }) {
    this.logInfo('handleChangeTitle', id);
    const { notes } = this.state;
    const curNote = notes.find(obj => obj.id === id);
    const newNote = Object.assign({}, curNote, { title });
    const newNotes = notes.map(obj => obj.id === id ? newNote : obj);
    NoteAction.update(newNote);
  }

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  }

  renderItem(note) {
    const { classes } = this.props;
    const textClass = {
      primary:    classes.primary
    , secondary:  classes.secondary
    };
    const linkTo = `/${note.category}/${note.id}/edit`;
    const notice = !note.readed ? '99件 NEW' : '';
    const title = note.title;
    const updated =
      std.formatDate(new Date(note.updated), 'YYYY/MM/DD hh:mm');
    return <div key={note.id} className={classes.noteItem}>
      <Checkbox className={classes.checkbox}
        onClick={this.handleChangeCheckbox.bind(this, note.id)}
        checked={this.state.checked.indexOf(note.id) !== -1}
        tabIndex={-1} disableRipple />
      <Paper className={classes.paper}>
        <ListItem dense button disableGutters className={classes.listItem}
          component={Link} to={linkTo}>
            <ListItemText classes={textClass}
              primary={title} secondary={updated}/>
            <ListItemSecondaryAction>
              <Button className={classes.button}
                onClick={this.handleChangeDialog.bind(this, note.id)}
                color="primary">編集</Button>
              <RssFormDialog title="タイトルを編集する"
                note={note}
                open={this.state.opened.indexOf(note.id) !== -1}
                onClose={this.handleChangeDialog.bind(this, note.id)}
                onSubmit={this.handleChangeTitle.bind(this)}>
                {title}</RssFormDialog>
            </ListItemSecondaryAction>
        </ListItem>
      </Paper>
      <div className={classes.notice}>
        <Typography noWrap>{notice}</Typography>
      </div>
    </div>;
  }

  render() {
    const { classes } = this.props;
    const { notes } = this.state;
    const renderItems = notes.map(note => this.renderItem(note));
    return <List className={classes.noteList}>
      {renderItems}
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
