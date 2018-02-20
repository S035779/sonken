import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import NoteAction from 'Actions/NoteAction';

import { withStyles } from 'material-ui/styles';
import { List, Paper, Checkbox, Button, Typography } from 'material-ui';
import { ListItem, ListItemText, ListItemSecondaryAction
  } from 'material-ui/List';

class TradeItemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { checked: [], traded: [], notes: props.notes };
  }

  componentWillReceiveProps(props) {
    this.setState({ notes: props.notes });
  }

  handleChangeTraded(id, event) {
    console.log('>>> handleChangeDialog:', id);
    const { traded } = this.state;
    const currentIndex = traded.indexOf(id);
    const newOpened = [...traded];
    if (currentIndex === -1)  newOpened.push(id);
    else newOpened.splice(currentIndex, 1);
    this.setState({ traded: newOpened });
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

  handleDelete(id) {
    if(window.confirm('Are you sure?')) {
      NoteAction.delete(this.state.note.id);
    }
  }

  renderItem(note) {
    const { classes } = this.props;
    const { traded } = this.state;
    const textClass ={
      primary: classes.primary, secondary: classes.secondary };
    const linkTo = `/${note.category}/${note.id}/edit`;
    const buttonText = traded.indexOf(note.id) !== -1
      ? '取引 完了'
      : '取引 未完了';
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
              <Button variant="raised" color="primary"
                className={classes.button}
                onClick={this.handleChangeTraded.bind(this, note.id)}>
                {buttonText}</Button>
            </ListItemSecondaryAction>
        </ListItem>
      </Paper>
      <div className={classes.notice}>
        <Typography noWrap>{''}</Typography>
      </div>
    </div>;
  }

  render() {
    const { classes } = this.props;
    const { notes } = this.props;
    const items = notes.map(note => this.renderItem(note));
    return <List className={classes.noteList}>
      {items}
    </List>;
  }
};
const barHeightSmDown   = 104;
const barHeightSmUp     = 112;
const searchHeight      = 62;
const filterHeight      = 186;
const itemHeight        = 128;
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
  , checkbox:   {}
  , button:     { width: 80, wordBreak: 'keep-all' }
  , paper:      { width: '100%', margin: theme.spacing.unit /8
                , '&:hover':  {
                  backgroundColor: theme.palette.primary.main
                  , '& $primary, $secondary': {
                    color: theme.palette.common.white }}}   
  , primary:    {}
  , secondary:  {}
  , notice:     { flex:1, padding: theme.spacing.unit /2
                , minWidth: noticeWidth }
});
TradeItemList.displayName = 'TradeItemList';
TradeItemList.defaultProps = { notes: null }
TradeItemList.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(TradeItemList);
