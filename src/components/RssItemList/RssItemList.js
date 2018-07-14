import React                from 'react';
import PropTypes            from 'prop-types';
import { Link }             from 'react-router-dom';
import NoteAction           from 'Actions/NoteAction';
import std                  from 'Utilities/stdutils';

import { withStyles }       from '@material-ui/core/styles';
import { List, Paper, Checkbox, Button, Typography, IconButton, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { Star, StarBorder, Delete, FiberNew } from '@material-ui/icons';
import RssButton            from 'Components/RssButton/RssButton';

class RssItemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listed:   []
    , starred:  []
    , added:    []
    , deleted:  []
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(RssItemList.displayName, 'Props', nextProps);
    const { items } = nextProps;
    let listed = [];
    let starred = [];
    let deleted = [];
    let added = [];
    items.forEach(item => {
      if(item.listed) listed.push(item.guid._);
      if(item.starred) starred.push(item.guid._);
      if(item.deleted) deleted.push(item.guid._);
      if(item.added)   added.push(item.guid._);
    });
    this.setState({ listed, starred, deleted, added });
  }

  handleChangeListed(id, event) {
    //std.logInfo(RssItemList.displayName, 'handleChangeListed', id);
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
    //std.logInfo(RssItemList.displayName, 'handleChangeStarred', id);
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

  handleChangeDeleted(id, event) {
    //std.logInfo(RssItemList.displayName, 'handleChangeDeleted', id);
    const { deleted } = this.state;
    const { user } = this.props;
    const currentIndex = deleted.indexOf(id);
    const newDeleted = [...deleted];
    if (currentIndex === -1) {
      newDeleted.push(id);
      NoteAction.createDelete(user, [id]);
    } else {
      newDeleted.splice(currentIndex, 1);
      NoteAction.deleteDelete(user, [id]);
    }
    this.setState({ deleted: newDeleted });
  }

  handleChangeAdded(id, event) {
    //std.logInfo(RssItemList.displayName, 'handleChangeAdded', id);
    const { added } = this.state;
    const { user } = this.props;
    const currentIndex = added.indexOf(id);
    const newAdded = [...added];
    if (currentIndex === -1) {
      newAdded.push(id);
      NoteAction.createAdd(user, [id]);
    } else {
      newAdded.splice(currentIndex, 1);
      NoteAction.deleteAdd(user, [id]);
    }
    this.setState({ added: newAdded });
  }

  handleMouseLeaveAdded(id, event) {
    //std.logInfo(RssItemList.displayName, 'handleMouseLeaveAdded', id);
    const { added } = this.state;
    const { user } = this.props;
    const currentIndex = added.indexOf(id);
    const newAdded = [...added];
    if (currentIndex === -1) {
      newAdded.splice(currentIndex, 1);
      NoteAction.createAdd(user, [id]);
    }
    this.setState({ added: newAdded });
  }

  renderStar() {
    const { classes } = this.props;
    return <Star className={classes.star} />;
  }

  renderUnStar() {
    const { classes } = this.props;
    return <StarBorder className={classes.star} />;
  }

  renderFiberNew() {
    return <FiberNew color="error"/>
  }

  renderItem(index, item) {
    const { classes } = this.props;
    const { listed, starred, added, deleted } = this.state;
    const textClass =
      { primary: classes.primary, secondary: classes.secondary };
    const buttonColor = listed.indexOf(item.guid._) !== -1
      ? 'green' : 'yellow';
    const buttonText = listed.indexOf(item.guid._) !== -1
      ? '入札リスト 登録済み' : '入札リスト 登録';
    const title = `出品件名：${item.title}`;
    const description = 
      `配信時間：${
        std.formatDate(new Date(item.pubDate),      'YYYY/MM/DD hh:mm')
      }、`
    + `現在価格：${item.price}円、`
    + `入札数：${item.bids}、`
    + `入札終了時間：${
        std.formatDate(new Date(item.bidStopTime),  'YYYY/MM/DD hh:mm')
      }、`
    + `AuctionID：${item.guid._}、`
    + `Seller：${item.seller}`
    ;
    const notice = '';
    const renderStar = starred.indexOf(item.guid._) !== -1
      ? this.renderStar() : this.renderUnStar();
    const renderFiberNew = added.indexOf(item.guid._) !== -1
      ? null : this.renderFiberNew();
    if(deleted.indexOf(item.guid._) !== -1) return;
    return <div key={index} className={classes.noteItem}>
      <Paper className={classes.paper}>
        <ListItem disableGutters
          onMouseLeave={
            this.handleMouseLeaveAdded.bind(this, item.guid._)}
          className={classes.listItem}>
            <IconButton
              onClick={this.handleChangeStarred.bind(this, item.guid._)}>
              {renderStar}
            </IconButton>
            <IconButton
              onClick={this.handleChangeAdded.bind(this, item.guid._)}>
              {renderFiberNew}
            </IconButton>
            <div className={classes.description}>
              <a href={item.description.DIV.A.attr.HREF}
                target="_blank">
              <img src={item.description.DIV.A.IMG.attr.SRC}
                border={item.description.DIV.A.IMG.attr.BORDER}
                width={item.description.DIV.A.IMG.attr.WIDTH}
                height={item.description.DIV.A.IMG.attr.HEIGHT}
                alt={item.description.DIV.A.IMG.attr.ALT}
                className={classes.image}
              />
              </a>
            </div>
            <ListItemText
              classes={textClass}
              className={classes.listItemText}
              primary={title}
              secondary={description}/>
            <ListItemSecondaryAction>
              <RssButton color={buttonColor}
                onClick={this.handleChangeListed.bind(this, item.guid._)}
                classes={classes.button}>{buttonText}</RssButton>
              <IconButton
                onClick={this.handleChangeDeleted.bind(this, item.guid._)}>
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
      </Paper>
    </div>;
  }

  render() {
    const { classes, items } = this.props;
    const compareFavorite = (a, b) => {
      if(a.starred === true  && b.starred === false) return -1;
      if(a.starred === false && b.starred === true ) return 1;
      return 0;
    };
    const compareId = (a, b) => {
      if(a._id < b._id) return -1;
      if(a._id > b._id) return 1;
      return 0;
    };
    const renderItems = items
      .sort(compareId)
      .sort(compareFavorite)
      .map((item, index) => this.renderItem(index, item));
    return <List>{renderItems}</List>;
  }
};
const itemHeight        = 142 * 1.5;
const itemMinWidth      = 800;
const descMinWidth      = 133 * 1.5;
const styles = theme => ({
noteItem:       { display: 'flex', flexDirection: 'row'
                , alignItems: 'center' }
, listItem:     {
    height: itemHeight
  , minWidth: itemMinWidth
  , padding: theme.spacing.unit /2
  , '&:hover':  {
      backgroundColor: theme.palette.primary.main
    , '& $star': {
        color: theme.palette.common.white
      }
    }
  }
, listItemText: { marginRight: descMinWidth }
, star:         { color: theme.palette.primary.main }
, button:       { width: 128, wordBreak: 'keep-all' }
, paper:        { width: '100%', margin: theme.spacing.unit /8
                , '&:hover':  {
                  backgroundColor: theme.palette.primary.main
                  , '& $primary, $secondary': {
                    color: theme.palette.common.white }}}   
, primary:      { }
, secondary:    { }
, description:  { minWidth: descMinWidth, width: descMinWidth
                , fontSize: 12 }
, image:        { height: '100%', width: '100%' }
});
RssItemList.displayName = 'RssItemList';
RssItemList.defaultProps = { items: null }
RssItemList.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssItemList);
