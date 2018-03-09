import React          from 'react';
import PropTypes      from 'prop-types';
import { Link }       from 'react-router-dom';
import UserAction     from 'Actions/UserAction';
import std            from 'Utilities/stdutils';

import { withStyles } from 'material-ui/styles';
import {
  List, Paper, Checkbox, Button, Typography
}                     from 'material-ui';
import {
  ListItem, ListItemText, ListItemSecondaryAction
}                     from 'material-ui/List';
//import RssFormDialog  from 'Components/RssFormDialog/RssFormDialog';

class AdminList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opened:   []
    , checked:  props.selectedUserId
    , users:    props.users
    };
  }

  componentWillReceiveProps(props) {
    std.logInfo(AdminList.displayName, 'Props', props);
    const checked = props.selectedUserId;
    const users = props.users;
    this.setState({ checked, users });
  }

  handleChangeDialog(id, event) {
    std.logInfo(AdminList.displayName, 'handleChangeDialog', id);
    const { opened } = this.state;
    const currentIndex = opened.indexOf(id);
    const newOpened = [...opened];
    if (currentIndex === -1)  newOpened.push(id);
    else newOpened.splice(currentIndex, 1);
    this.setState({ opened: newOpened });
  }

  handleChangeCheckbox(id, event) {
    std.logInfo(AdminList.displayName, 'handleChangeCheckbox', id);
    const { checked } = this.state;
    const { admin } = this.props;
    const currentIndex = checked.indexOf(id);
    const newChecked = [...checked];
    if (currentIndex === -1)  newChecked.push(id);
    else newChecked.splice(currentIndex, 1);
    UserAction.select(admin, newChecked);
  }
  
  handleChangeTitle({ id, title }) {
    std.logInfo(AdminList.displayName, 'handleChangeTitle', id);
    const { users } = this.state;
    const { admin } = this.props;
    const curUser = users.find(obj => obj.id === id);
    const newUser = Object.assign({}, curUser, { title });
    const newUsers = users.map(obj => obj.id === id ? newUser : obj);
    UserAction.update(admin, newUser);
  }

  renderItem(user, index) {
    const { classes, category } = this.props;
    const { checked } = this.state;
    const textClass = {
      primary:    classes.primary
    , secondary:  classes.secondary
    };
    const linkTo = `/admin/${category}/${user._id}/edit`;
    let newRelease = 0;
    if (user.items)
      user.items.forEach(item => { if(!item.readed) newRelease++; });
    const notice = newRelease ? `${newRelease}件 NEW` : '';
    const name = user.name;
    const updated =
      std.formatDate(new Date(user.updated), 'YYYY/MM/DD hh:mm');
    return <div key={index} className={classes.userItem}>
      <Checkbox className={classes.checkbox}
        onClick={this.handleChangeCheckbox.bind(this, user.id)}
        checked={checked.indexOf(user._id) !== -1}
        tabIndex={-1} disableRipple />
      <Paper className={classes.paper}>
        <ListItem dense button disableGutters className={classes.listItem}
          component={Link} to={linkTo}>
            <ListItemText classes={textClass}
              primary={name} secondary={updated}/>
            <ListItemSecondaryAction>
      {/*
              <Button className={classes.button}
                onClick={this.handleChangeDialog.bind(this, user.id)}
                color="primary">編集</Button>
              <RssFormDialog title="タイトルを編集する"
                user={user}
                open={this.state.opened.indexOf(user.id) !== -1}
                onClose={this.handleChangeDialog.bind(this, user.id)}
                onSubmit={this.handleChangeTitle.bind(this)}>
                {title}</RssFormDialog>
      */}
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
    const { users } = this.state;
    const renderItems = users
      .map((user, index) => this.renderItem(user, index));
    return <List className={classes.userList}>
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
  userList:     { width: '100%', overflow: 'scroll'
                , height: listHeightSmDown
                , [theme.breakpoints.up('sm')]: { height: listHeightSmUp }}
  , userItem:   { display: 'flex', flexDirection: 'row'
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
AdminList.displayName = 'AdminList';
AdminList.defaultProps = { users: null }
AdminList.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(AdminList);
