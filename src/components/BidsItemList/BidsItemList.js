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
    this.logInfo('componentWillReciveProps', nextProps);
    const { selectedItemId, items } = nextProps;
    let bided = [];
    items.forEach(item => {
      if(item.bided) bided.push(item.guid._);
    });
    this.setState({ selectedItemId, bided });
  }

  handleChangeBided(id, event) {
    this.logInfo('handleChangeBided', id);
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
    this.logInfo('handleChangeCheckbox', id);
    const { selectedItemId } = this.state;
    const { user } = this.props;
    const currentIndex = selectedItemId.indexOf(id);
    const newChecked = [...selectedItemId];
    if (currentIndex === -1)  newChecked.push(id);
    else newChecked.splice(currentIndex, 1);
    BidsAction.select(user, newChecked);
  }

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
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
    const description = `配信時間：${
      std.formatDate(new Date(item.pubDate), 'YYYY/MM/DD hh:mm') }、`
      + `現在価格：${item.price}円、`
      + `入札数：${item.bids}、`
      + `入札終了時間：${item.bidStopTime}、`
      + `AuctionID：${item.guid._}`;
    return <div key={index} className={classes.noteItem}>
      <Checkbox className={classes.checkbox}
        onClick={this.handleChangeCheckbox.bind(this, item.guid._)}
        checked={selectedItemId.indexOf(item.guid._) !== -1}
        tabIndex={-1} disableRipple />
      <Paper className={classes.paper}>
        <ListItem dense button disableGutters
          className={classes.listItem}>
          <div className={classes.description}>
            <a href={item.description.DIV.A.$.HREF}>
            <img src={item.description.DIV.A.IMG.$.SRC}
              border={item.description.DIV.A.IMG.$.BORDER}
              width={ item.description.DIV.A.IMG.$.WIDTH}
              height={item.description.DIV.A.IMG.$.HEIGHT}
              alt={   item.description.DIV.A.IMG.$.ALT}/>
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
    const _items = 
      items.map((item, index) => this.renderItem(index, item));
    return <List>{_items}</List>;
  }
};

const itemHeight        = 160;
const descMinWidth      = 133;
const styles = theme => ({
  noteItem:     { display: 'flex', flexDirection: 'row'
                , alignItems: 'center' }
, listItem:     { height: itemHeight, padding: theme.spacing.unit /2
                , '&:hover':  {
                  backgroundColor: theme.palette.primary.main
                  , '& $checkbox': { color: theme.palette.common.white }}}
, listItemText: { marginRight: descMinWidth }
, checkbox:     {}
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
, space:        { minWidth: theme.spacing.unit * 6 }
});
BidsItemList.displayName = 'BidsItemList';
BidsItemList.defaultProps = { items: null }
BidsItemList.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(BidsItemList);
