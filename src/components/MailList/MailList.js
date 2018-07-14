import React          from 'react';
import PropTypes      from 'prop-types';
import { Link }       from 'react-router-dom';
import MailAction     from 'Actions/MailAction';
import std            from 'Utilities/stdutils';

import { withStyles } from '@material-ui/core/styles';
import { List, Paper, Checkbox, Button, Typography, Avatar, ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { yellow }     from '@material-ui/core/colors';
import { Folder }     from '@material-ui/icons';

class MailList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked:  props.selectedMailId
    , mails:     props.mails
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(MailList.displayName, 'Props', nextProps);
    const { selectedMailId: checked, mails } = nextProps;
    this.setState({ checked, mails });
  }

  handleChangeCheckbox(id, event) {
    std.logInfo(MailList.displayName, 'handleChangeCheckbox', id);
    const { checked } = this.state;
    const { admin } = this.props;
    const currentIndex = checked.indexOf(id);
    const newChecked = [...checked];
    if (currentIndex === -1)  newChecked.push(id);
    else newChecked.splice(currentIndex, 1);
    MailAction.select(admin, newChecked);
  }
  
  renderItem(mail, index) {
    const { classes } = this.props;
    const { checked } = this.state;
    const textClass = {
      primary:    classes.primary
    , secondary:  classes.secondary
    };
    const linkTo = `/admin/mail/${mail._id}/edit`;
    const notice = mail.selected ? '選択済み' : '';
    const title = mail.title;
    const updated =
      std.formatDate(new Date(mail.updated), 'YYYY/MM/DD hh:mm');
    return <div key={index} className={classes.mailItem}>
      <Checkbox className={classes.checkbox}
        onClick={this.handleChangeCheckbox.bind(this, mail._id)}
        checked={checked.indexOf(mail._id) !== -1}
        tabIndex={-1} disableRipple />
      <Paper className={classes.paper}>
        <ListItem dense button disableGutters
          component={Link} to={linkTo}
          className={classes.listItem}>
          <Avatar className={classes.yellowAvatar}>
            <Folder />
          </Avatar>
          <ListItemText
            primary={title} secondary={updated} classes={textClass} />
        </ListItem>
      </Paper>
      <div className={classes.notice}>
        <Typography noWrap>{notice}</Typography>
      </div>
    </div>;
  }

  render() {
    const { classes } = this.props;
    const { mails } = this.state;
    const renderItems = mails
      .map((mail, index) => this.renderItem(mail, index));
    return <List className={classes.mailList}>
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
  mailList:   { width: '100%', overflow: 'scroll'
              , height: listHeightSmDown
              , [theme.breakpoints.up('sm')]: { height: listHeightSmUp }}
, mailItem:   { display: 'flex', flexDirection: 'row'
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
, yellowAvatar: { marginLeft: theme.spacing.unit
              , color: '#fff', backgroundColor: yellow[500] }
});
MailList.displayName = 'MailList';
MailList.defaultProps = { mails: null }
MailList.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(MailList);
