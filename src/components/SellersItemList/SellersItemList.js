import React          from 'react';
import PropTypes      from 'prop-types';
import { Link }       from 'react-router-dom';
import NoteAction     from 'Actions/NoteAction';
import std            from 'Utilities/stdutils';

import { withStyles } from 'material-ui/styles';
import {
  List, Paper, Checkbox, Button, Typography
}                     from 'material-ui';
import {
  ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction
}                     from 'material-ui/List';
import { Star, StarBorder } from 'material-ui-icons';

class SellersItemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      traded:  []
    , starred: []
    };
  }

  componentWillReceiveProps(nextProps) {
    this.logInfo('componentWillReciveProps', nextProps);
    const { items } = nextProps;
    let traded = [];
    let starred = [];
    items.forEach(item => {
      if(item.traded) traded.push(item.guid._);
      if(item.starred) starred.push(item.guid._);
    });
    this.setState({ traded, starred });
  }

  handleChangeTraded(id, event) {
    this.logInfo('handleChangeTraded', id);
    const { traded } = this.state;
    const currentIndex = traded.indexOf(id);
    const newTraded = [...traded];
    if (currentIndex === -1) {
      newTraded.push(id);
      NoteAction.createTrade([id]);
    } else {
      newTraded.splice(currentIndex, 1);
      NoteAction.deleteTrade([id]);
    }
    this.setState({ traded: newTraded });
  }

  handleChangeStarred(id, event) {
    this.logInfo('handleChangeStarred', id);
    const { starred } = this.state;
    const currentIndex = starred.indexOf(id);
    const newStarred = [...starred];
    if (currentIndex === -1) {
      newStarred.push(id);
      NoteAction.createStar([id]);
    } else {
      newStarred.splice(currentIndex, 1);
      NoteAction.deleteStar([id]);
    }
    this.setState({ starred: newStarred });
  }

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
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
    const { traded, starred } = this.state;
    const textClass = {
      primary: classes.primary
    , secondary: classes.secondary
    };
    const buttonText = traded.indexOf(item.guid._) !== -1
      ? '取引チェック 登録済み' : '取引チェック 登録';
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
                src={     item.description.DIV.A.IMG.$.SRC      }
                border={  item.description.DIV.A.IMG.$.BORDER   }
                width={   item.description.DIV.A.IMG.$.WIDTH    }
                height={  item.description.DIV.A.IMG.$.HEIGHT   }
                alt={     item.description.DIV.A.IMG.$.ALT      }
              />
              </a>
            </div>
            <ListItemText classes={textClass}
              className={classes.listItemText}
              primary={title}
              secondary={description}/>
            <ListItemSecondaryAction>
              <Button variant="raised" color="primary"
                className={classes.button}
                onClick={this.handleChangeTraded.bind(this, item.guid._)}>
                {buttonText}</Button>
            </ListItemSecondaryAction>
        </ListItem>
      </Paper>
    </div>;
  }

  render() {
    const { classes, items } = this.props;
    const renderItems =
      items.map((item, index) => this.renderItem(index, item));
    return <List className={classes.noteList}>
      {renderItems}
    </List>;
  }
};
const barHeightSmDown   = 104;
const barHeightSmUp     = 112;
const searchHeight      = 62;
const filterHeight      = 62 * 9;
const itemHeight        = 142;
const descMinWidth      = 133;
const listHeightSmDown  =
  `calc(100vh - ${barHeightSmDown}px - ${filterHeight}px - ${searchHeight}px)`;
const listHeightSmUp    =
  `calc(100vh - ${barHeightSmUp}px - ${filterHeight}px - ${searchHeight}px)`;
const noticeWidth       = 72;
const styles = theme => ({
  noteList:     { width: '100%'
                , height: listHeightSmDown
                , [theme.breakpoints.up('sm')]: {
                  height: listHeightSmUp }}
  , noteItem:   { display: 'flex', flexDirection: 'row'
                , alignItems: 'center' }
  , listItem:   { height: itemHeight, padding: theme.spacing.unit /2
                , '&:hover':  {
                  backgroundColor: theme.palette.primary.main
                  , '& $star': { color: theme.palette.common.white }}}
  , listItemText: { marginRight: descMinWidth }
  , star:       { marginLeft: theme.spacing.unit }
  , button:     { width: 128, wordBreak: 'keep-all' }
  , paper:      { width: '100%', margin: theme.spacing.unit /8
                , '&:hover':  {
                  backgroundColor: theme.palette.primary.main
                  , '& $primary, $secondary': {
                    color: theme.palette.common.white }}}   
  , primary:    {}
  , secondary:  {}
  , description: { minWidth: descMinWidth, width: descMinWidth
                , fontSize: 12 }
});
SellersItemList.displayName = 'SellersItemList';
SellersItemList.defaultProps = { items: null }
SellersItemList.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(SellersItemList);
