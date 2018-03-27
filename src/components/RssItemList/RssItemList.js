import React                from 'react';
import PropTypes            from 'prop-types';
import { Link }             from 'react-router-dom';
import NoteAction           from 'Actions/NoteAction';
import std                  from 'Utilities/stdutils';

import { withStyles }       from 'material-ui/styles';
import {
  List, Paper, Checkbox, Button, Typography
}                           from 'material-ui';
import {
  ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction
}                           from 'material-ui/List';
import { Star, StarBorder } from 'material-ui-icons';
import RssButton            from 'Components/RssButton/RssButton';

class RssItemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listed:  []
    , starred: []
    };
  }

  componentWillReceiveProps(nextProps) {
    std.logInfo(RssItemList.displayName, 'Props', nextProps);
    const { items } = nextProps;
    let listed = [];
    let starred = [];
    items.forEach(item => {
      if(item.listed) listed.push(item.guid._);
      if(item.starred) starred.push(item.guid._);
    });
    this.setState({ listed, starred });
  }

  handleChangeListed(id, event) {
    std.logInfo(RssItemList.displayName, 'handleChangeListed', id);
    const { listed } = this.state;
    const { user } = this.props;
    const currentIndex = listed.indexOf(id);
    const newListed = [...listed];
    if (currentIndex === -1) {
      newListed.push(id);
      NoteAction.createList(user, [id]);
    } else {
      newListed.splice(currentIndex, 1);
      NoteAction.deleteList(user, [id]);
    }
    this.setState({ listed: newListed });
  }

  handleChangeStarred(id, event) {
    std.logInfo(RssItemList.displayName, 'handleChangeStarred', id);
    const { starred } = this.state;
    const { user } = this.props;
    const currentIndex = starred.indexOf(id);
    const newStarred = [...starred];
    if (currentIndex === -1) {
      newStarred.push(id);
      NoteAction.createStar(user, [id]);
    } else {
      newStarred.splice(currentIndex, 1);
      NoteAction.deleteStar(user, [id]);
    }
    this.setState({ starred: newStarred });
  }

  renderStar() {
    const { classes } = this.props;
    return <Star className={classes.star}/>;
  }

  renderUnStar() {
    const { classes } = this.props;
    return <StarBorder className={classes.star}/>;
  }

  renderItem(index, item) {
    const { classes } = this.props;
    const { listed, starred } = this.state;
    const textClass = {
      primary: classes.primary
    , secondary: classes.secondary
    };
    const buttonColor = listed.indexOf(item.guid._) !== -1
      ? 'green' : 'yellow';
    const buttonText = listed.indexOf(item.guid._) !== -1
      ? '入札リスト 登録済み' : '入札リスト 登録';
    const title = `出品件名：${item.title}`;
    const description = 
        `配信時間：${
          std.formatDate(new Date(item.pubDate), 'YYYY/MM/DD hh:mm') }、`
      + `現在価格：${item.price}円、`
      + `入札数：${item.bids}、`
      + `入札終了時間：${item.bidStopTime}、`
      + `AuctionID：${item.guid._}`
    ;
    const notice = '';
    const renderStar = starred.indexOf(item.guid._) !== -1
      ? this.renderStar() : this.renderUnStar();
    return <div key={index} className={classes.noteItem}>
      <Paper className={classes.paper}>
        <ListItem dense button disableGutters
          onClick={this.handleChangeStarred.bind(this, item.guid._)}
          className={classes.listItem}>
          <ListItemIcon>{renderStar}</ListItemIcon>
            <div className={classes.description}>
              <a href={item.description.DIV.A.$.HREF}>
              <img
                src={item.description.DIV.A.IMG.$.SRC}
                border={item.description.DIV.A.IMG.$.BORDER}
                width={item.description.DIV.A.IMG.$.WIDTH * 1.5}
                height={item.description.DIV.A.IMG.$.HEIGHT * 1.5}
                alt={item.description.DIV.A.IMG.$.ALT}
              />
              </a>
            </div>
            <ListItemText classes={textClass}
              className={classes.listItemText}
              primary={title}
              secondary={description}/>
            <ListItemSecondaryAction>
              <RssButton color={buttonColor}
                onClick={this.handleChangeListed.bind(this, item.guid._)}
                classes={classes.button}>{buttonText}</RssButton>
            </ListItemSecondaryAction>
        </ListItem>
      </Paper>
    </div>;
  }

  render() {
    const { classes, items } = this.props;
    const renderItems =
      items.map((item, index) => this.renderItem(index, item));
    return <List>{renderItems}</List>;
  }
};
const itemHeight        = 142 * 1.5;
const descMinWidth      = 133 * 1.5;
const noticeWidth       = 72;
const styles = theme => ({
noteItem:       { display: 'flex', flexDirection: 'row'
                , alignItems: 'center' }
, listItem:     { height: itemHeight, padding: theme.spacing.unit /2
                , '&:hover':  {
                  backgroundColor: theme.palette.primary.main
                  , '& $star': { color: theme.palette.common.white }}}
, listItemText: { marginRight: descMinWidth }
, star:         { marginLeft: theme.spacing.unit }
, button:       { width: 128, wordBreak: 'keep-all' }
, paper:        { width: '100%', margin: theme.spacing.unit /8
                , '&:hover':  {
                  backgroundColor: theme.palette.primary.main
                  , '& $primary, $secondary': {
                    color: theme.palette.common.white }}}   
, primary:      {}
, secondary:    {}
, description:  { minWidth: descMinWidth, width: descMinWidth
                , fontSize: 12 }
});
RssItemList.displayName = 'RssItemList';
RssItemList.defaultProps = { items: null }
RssItemList.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssItemList);
