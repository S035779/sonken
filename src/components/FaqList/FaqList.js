import React          from 'react';
import PropTypes      from 'prop-types';
import { Link }       from 'react-router-dom';
import FaqAction      from 'Actions/FaqAction';
import std            from 'Utilities/stdutils';

import { withStyles } from '@material-ui/core/styles';
import { List, Paper, Checkbox, Typography, Avatar, ListItem, ListItemText } from '@material-ui/core';
import { green }      from '@material-ui/core/colors';
import { Assignment } from '@material-ui/icons';

class FaqList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked:  props.selectedFaqId
    , faqs:     props.faqs
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(FaqList.displayName, 'Props', nextProps);
    const { selectedFaqId: checked, faqs } = nextProps;
    this.setState({ checked, faqs });
  }

  handleChangeCheckbox(id) {
    std.logInfo(FaqList.displayName, 'handleChangeCheckbox', id);
    const { checked } = this.state;
    const { admin } = this.props;
    const currentIndex = checked.indexOf(id);
    const newChecked = [...checked];
    if (currentIndex === -1)  newChecked.push(id);
    else newChecked.splice(currentIndex, 1);
    FaqAction.select(admin, newChecked);
  }
  
  renderItem(faq, index) {
    const { classes } = this.props;
    const { checked } = this.state;
    const textClass = {
      primary:    classes.primary
    , secondary:  classes.secondary
    };
    const linkTo = `/admin/faq/${faq._id}/edit`;
    const notice = faq.posted ? '掲載済み' : '';
    const title = faq.title;
    const updated =
      std.formatDate(new Date(faq.updated), 'YYYY/MM/DD hh:mm');
    return <div key={index} className={classes.faqItem}>
      <Checkbox className={classes.checkbox}
        onClick={this.handleChangeCheckbox.bind(this, faq._id)}
        checked={checked.indexOf(faq._id) !== -1}
        tabIndex={-1} disableRipple />
      <Paper className={classes.paper}>
        <ListItem dense button disableGutters
          component={Link} to={linkTo}
          className={classes.listItem}>
          <Avatar className={classes.greenAvatar}>
            <Assignment />
          </Avatar>
          <ListItemText
            primary={title} secondary={updated} classes={textClass} />
        </ListItem>
      </Paper>
      <div className={classes.notice}>
        <Typography variant="body2" noWrap>{notice}</Typography>
      </div>
    </div>;
  }

  render() {
    const { classes } = this.props;
    const { faqs } = this.state;
    const renderItems = faqs
      .map((faq, index) => this.renderItem(faq, index));
    return <List className={classes.faqList}>
      {renderItems}
    </List>;
  }
}
FaqList.displayName = 'FaqList';
FaqList.defaultProps = { faqs: null }
FaqList.propTypes = {
  classes: PropTypes.object.isRequired
, selectedFaqId: PropTypes.array.isRequired
, faqs: PropTypes.array.isRequired
, admin: PropTypes.string.isRequired
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
  faqList:   { width: '100%', overflow: 'scroll'
              , height: listHeightSmDown
              , [theme.breakpoints.up('sm')]: { height: listHeightSmUp }}
, faqItem:   { display: 'flex', flexDirection: 'row'
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
, greenAvatar: { marginLeft: theme.spacing.unit
              , color: '#fff', backgroundColor: green[500] }
});
export default withStyles(styles)(FaqList);
