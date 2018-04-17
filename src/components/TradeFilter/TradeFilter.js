import React            from 'react';
import PropTypes        from 'prop-types';
import TradeAction      from 'Actions/TradeAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import {
  Input, Button, Checkbox, Typography, TextField
}                       from 'material-ui';
import { InputLabel }   from 'material-ui/Input';
import { FormControl }  from 'material-ui/Form';

class TradeFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItemId: props.selectedItemId
    , itemFilter:     props.itemFilter
    , checked:        false
    , endTrading:     true
    , allTrading:     true
    , inBidding:      false
    , bidStartTime:   std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
    , bidStopTime:    std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
    };
  }

  componentDidMount() {
    TradeAction.select(this.props.user, []);
  }

  componentWillReceiveProps(nextProps) {
    std.logInfo(TradeFilter.displayName, 'Props', nextProps);
    const { selectedItemId, itemFilter } = nextProps;
    this.setState({ selectedItemId, itemFilter });
  }

  handleChangeCheckbox(name, event) {
    std.logInfo(TradeFilter.displayName, 'handleChangeCheckbox', name);
    const checked = event.target.checked;
    switch(name) {
      case 'inBidding':
        this.setState({
          inBidding:  checked
        , allTrading: !checked
        , endTrading: !checked
        });
        break;
      case 'allTrading':
        this.setState({
          inBidding:  false
        , allTrading: checked
        , endTrading: true
        });
        break;
      case 'endTrading':
        this.setState({
          inBidding:  !checked
        , allTrading: false
        , endTrading: checked
        });
        break;
      case 'checked':
        this.setState({ checked: checked });
        const { user, items } = this.props;
        const ids = checked ? items.map(item => item.guid._) : [];
        TradeAction.select(user, ids);
        break;
    }
  }

  handleBided() {
    const { selectedItemId } = this.state;
    const { user } = this.props;
    std.logInfo(TradeFilter.displayName, 'handleBided', selectedItemId);
    TradeAction.createBids(user, selectedItemId);
  }

  handleDelete() {
    const { selectedItemId } = this.state;
    const { user } = this.props;
    std.logInfo(TradeFilter.displayName, 'handleDelete', selectedItemId);
    if(window.confirm('Are you sure?')) {
      TradeAction.deleteBids(user, selectedItemId);
      this.setState({ checked: false });
    }
  }

  handleFilter() {
    const { endTrading, allTrading, inBidding, bidStartTime, bidStopTime }
      = this.state;
    const { user } = this.props;
    std.logInfo(TradeFilter.displayName, 'handleFilter', {
      endTrading, allTrading, inBidding, bidStartTime, bidStopTime
    });
    TradeAction.filter(user, {
      endTrading, allTrading, inBidding, bidStartTime, bidStopTime
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

  render() {
    //std.logInfo(TradeFilter.displayName, 'State', this.state);
    const { classes } = this.props;
    const {
      checked
    , bidStartTime, bidStopTime
    , endTrading, allTrading, inBidding
    } = this.state;
    return <div className={classes.forms}>
      <div className={classes.edit}>
        <div className={classes.space}/>
        <Typography variant="subheading" noWrap
          className={classes.title}>絞込件数：</Typography>
        <Checkbox color="primary"
          className={classes.checkbox}
          checked={endTrading}
          onChange={this.handleChangeCheckbox.bind(this, 'endTrading')}
          tabIndex={-1} disableRipple />
        <Typography variant="subheading" noWrap
          className={classes.title}>取引完了済み</Typography>
        <Checkbox color="primary"
          className={classes.checkbox}
          checked={allTrading}
          onChange={this.handleChangeCheckbox.bind(this, 'allTrading')}
          tabIndex={-1} disableRipple />
        <Typography variant="subheading" noWrap
          className={classes.title}>取引未完了</Typography>
        <div className={classes.datetimes}>
          <Checkbox color="primary"
            checked={inBidding}
            onChange={this.handleChangeCheckbox.bind(this, 'inBidding')}
            tabIndex={-1} disableRipple
            className={classes.checkbox}/>
          <Typography variant="subheading" noWrap
            className={classes.title}>入札終了時期：</Typography>
          <form className={classes.inputText} noValidate>
            <TextField id="start-time" label="始め" type="datetime-local"
              InputLabelProps={{shrink: true}}
              value={bidStartTime}
              onChange={this.handleChangeText.bind(this, 'bidStartTime')}
              className={classes.text}/>
            <TextField id="end-time" label="終わり" type="datetime-local"
              InputLabelProps={{shrink: true}}
              value={bidStopTime}
              onChange={this.handleChangeText.bind(this, 'bidStopTime')}
              className={classes.text}/>
          </form>
        </div>
      </div>
      <div className={classes.edit}>
        <div className={classes.space}/>
        <div className={classes.buttons}>
          <div className={classes.buttons}>
            <Button variant="raised"
              onClick={this.handleFilter.bind(this)}
              className={classes.button}>絞り込み</Button>
          </div>
        </div>
      </div>
      <div className={classes.edit}>
        <div className={classes.buttons}>
          <Checkbox
            checked={checked}
            onChange={this.handleChangeCheckbox.bind(this, 'checked')}
            tabIndex={-1} disableRipple
            className={classes.checkbox}/>
          <div className={classes.buttons}>
            <Button variant="raised"
              onClick={this.handleDelete.bind(this)}
              className={classes.button}>削除</Button>
          </div>
        </div>
      </div>
    </div>;
  }
};

const columnHeight = 62;
const checkboxWidth = 38;
const datetimeWidth = 200;
const styles = theme => ({
  space:        { minWidth: checkboxWidth }
, datetimes:    { display: 'flex', flexDirection: 'row'
                , marginLeft: theme.spacing.unit * 0.5 }
, title:        { margin: theme.spacing.unit * 1.75 }
, edit:         { display: 'flex', flexDirection: 'row'
                , alignItems: 'stretch'
                , height: columnHeight, minHeight: columnHeight
                , boxSizing: 'border-box'
                , padding: '5px' }
, checkbox:     { flex: 0, minWidth: checkboxWidth }
, buttons:      { flex: 0, display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, margin: theme.spacing.unit
                , wordBreak: 'keep-all' }
, inputText:    {}
, text:         { width: datetimeWidth, marginRight: theme.spacing.unit }
});
TradeFilter.displayName = 'TradeFilter';
TradeFilter.defaultProps = { note: null };
TradeFilter.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(TradeFilter);
