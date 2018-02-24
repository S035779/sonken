import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import NoteAction from 'Actions/NoteAction';

import { withStyles } from 'material-ui/styles';
import { List, Paper, Checkbox, Button, Typography } from 'material-ui';
import { ListItem, ListItemText, ListItemSecondaryAction
  } from 'material-ui/List';

class BidsItemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      traded: []
    , checked: props.selectedItemId
    , notes: props.notes
    };
  }

  componentWillReceiveProps(props) {
    this.logInfo('componentWillReciveProps', props);
    const checked = props.selectedItemId;
    const notes = props.notes;
    this.setState({ checked, notes });
  }

  handleChangeTraded(id, event) {
    this.logInfo('handleChangeTraded', id);
    const { traded } = this.state;
    const currentIndex = traded.indexOf(id);
    const newTraded = [...traded];
    if (currentIndex === -1)  newTraded.push(id);
    else newTraded.splice(currentIndex, 1);
    this.setState({ traded: newTraded });
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

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  }

  renderItem(note, item) {
    const { classes } = this.props;
    const { traded } = this.state;
    const textClass = {
      primary: classes.primary
    , secondary: classes.secondary
    };
    const buttonText = traded.indexOf(item.guid._) !== -1
      ? '取引チェック 登録済み' : '取引チェック 登録';
    const notice = '';
    return <div key={item.guid._} className={classes.noteItem}>
      <Checkbox className={classes.checkbox}
        onClick={this.handleChangeCheckbox.bind(this, item.guid._)}
        checked={this.state.checked.indexOf(item.guid._) !== -1}
        tabIndex={-1} disableRipple />
      <Paper className={classes.paper}>
        <ListItem dense button disableGutters
          className={classes.listItem}>
            <div className={classes.description}
              dangerouslySetInnerHTML={{__html: item.description}} />
            <ListItemText classes={textClass}
              className={classes.listItemText}
              primary={item.title} secondary={item.pubDate}/>
            <ListItemSecondaryAction>
              <Button variant="raised" color="primary"
                className={classes.button}
                onClick={this.handleChangeTraded.bind(this, item.guid._)}>
                {buttonText}</Button>
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
    const { notes } = this.props;
    const items = notes.map(note => note.items
      ? note.items.map(item => this.renderItem(note, item)) : '' );
    return <List className={classes.noteList}>
      {items}
    </List>;
  }
};
const barHeightSmDown   = 104;
const barHeightSmUp     = 112;
const searchHeight      = 62;
const filterHeight      = 186;
const itemHeight        = 160;
const descMinWidth      = 133;
const listHeightSmDown  =
  `calc(100vh - ${barHeightSmDown}px - ${filterHeight}px - ${searchHeight}px)`;
const listHeightSmUp    =
  `calc(100vh - ${barHeightSmUp}px - ${filterHeight}px - ${searchHeight}px)`;
const noticeWidth       = 72;
const styles = theme => ({
  noteList:     { width: '100%', overflow: 'scroll'
                , height: listHeightSmDown
                , [theme.breakpoints.up('sm')]: {
                  height: listHeightSmUp }}
  , noteItem:   { display: 'flex', flexDirection: 'row'
                , alignItems: 'center' }
  , listItem:   { height: itemHeight, padding: theme.spacing.unit /2
                , '&:hover':  {
                  backgroundColor: theme.palette.primary.main
                  , '& $checkbox': { color: theme.palette.common.white }}}
  , listItemText: { marginRight: descMinWidth }
  , checkbox:   {}
  , button:     { width: 128, wordBreak: 'keep-all' }
  , paper:      { width: '100%', margin: theme.spacing.unit /8
                , '&:hover':  {
                  backgroundColor: theme.palette.primary.main
                  , '& $primary, $secondary': {
                    color: theme.palette.common.white }}}   
  , primary:    {}
  , secondary:  {}
  , notice:     { flex:1, padding: theme.spacing.unit /2
                , minWidth: noticeWidth }
  , description: { minWidth: descMinWidth, width: descMinWidth
                , fontSize: 12 }
});
BidsItemList.displayName = 'BidsItemList';
BidsItemList.defaultProps = { notes: null }
BidsItemList.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(BidsItemList);
