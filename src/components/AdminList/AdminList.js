import React          from 'react';
import PropTypes      from 'prop-types';
import { Link }       from 'react-router-dom';
import UserAction     from 'Actions/UserAction';
import std            from 'Utilities/stdutils';

import { withStyles } from 'material-ui/styles';
import { List, Paper, Checkbox, Button, Typography, Avatar }
                      from 'material-ui';
import { ListItem, ListItemText, ListItemSecondaryAction }
                      from 'material-ui/List';
import pink           from 'material-ui/colors/pink';
import { Pageview }   from 'material-ui-icons';

class AdminList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked:  props.selectedUserId
    , users:    props.users
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(AdminList.displayName, 'Props', nextProps);
    const checked = nextProps.selectedUserId;
    const users = nextProps.users;
    this.setState({ checked, users });
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
  
  renderItem(user, index) {
    const { classes, category } = this.props;
    const { checked } = this.state;
    const textClass =
      { primary:    classes.primary, secondary:  classes.secondary };
    const linkTo = `/admin/${category}/${user._id}/edit`;
    const notice = user.approved ? '承認済み' : '';
    const name = user.name;
    const updated =
      std.formatDate(new Date(user.updated), 'YYYY/MM/DD hh:mm');
    return <div key={index} className={classes.userItem}>
      <Checkbox className={classes.checkbox}
        onClick={this.handleChangeCheckbox.bind(this, user._id)}
        checked={checked.indexOf(user._id) !== -1}
        tabIndex={-1} disableRipple />
      <Paper className={classes.paper}>
        <ListItem dense button disableGutters
          component={Link} to={linkTo}
          className={classes.listItem}>
          <Avatar className={classes.pinkAvatar}>
            <Pageview />
          </Avatar>
          <ListItemText
            primary={name} secondary={updated} classes={textClass} />
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
  userList:   { width: '100%', overflow: 'scroll'
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
, pinkAvatar: { marginLeft: theme.spacing.unit
              , color: '#fff', backgroundColor: pink[500] }
});
AdminList.displayName = 'AdminList';
AdminList.defaultProps = { users: null }
AdminList.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(AdminList);
