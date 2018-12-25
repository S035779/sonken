import React            from 'react';
import PropTypes        from 'prop-types';
import * as R           from 'ramda';
import TradeAction      from 'Actions/TradeAction';
import std              from 'Utilities/stdutils';
import Spinner          from 'Utilities/Spinner';

import { withStyles }   from '@material-ui/core/styles';
import { Button, Checkbox, Typography, TextField }
                        from '@material-ui/core';
import TradeItemList    from 'Components/TradeItemList/TradeItemList';
import RssDialog        from 'Components/RssDialog/RssDialog';

class TradeFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: props.items
    , checked: false
    , endTrading: true
    , allTrading: true
    , inBidding: false
    , bidStartTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
    , bidStopTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
    , isRequest: false
    , page: 1
    , prevPage: 1
    , prevAllTrading: true
    , isSuccess:  false
    , isNotValid: false
    , isNotResult: false
    };
  }

  componentDidMount() {
    this.spn = Spinner.of('app');
    TradeAction.select(this.props.user, []);
  }

  componentWillUnmount() {
    this.spn.stop();
  }

  componentWillReceiveProps(nextProps) {
    const itemFilter = nextProps.itemFilter;
    const nextItems = nextProps.items;
    const nextPage = this.state.page;
    const prevAllTrading = this.state.prevAllTrading;
    const prevItems = this.state.items;
    const prevPage = this.state.prevPage;
    if(prevItems && nextItems.length !== 0) {
      if(prevItems.length === 0) {
        std.logInfo(TradeFilter.displayName, 'Init', nextProps);
        this.formsRef.scrollTop = 0;
        this.setState({ items: nextItems, page: 1, prevPage: 1, itemFilter });
      } else if(prevPage !== nextPage) {
        std.logInfo(TradeFilter.displayName, 'Update', nextProps);
        const catItems = R.concat(prevItems);
        this.setState({ items: catItems(nextItems), prevPage: nextPage, itemFilter })
      } else if(!itemFilter.allTrading) {
        std.logInfo(TradeFilter.displayName, 'Filter', nextProps);
        this.formsRef.scrollTop = 0;
        this.setState({ items: nextItems, page: 1, prevPage: 1, itemFilter, prevAllTrading: false });
      } else if(itemFilter.allTrading !== prevAllTrading) {
        std.logInfo(TradeFilter.displayName, 'Normal', nextProps);
        this.formsRef.scrollTop = 0;
        this.setState({ items: nextItems, page: 1, prevPage: 1, itemFilter, prevAllTrading: true });
      } else {
        std.logInfo(TradeFilter.displayName, 'All', nextProps);
        this.setState({ items: nextItems });
      }
    } else if(prevItems && prevItems.length !== 0){
      if(prevPage === nextPage) {
        std.logInfo(TradeFilter.displayName, 'Prev', { prevPage, nextPage, prevItems, nextItems });
        this.setState({ items: [], page: 1, prevPage: 1 });
      } else {
        std.logInfo(TradeFilter.displayName, 'Next', { prevPage, nextPage, prevItems, nextItems });
      }
    }
  }

  handlePagination() {
    const { isRequest, page } = this.state;
    const scrollTop     = this.formsRef.scrollTop;
    const scrollHeight  = this.formsRef.scrollHeight;
    const clientHeight  = this.formsRef.clientHeight;
    const scrolledToBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
    if(scrolledToBottom && !isRequest) {
      this.fetch(page + 1)
        .then(num => this.setState({ isRequest: false, page: num }))
        .then(() => this.spn.stop())
        .catch(err => {
          std.logError(TradeFilter.displayName, err.name, err.message);
          this.spn.stop();
        });
    }
  }

  handleChangeCheckbox(name, event) {
    std.logInfo(TradeFilter.displayName, 'handleChangeCheckbox', name);
    const checked = event.target.checked;
    switch(name) {
      case 'inBidding':
        this.setState({
          inBidding: checked
        , allTrading: !checked
        , endTrading: !checked
        });
        break;
      case 'allTrading':
        this.setState({
          inBidding: false
        , allTrading: checked
        , endTrading: true
        });
        break;
      case 'endTrading':
        this.setState({
          inBidding: !checked
        , allTrading: false
        , endTrading: checked
        });
        break;
      case 'checked':
        {
          this.setState({ checked: checked });
          const { user } = this.props;
          const { items } = this.state;
          const ids = checked ? items.map(item => item.guid__) : [];
          TradeAction.select(user, ids);
          break;
        }
    }
  }

  handleBided() {
    const { user, selectedItemId } = this.props;
    std.logInfo(TradeFilter.displayName, 'handleBided', selectedItemId);
    TradeAction.createBids(user, selectedItemId);
  }

  handleDelete() {
    const { user, selectedItemId  } = this.props;
    std.logInfo(TradeFilter.displayName, 'handleDelete', selectedItemId);
    if(window.confirm('Are you sure?')) {
      TradeAction.deleteBids(user, selectedItemId);
      this.setState({ checked: false });
    }
  }

  handleFilter() {
    const { user } = this.props;
    const { endTrading, allTrading, inBidding, bidStartTime, bidStopTime, isRequest } = this.state;
    if(isRequest) return;
    this.fetch(1)
      .then(num => this.setState({ isRequest: false, page: num }))
      .then(() => TradeAction.filter(user, { endTrading, allTrading, inBidding, bidStartTime, bidStopTime }))
      .then(() => this.spn.stop())
      .then(() => this.props.itemNumber === 0 ? this.setState({ isNotResult: true }) : null)
      .catch(err => {
        std.logError(TradeFilter.displayName, err.name, err.message);
        this.spn.stop();
      });
  }

  handleChangeText(name, event) {
    switch(name) {
      case 'bidStartTime':
        this.setState({ bidStartTime: event.target.value });
        break;
      case 'bidStopTime':
        this.setState({ bidStopTime: event.target.value });
        break;
    }
  }

  fetch(page) {
    const { user } = this.props;
    const { endTrading, allTrading, inBidding, bidStartTime, bidStopTime } = this.state;
    const limit = 20;
    const skip = (page - 1) * limit;
    this.spn.start();
    this.setState({ isRequest: true });
    return TradeAction.fetchTraded(user, skip, limit, { endTrading, allTrading, inBidding, bidStartTime
    , bidStopTime })
      .then(() => page);
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  render() {
    //std.logInfo(TradeFilter.displayName, 'State', this.state);
    //std.logInfo(TradeFilter.displayName, 'Props', this.state);
    const { classes, user, selectedItemId } = this.props;
    const { isSuccess, isNotValid, isNotResult, checked, bidStartTime, bidStopTime, endTrading, allTrading, inBidding, items, page } 
      = this.state;
    return <div className={classes.forms}>
        <div className={classes.edit}>
          <div className={classes.space}/>
          <Typography variant="subtitle1" noWrap className={classes.title}>絞込件数：</Typography>
          <Checkbox color="primary" className={classes.checkbox} checked={endTrading}
            onChange={this.handleChangeCheckbox.bind(this, 'endTrading')} tabIndex={-1} disableRipple />
          <Typography variant="subtitle1" noWrap className={classes.title}>取引完了済み</Typography>
          <Checkbox color="primary" className={classes.checkbox} checked={allTrading}
            onChange={this.handleChangeCheckbox.bind(this, 'allTrading')} tabIndex={-1} disableRipple />
          <Typography variant="subtitle1" noWrap className={classes.title}>取引未完了</Typography>
          <div className={classes.datetimes}>
            <Checkbox color="primary" tabIndex={-1} disableRipple checked={inBidding}
              onChange={this.handleChangeCheckbox.bind(this, 'inBidding')} className={classes.checkbox}/>
            <Typography variant="subtitle1" noWrap className={classes.title}>入札終了時期：</Typography>
            <form className={classes.inputText} noValidate>
              <TextField id="start-time" label="始め" type="datetime-local" InputLabelProps={{shrink: true}}
                value={bidStartTime} onChange={this.handleChangeText.bind(this, 'bidStartTime')}
                className={classes.text}/>
              <TextField id="end-time" label="終わり" type="datetime-local" InputLabelProps={{shrink: true}}
                value={bidStopTime} onChange={this.handleChangeText.bind(this, 'bidStopTime')}
                className={classes.text}/>
            </form>
          </div>
        </div>
        <div className={classes.edit}>
          <div className={classes.space}/>
          <div className={classes.buttons}>
            <div className={classes.buttons}>
              <Button variant="contained" onClick={this.handleFilter.bind(this)} className={classes.button}>絞り込み</Button>
              <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
                要求を受け付けました。
              </RssDialog>
              <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
                内容に不備があります。もう一度確認してください。
              </RssDialog>
              <RssDialog open={isNotResult} title={'検索結果なし'} onClose={this.handleCloseDialog.bind(this, 'isNotResult')}>
                検索条件を見直してください。
              </RssDialog>
            </div>
          </div>
        </div>
        <div className={classes.edit}>
          <div className={classes.buttons}>
            <Checkbox checked={checked} onChange={this.handleChangeCheckbox.bind(this, 'checked')}
              tabIndex={-1} disableRipple className={classes.checkbox}/>
            <div className={classes.buttons}>
              <Button variant="contained" onClick={this.handleDelete.bind(this)} className={classes.button}>削除</Button>
            </div>
          </div>
        </div>
        <div ref={node => this.formsRef = node} onScroll={this.handlePagination.bind(this)} className={classes.noteList}>
          <TradeItemList user={user} items={items} selectedItemId={selectedItemId} page={page} />
        </div>
      </div>;
  }
}
TradeFilter.displayName = 'TradeFilter';
TradeFilter.defaultProps = { note: null };
TradeFilter.propTypes = {
  classes: PropTypes.object.isRequired
, selectedItemId: PropTypes.array.isRequired
, itemFilter: PropTypes.object
, itemNumber: PropTypes.number.isRequired
, user: PropTypes.string.isRequired
, items: PropTypes.array.isRequired
};

