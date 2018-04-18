import React          from 'react';
import PropTypes      from 'prop-types';
import { Link }       from 'react-router-dom';
import NoteAction     from 'Actions/NoteAction';
import std            from 'Utilities/stdutils';

import { withStyles } from 'material-ui/styles';
import { List, Paper, Checkbox, Button, Typography }
                      from 'material-ui';
import { ListItem, ListItemText, ListItemSecondaryAction }
                      from 'material-ui/List';
import RssFormDialog  from 'Components/RssFormDialog/RssFormDialog';
import RssDialog      from 'Components/RssDialog/RssDialog';

class RssList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opened:     []
    , checked:    props.selectedNoteId
    , notes:      props.notes
    , isSuccess:  false
    , isNotValid: false
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(RssList.displayName, 'Props', nextProps);
    const { selectedNoteId: checked, notes } = nextProps;
    this.setState({ checked, notes });
  }

  handleChangeDialog(id, event) {
    std.logInfo(RssList.displayName, 'handleChangeDialog', id);
    const { opened } = this.state;
    const currentIndex = opened.indexOf(id);
    const newOpened = [...opened];
    if (currentIndex === -1)  newOpened.push(id);
    else newOpened.splice(currentIndex, 1);
    this.setState({ opened: newOpened });
  }

  handleChangeCheckbox(id, event) {
    std.logInfo(RssList.displayName, 'handleChangeCheckbox', id);
    const { checked } = this.state;
    const { user } = this.props;
    const currentIndex = checked.indexOf(id);
    const newChecked = [...checked];
    if (currentIndex === -1)  newChecked.push(id);
    else newChecked.splice(currentIndex, 1);
    NoteAction.select(user, newChecked);
  }
  
  handleChangeTitle(id, title) {
    std.logInfo(RssList.displayName, 'handleChangeTitle', id);
    const { user } = this.props;
    const { notes } = this.state;
    const curNote = notes.find(obj => obj._id === id);
    const newNote = Object.assign({}, curNote, { title });
    NoteAction.update(user, id, newNote)
      .then(() => this.setState({ isSuccess: true }))
      .catch(err => this.setState({ isNotValid: true }));
  }

  handleReaded(note) {
    //std.logInfo(RssList.displayName, 'handleReaded', note._id);
    const { user } = this.props;
    if(note.items.length) NoteAction.createRead(user, [note._id]);
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  renderItem(note) {
    const { classes } = this.props;
    const { checked } = this.state;
    const textClass =
      { primary: classes.primary, secondary: classes.secondary };
    const linkTo = `/${note.category}/${note._id}/edit`;
    let newRelease = 0;
    if (note.items)
      note.items.forEach(item => { if(!item.readed) newRelease++; });
    const notice = newRelease ? `${newRelease}件 NEW` : '';
    const title = note.title;
    const updated =
      std.formatDate(new Date(note.updated), 'YYYY/MM/DD hh:mm');
    return <div key={note._id} className={classes.noteItem}>
      <Checkbox className={classes.checkbox}
        onClick={this.handleChangeCheckbox.bind(this, note._id)}
        checked={checked.indexOf(note._id) !== -1}
        tabIndex={-1} disableRipple />
      <Paper className={classes.paper}>
        <ListItem dense button disableGutters className={classes.listItem}
          onClick={this.handleReaded.bind(this, note)}
          component={Link} to={linkTo}>
            <ListItemText classes={textClass}
              primary={title} secondary={updated}/>
            <ListItemSecondaryAction>
              <Button className={classes.button}
                onClick={this.handleChangeDialog.bind(this, note._id)}
                color="primary">編集</Button>
              <RssFormDialog title="タイトルを編集する"
                selectedNoteId={note._id} title={note.title}
                open={this.state.opened.indexOf(note._id) !== -1}
                onClose={this.handleChangeDialog.bind(this, note._id)}
                onSubmit={this.handleChangeTitle.bind(this)}>
                {title}</RssFormDialog>
            </ListItemSecondaryAction>
        </ListItem>
      </Paper>
      <div className={classes.notice}>
        <Typography color="secondary" noWrap>{notice}</Typography>
      </div>
    </div>;
  }

  render() {
    const { classes } = this.props;
    const { isSuccess, isNotValid, notes } = this.state;
    const compareId = (a, b) => {
      if(a._id < b._id) return 1;
      if(a._id > b._id) return -1;
      return 0;
    };
    const renderItems = notes
      .sort(compareId)
      .map(note => this.renderItem(note));
    return <List className={classes.noteList}>
      {renderItems}
      <RssDialog open={isSuccess} title={'送信完了'}
        onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
        要求を受け付けました。
      </RssDialog>
      <RssDialog open={isNotValid} title={'送信エラー'}
        onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
        内容に不備があります。もう一度確認してください。
      </RssDialog>
    </List>;
  }
};

const barHeightSmUp     = 64;//112;
const barHeightSmDown   = 56;//104;
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
