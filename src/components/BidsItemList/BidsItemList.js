import React          from 'react';
import PropTypes      from 'prop-types';
import { Link }       from 'react-router-dom';
import BidsAction     from 'Actions/BidsAction';
import std            from 'Utilities/stdutils';

import { withStyles } from 'material-ui/styles';
import { List, Paper, Checkbox, Button, Typography }
                      from 'material-ui';
import { ListItem, ListItemText, ListItemSecondaryAction }
                      from 'material-ui/List';
import RssButton      from 'Components/RssButton/RssButton';

class BidsItemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bided:         []
    , selectedItemId: props.selectedItemId
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(BidsItemList.displayName, 'Props', nextProps);
    const { selectedItemId, items } = nextProps;
    let bided = [];
    items.forEach(item => {
      if(item.bided) bided.push(item.guid._);
    });
    this.setState({ selectedItemId, bided });
  }

  handleChangeBided(id, event) {
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

  handleChangeCheckbox(id, event) {
    std.logInfo(BidsItemList.displayName, 'handleChangeCheckbox', id);
    const { selectedItemId } = this.state;
    const { user } = this.props;
    const currentIndex = selectedItemId.indexOf(id);
    const newChecked = [...selectedItemId];
    if (currentIndex === -1)  newChecked.push(id);
    else newChecked.splice(currentIndex, 1);
    BidsAction.select(user, newChecked);
  }

  renderItem(index, item) {
    const { classes } = this.props;
    const { bided, selectedItemId } = this.state;
    const textClass = {
      primary: classes.primary
    , secondary: classes.secondary
    };
    const buttonColor = bided.indexOf(item.guid._) !== -1
      ? 'green' : 'yellow';
    const buttonText = bided.indexOf(item.guid._) !== -1
      ? '取引チェック 登録済み' : '取引チェック 登録';
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
    + `AuctionID：${item.guid._}`
    ;
    return <div key={index} className={classes.noteItem}>
      <Checkbox
        onClick={this.handleChangeCheckbox.bind(this, item.guid._)}
        checked={selectedItemId.indexOf(item.guid._) !== -1}
        tabIndex={-1} disableRipple />
      <Paper className={classes.paper}>
        <ListItem dense disableGutters
          className={classes.listItem}>
          <div className={classes.description}>
            <a href={item.description.DIV.A.attr.HREF}>
            <img src={item.description.DIV.A.IMG.attr.SRC}
              border={item.description.DIV.A.IMG.attr.BORDER}
              width={item.description.DIV.A.IMG.attr.WIDTH}
              height={item.description.DIV.A.IMG.attr.HEIGHT}
              alt={item.description.DIV.A.IMG.attr.ALT}
              className={classes.image}/>
            </a>
          </div>
          <ListItemText classes={textClass}
            primary={title} secondary={description}
            className={classes.listItemText}/>
          <ListItemSecondaryAction>
            <RssButton color={buttonColor}
              onClick={this.handleChangeBided.bind(this, item.guid._)}
              classes={classes.button}>{buttonText}</RssButton>
          </ListItemSecondaryAction>
        </ListItem>
      </Paper>
      <div className={classes.space} />
    </div>;
  }

  render() {
    const { classes, items } = this.props;
    const compareId = ((a, b) => {
      if(a._id < b._id) return -1;
      if(a._id > b._id) return 1;
      return 0;
    });
    const _items = items
      .sort(compareId)
      .map((item, index) => this.renderItem(index, item));
    return <List>{_items}</List>;
  }
};

const itemHeight        = 142 * 1.5;
const itemMinWidth      = 720;
const descMinWidth      = 133 * 1.5;
const styles = theme => ({
  noteItem:     { display: 'flex', flexDirection: 'row'
                , alignItems: 'center' }
, listItem:     {
    height: itemHeight
  , minWidth: itemMinWidth
  , padding: theme.spacing.unit /2
  , '&:hover':  {
      backgroundColor: theme.palette.primary.main
    }
  }
, listItemText: { marginRight: descMinWidth }
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
, image:        { width: '100%', height: '100%' }
, space:        { minWidth: theme.spacing.unit * 6 }
});
BidsItemList.displayName = 'BidsItemList';
BidsItemList.defaultProps = { items: null }
BidsItemList.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(BidsItemList);
