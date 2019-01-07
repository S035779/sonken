import loadable         from '@loadable/component';
import React          from 'react';
import PropTypes      from 'prop-types';
import { Link }       from 'react-router-dom';
import * as R         from 'ramda';
import NoteAction     from 'Actions/NoteAction';
import std            from 'Utilities/stdutils';
import Spinner        from 'Utilities/Spinner';

import { withStyles } from '@material-ui/core/styles';
import { List, Paper, Checkbox, Button, Typography, ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
const RssFormDialog = loadable(() => import('Components/RssFormDialog/RssFormDialog'));
const RssDialog     = loadable(() => import('Components/RssDialog/RssDialog'));

class RssList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opened: []
    , checked: props.selectedNoteId
    , notes: props.notes
    , category: props.category
    , prevPage: 1
    , isSuccess: false
    , isNotValid: false
    , isRequest: false
    };
  }

  componentDidMount() {
    this.spn = Spinner.of('app');
  }

  componentWillUnmount() {
    this.spn.stop();
  }

  componentWillReceiveProps(nextProps) {
    const { user, noteNumber } = this.props;
    const { number, perPage } = nextProps.notePage;
    const nextChecked   = nextProps.selectedNoteId;
    const prevChecked   = this.state.checked;
    const nextNotes     = nextProps.notes;
    const nextPage      = number;
    const nextCategory  = nextProps.category;
    const prevNotes     = this.state.notes;
    const prevPage      = this.state.prevPage;
    const prevCategory  = this.state.category;
    const maxNumber     = Math.ceil(noteNumber / perPage);
    //std.logInfo(RssList.displayName, 'Pros', { nextNotes, nextPage, prevNotes, prevPage, prevCategory, nextCategory });
    if(prevChecked.length !== nextChecked.length) {
      //std.logInfo(RssList.displayName, 'Checked', { nextNotes, nextPage, prevNotes, prevPage, prevCategory, nextCategory });
      this.setState({ checked: nextChecked });
    } else 
    if(nextNotes.length !== 0) {
      if(prevCategory !== nextCategory) {
        //std.logInfo(RssList.displayName, 'Init', { nextNotes, nextPage, prevNotes, prevPage, prevCategory, nextCategory });
        this.formsRef.scrollTop = 0;
        this.setState({ checked: nextChecked, notes: nextNotes, prevPage: 1, category: nextCategory }
          , () => NoteAction.pagenation(user, { maxNumber, number: 1, perPage }));
      } else 
      if(prevPage !== nextPage && (prevPage < maxNumber)) {
        //std.logInfo(RssList.displayName, 'Update', { nextNotes, nextPage, prevNotes, prevPage, prevCategory, nextCategory });
        this.setState({ checked: nextChecked, notes: nextNotes, prevPage: nextPage });
      } else
      if(prevNotes.length === 0) {
        //std.logInfo(RssList.displayName, 'Ready', { nextNotes, nextPage, prevNotes, prevPage, prevCategory, nextCategory });
        this.formsRef.scrollTop = 0;
        this.setState({ checked: nextChecked, notes: nextNotes, prevPage: 1, category: nextCategory }
          , () => NoteAction.pagenation(user, { maxNumber, number: 1, perPage }));
      } else
      if(prevNotes.length !== nextNotes.length) {
        //std.logInfo(RssList.displayName, 'Add/Delete', { nextNotes, nextPage, prevNotes, prevPage, prevCategory, nextCategory });
        this.setState({ checked: nextChecked, notes: nextNotes, prevPage: nextPage });
      }
    } else if(nextNotes.length === 0) {
      if(prevCategory !== nextCategory) {
        //std.logInfo(RssList.displayName, 'Init2', { nextNotes, nextPage, prevNotes, prevPage, prevCategory, nextCategory });
        this.formsRef.scrollTop = 0;
        this.setState({ checked: nextChecked, notes: nextNotes, prevPage: 1, category: nextCategory }
          , () => NoteAction.pagenation(user, { maxNumber, number: 1, perPage }));
      } else 
      if(prevPage !== nextPage) {
        //std.logInfo(RssList.displayName, 'Max', { nextNotes, nextPage, prevNotes, prevPage, prevCategory, nextCategory });
        this.setState({ checked: nextChecked, prevPage: nextPage });
      } else
      if(prevNotes.length !== nextNotes.length) {
        //std.logInfo(RssList.displayName, 'Add/Delete2', { nextNotes, nextPage, prevNotes, prevPage, prevCategory, nextCategory });
        this.setState({ checked: nextChecked, notes: nextNotes, prevPage: nextPage });
      }
    }
  }

  handlePagination() {
    const { isRequest, prevPage } = this.state;
    const { notePage, noteNumber } = this.props;
    const number            = notePage.number;
    const maxNumber         = Math.ceil(noteNumber / notePage.perPage);
    const scrollTop         = this.formsRef.scrollTop;
    const scrollHeight      = this.formsRef.scrollHeight;
    const clientHeight      = this.formsRef.clientHeight;
    const scrolledToBottom  = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
    if(scrolledToBottom && !isRequest && (prevPage < maxNumber)) {
      this.spn.start();
      this.fetch(number + 1)
        .then(() => this.setState({ isRequest: false }))
        .then(() => this.spn.stop())
        .catch(err => {
          std.logError(RssList.displayName, err.name, err.message);
          this.spn.stop();
        });
    }
  }

  handleChangeDialog(id) {
    std.logInfo(RssList.displayName, 'handleChangeDialog', id);
    const { opened } = this.state;
    const currentIndex = opened.indexOf(id);
    const newOpened = [...opened];
    if (currentIndex === -1)  newOpened.push(id);
    else newOpened.splice(currentIndex, 1);
    this.setState({ opened: newOpened });
  }

  handleChangeCheckbox(id) {
    std.logInfo(RssList.displayName, 'handleChangeCheckbox', id);
    const { checked } = this.state;
    const { user } = this.props;
    const currentIndex = checked.indexOf(id);
    const newChecked = [...checked];
    if (currentIndex === -1)  newChecked.push(id);
    else newChecked.splice(currentIndex, 1);
    NoteAction.select(user, newChecked);
  }
  
  handleChangeTitle(id, category, title, categoryIds) {
    std.logInfo(RssList.displayName, 'handleChangeTitle', id);
    const { user } = this.props;
    const { notes } = this.state;
    const curNote = notes.find(obj => obj._id === id);
    const newNote = R.merge(curNote, { title, categoryIds });
    NoteAction.update(user, category, id, newNote)
      .then(() => this.setState({ isSuccess: true }))
      .catch(err => {
        std.logError(RssList.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
      });
  }

  handleReaded({ _id, category, items }) {
    const { user } = this.props;
    if (items && items.length) {
      NoteAction.fetch(user, category, _id, 0, 20)
      .then(() => NoteAction.createRead(user, [_id]));
    } else {
      NoteAction.fetch(user, category, _id, 0, 20);
    }
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  fetch(number) {
    //std.logInfo(RssList.displayName, 'Props', this.props);
    const { user, category, notePage, noteNumber, itemFilter } = this.props;
    const { perPage } = notePage;
    const skip = (number - 1) * perPage;
    const limit = perPage;
    const maxNumber = Math.ceil(noteNumber / perPage);
    std.logInfo(RssList.displayName, 'fetch', { noteNumber, number, perPage, skip, limit });
    this.setState({ isRequest: true });
    return NoteAction.appendNotes(user, category, skip, limit, itemFilter)
      .then(() => NoteAction.pagenation(user, { maxNumber, number, perPage }));
  }

  renderItem(index, note) {
    const { classes, user, categorys, categoryId, title } = this.props;
    const { checked } = this.state;
    const textClass = { primary: classes.primary, secondary: classes.secondary };
    const linkTo = { pathname: `/${note.category}/${note._id}/edit`, state: { categoryId } };
    let newRelease = 0;
    if (note.items) note.items .forEach(item => { if(!item.readed) newRelease++; });
    const notice = newRelease ? `${newRelease}件 NEW` : '';
    const noteTitle = note.title;
    const updated = std.formatDate(new Date(note.updated), 'YYYY/MM/DD hh:mm');
    const _categorys = category => categorys
      .filter(obj => category === obj.category)
      .sort((a, b) => parseInt(a.subcategoryId, 16) < parseInt(b.subcategoryId, 16)
        ? 1 : parseInt(a.subcategoryId, 16) > parseInt(b.subcategoryId, 16) ? -1  : 0);
    const categoryList = category => categorys ? _categorys(category) : null;
    return <div key={index} className={classes.noteItem}>
      <Checkbox className={classes.checkbox} onClick={this.handleChangeCheckbox.bind(this, note._id)}
        checked={checked.indexOf(note._id) !== -1} tabIndex={-1} disableRipple />
      <Paper className={classes.paper}>
        <ListItem dense button disableGutters className={classes.listItem} onClick={this.handleReaded.bind(this, note)}
          component={Link} to={linkTo}>
          <ListItemText classes={textClass} primary={noteTitle} secondary={updated}/>
          <ListItemSecondaryAction>
            <Button className={classes.button} onClick={this.handleChangeDialog.bind(this, note._id)} color="primary">編集</Button>
            <RssFormDialog user={user} selectedNoteId={note._id} noteTitle={note.title} title={title}
              category={note.category} categorys={categoryList(note.category)} categoryIds={note.categoryIds}
              open={this.state.opened.indexOf(note._id) !== -1} onClose={this.handleChangeDialog.bind(this, note._id)}
              onSubmit={this.handleChangeTitle.bind(this)} />
            </ListItemSecondaryAction>
        </ListItem>
      </Paper>
      <div className={classes.notice}><Typography color="secondary" noWrap>{notice}</Typography></div>
    </div>;
  }

  render() {
    const { classes } = this.props;
    const { isSuccess, isNotValid, notes } = this.state;
    const mapIndexed = R.addIndex(R.map);
    const renderItems = mapIndexed((note, index) => this.renderItem(index, note), notes);
    return <div ref={node => this.formsRef = node} onScroll={this.handlePagination.bind(this)} className={classes.forms}>
        <List className={classes.noteList}>{renderItems}</List>
        <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
          要求を受け付けました。
        </RssDialog>
        <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
          内容に不備があります。もう一度確認してください。
        </RssDialog>
      </div>;
  }
}
RssList.displayName = 'RssList';
RssList.defaultProps = { notes: null }
RssList.propTypes = {
  classes: PropTypes.object.isRequired
, selectedNoteId: PropTypes.array.isRequired
, notes: PropTypes.array.isRequired
, user: PropTypes.string.isRequired
, categorys: PropTypes.array.isRequired
, categoryId: PropTypes.string.isRequired
, title: PropTypes.string.isRequired
, category: PropTypes.string.isRequired
, notePage: PropTypes.object.isRequired
, noteNumber: PropTypes.number.isRequired
, itemFilter: PropTypes.object.isRequired
};

const barHeightSmUp     = 64;
const barHeightSmDown   = 56;
const titleHeight       = 62;
const searchHeight      = 62;
const itemHeight        = 64;
const listHeightSmDown  = `calc(100vh - ${barHeightSmDown}px - ${titleHeight}px - ${searchHeight}px)`;
const listHeightSmUp    = `calc(100vh - ${barHeightSmUp}px - ${titleHeight}px - ${searchHeight}px)`;
const noticeWidth       = 72;
const styles = theme => ({
  forms:      { display: 'flex', flexDirection: 'column', overflow: 'auto' }
, noteList:   { width: '100%', height: listHeightSmDown, [theme.breakpoints.up('sm')]: { height: listHeightSmUp }}
, noteItem:   { display: 'flex', flexDirection: 'row', alignItems: 'center' }
, listItem:   { height: itemHeight, padding: theme.spacing.unit /2, '&:hover':  { backgroundColor: theme.palette.primary.main
              , '& $checkbox': { color: theme.palette.common.white }}}
, checkbox:   {}
, button:     { wordBreak: 'keep-all', margin: '8px 0', minWidth: 0, '&:hover':  { color: theme.palette.common.white }}
, paper:      { width: '100%', margin: theme.spacing.unit /8, '&:hover':  { backgroundColor: theme.palette.primary.main
              , '& $primary, $secondary': { color: theme.palette.common.white }}}   
, primary:    {}
, secondary:  {}
, notice:     { flex:1, padding: theme.spacing.unit /2, minWidth: noticeWidth }
});
export default withStyles(styles)(RssList);
