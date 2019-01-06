import loadable                   from '@loadable/component';
import React          from 'react';
import PropTypes      from 'prop-types';
import BidsAction     from 'Actions/BidsAction';
import std            from 'Utilities/stdutils';

import { withStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemText, ListItemSecondaryAction, Paper, Checkbox }
                      from '@material-ui/core';
const RssButton = loadable(() => import('Components/RssButton/RssButton'));

class BidsItemList extends React.Component {
  constructor(props) {
    super(props);
    let bided = [];
    props.items.forEach(item => {
      if(item.bided) bided.push(item.guid__);
    });
    this.state = {
      bided
    , selectedItemId: props.selectedItemId
    };
  }

  componentWillReceiveProps(nextProps) {
    const selectedItemId = nextProps.selectedItemId;
    const nextItems = nextProps.items;
    const nextPage = nextProps.page;
    const prevItems = this.props.items;
    const prevPage = this.props.page;
    if((nextItems.length !== 0 && prevItems.length === 0) || (prevPage !== nextPage)) {
      //std.logInfo(BidsItemList.displayName, 'Props', { nextItems, nextPage, prevItems, prevPage });
      let bided = [];
      nextItems.forEach(item => {
        if(item && item.bided) bided.push(item.guid__);
      });
      this.setState({ selectedItemId, bided });
    } else {
      this.setState({ selectedItemId });
    }
  }

  handleChangeBided(id) {
    std.logInfo(BidsItemList.displayName, 'handleChangeBided', id);
    const { bided } = this.state;
    const { user } = this.props;
    const currentIndex = bided.indexOf(id);
    const newBided = [...bided];
    if (currentIndex === -1) {
      newBided.push(id);
      BidsAction.create(user, [id]);
    } else {
      newBided.splice(currentIndex, 1);
      BidsAction.delete(user, [id]);
    }
    this.setState({ bided: newBided });
  }

  handleChangeCheckbox(id) {
    std.logInfo(BidsItemList.displayName, 'handleChangeCheckbox', id);
    const { selectedItemId } = this.state;
    const { user } = this.props;
    const currentIndex = selectedItemId.indexOf(id);
    const newChecked = [...selectedItemId];
    if (currentIndex === -1) {
      newChecked.push(id);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    BidsAction.select(user, newChecked);
  }

  renderItem(index, item) {
    //std.logInfo(RssItemList.displayName, 'Item', { index, item });
    const { classes } = this.props;
    const { bided, selectedItemId } = this.state;
    const textClass = { primary: classes.primary, secondary: classes.secondary };
    const buttonColor = bided.indexOf(item.guid__) !== -1 ? 'green' : 'yellow';
    const buttonText = bided.indexOf(item.guid__) !== -1 ? '取引チェック 登録済み' : '取引チェック 登録';
    const title = `出品件名：${item.title}`;
    const description = `配信時間：${ std.formatDate(new Date(item.pubDate), 'YYYY/MM/DD hh:mm') }、`
    + `現在価格：${item.price}円、`
    + `入札数：${item.bids}、`
    + `出品数：${item.attributes ? item.attributes.sale : '-'}、`
    + `入札終了時間：${ std.formatDate(new Date(item.bidStopTime), 'YYYY/MM/DD hh:mm') }、`
    + `AuctionID：${item.guid__}`;
    return item.description 
      ? ( <div key={index} className={classes.noteItem}>
          <Checkbox onClick={this.handleChangeCheckbox.bind(this, item.guid__)}
            checked={selectedItemId.indexOf(item.guid__) !== -1} tabIndex={-1} disableRipple />
          <Paper className={classes.paper}>
            <ListItem disableGutters className={classes.listItem}>
              <div className={classes.description}>
                <a href={item.description.DIV.A.attr.HREF} target="_blank" rel="noopener noreferrer">
                <img src={item.description.DIV.A.IMG.attr.SRC}
                  alt={item.description.DIV.A.IMG.attr.ALT}
                  className={classes.image}/>
                </a>
              </div>
              <ListItemText classes={textClass} primary={title} secondary={description}
                className={classes.listItemText}/>
              <ListItemSecondaryAction>
                <RssButton color={buttonColor} onClick={this.handleChangeBided.bind(this, item.guid__)}
                  classes={classes.button}>{buttonText}</RssButton>
              </ListItemSecondaryAction>
            </ListItem>
          </Paper>
          <div className={classes.space} />
        </div> )
      : null;
  }

  render() {
    //std.logInfo(BidsItemList.displayName, 'State', this.state);
    const { items } = this.props;
    const renderItems = items.map((item, index) => this.renderItem(index, item));
    return <List>{renderItems}</List>;
  }
}
BidsItemList.displayName = 'BidsItemList';
BidsItemList.defaultProps = { items: null }
BidsItemList.propTypes = {
  classes: PropTypes.object.isRequired
, selectedItemId: PropTypes.array.isRequired
, items: PropTypes.array.isRequired
, user: PropTypes.string.isRequired
, page: PropTypes.number.isRequired
};
const itemHeight    = 208;
const itemMinWidth  = 800;
const descMinWidth  = 200;
const styles = theme => ({
  noteItem:     { display: 'flex', flexDirection: 'row', alignItems: 'center' }
, listItem:     { height: itemHeight, minWidth: itemMinWidth, padding: theme.spacing.unit /2
                , '&:hover':  { backgroundColor: theme.palette.primary.main } }
, listItemText: { marginRight: descMinWidth }
, button:       { width: 128, wordBreak: 'keep-all' }
, paper:        { width: '100%', margin: theme.spacing.unit /8
                , '&:hover':  { backgroundColor: theme.palette.primary.main
                  , '& $primary, $secondary': { color: theme.palette.common.white }}}   
, primary:      { }
, secondary:    { }
, description:  { minWidth: descMinWidth, width: descMinWidth, height: descMinWidth, fontSize: 12 }
, image:        { width: '100%', height: '100%' }
, space:        { minWidth: theme.spacing.unit * 6 }
});
export default withStyles(styles)(BidsItemList);