const barHeightSmUp = 64;
const barHeightSmDown = 56;
const filterHeight = 186;
const searchHeight = 62;
const listHeightSmDown = `calc(100vh - ${barHeightSmDown}px - ${filterHeight}px - ${searchHeight}px)`;
const listHeightSmUp = `calc(100vh - ${barHeightSmUp}px - ${filterHeight}px - ${searchHeight}px)`;
const columnHeight = 62;
const checkboxWidth = 38;
const datetimeWidth = 200;
const styles = theme => ({
  space:      { minWidth: checkboxWidth }
, datetimes:  { display: 'flex', flexDirection: 'row', marginLeft: theme.spacing.unit * 0.5 }
, title:      { margin: theme.spacing.unit * 1.75 }
, edit:       { display: 'flex', flexDirection: 'row', alignItems: 'stretch'
              , height: columnHeight, minHeight: columnHeight, boxSizing: 'border-box', padding: '5px' }
, checkbox:   { flex: 0, minWidth: checkboxWidth }
, buttons:    { flex: 0, display: 'flex', flexDirection: 'row' }
, button:     { flex: 1, margin: theme.spacing.unit, wordBreak: 'keep-all' }
, inputText:  {}
, text:       { width: datetimeWidth, marginRight: theme.spacing.unit }
, noteList:   { width: '100%', overflow: 'scroll', height: listHeightSmDown
              , [theme.breakpoints.up('sm')]: { height: listHeightSmUp } }
});
export default withStyles(styles)(TradeFilter);
