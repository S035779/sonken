import React            from 'react';
import PropTypes        from 'prop-types';
import NoteAction       from 'Actions/NoteAction';

import { withStyles }   from 'material-ui/styles';
import {
  Input, Button, Checkbox, Typography, TextField
}                       from 'material-ui';
import { InputLabel }   from 'material-ui/Input';
import { FormControl }  from 'material-ui/Form';

class BidsFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked:        false
    , endBidding:     false
    , allBidding:     false
    , inBidding:      false
    , bidStartTime:   '2017-05-24'
    , bidStopTime:    '2017-05-24'
    };
  }

  componentWillReceiveProps(props) {
    this.logInfo('componentWillReciveProps', props);
    this.setState({ note: props.notes });
  }

  handleChangeCheckbox(name, event) {
    const checked = event.target.checked;
    switch(name) {
      case 'inBidding':
        this.setState({ inBidding: checked });
        break;
      case 'allBidding':
        this.setState({ allBidding: checked });
        break;
      case 'endBidding':
        this.setState({ endBidding: checked });
        break;
      case 'checked':
        this.setState({ checked: checked });
        const { notes } = this.props;
        let ids = [];
        if(checked) {
          notes.forEach(note => {
            if(note.items)
              note.items.forEach(item => ids.push(item.guid._));
          ? notes.map(note => note.items
            ? note.items.map(item => item.guid._ ) : [] )
          : [];
        this.logInfo('handleChangeCheckbox', ids);
        NoteAction.select(ids);
        break;
    }
  }

  handleTraded() {
    const { selectedItemId } = this.props;
    this.logInfo('handleTraded', selectedItemId);
    NoteAction.createTrade(selectedItemId);
  }

  handleDelete() {
    const { selectedItemId } = this.props;
    this.logInfo('handleDelete', selectedItemId);
    if(window.confirm('Are you sure?')) {
      NoteAction.delete(selectedItemId);
    }
  }

  handleFilter() {
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

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  }

  render() {
    this.logInfo('render', this.state);
    const { classes } = this.props;
    const { bidStartTime, bidStopTime, endBidding, allBidding, inBidding }
      = this.state;
    return <div className={classes.forms}>
      <div className={classes.edit}>
        <div className={classes.space}/>
        <Typography variant="subheading" noWrap
          className={classes.title}>絞込件数：</Typography>
        <Checkbox checked={this.state.checked}
          className={classes.checkbox}
          checked={endBidding}
          onChange={this.handleChangeCheckbox.bind(this, 'endBidding')}
          tabIndex={-1} disableRipple />
        <Typography variant="subheading" noWrap
          className={classes.title}>本日入札終了</Typography>
        <Checkbox checked={this.state.checked}
          className={classes.checkbox}
          checked={allBidding}
          onChange={this.handleChangeCheckbox.bind(this, 'allBidding')}
          tabIndex={-1} disableRipple />
        <Typography variant="subheading" noWrap
          className={classes.title}>全て表示</Typography>
      </div>
      <div className={classes.edit}>
        <div className={classes.space}/>
        <div className={classes.buttons}>
          <div className={classes.buttons}>
            <Button variant="raised"
              className={classes.button}
              onClick={this.handleFilter.bind(this)}>
              絞り込み</Button>
          </div>
        </div>
        <Checkbox checked={this.state.checked}
          className={classes.checkbox}
          checked={inBidding}
          onChange={this.handleChangeCheckbox.bind(this, 'inBidding')}
          tabIndex={-1} disableRipple />
        <Typography variant="subheading" noWrap
          className={classes.title}>入札終了時期</Typography>
        <form className={classes.inputText} noValidate>
          <TextField id="date" label="開始" type="date"
            className={classes.text}
            InputLabelProps={{shrink: true}}
            value={bidStartTime}
            onChange={this.handleChangeText.bind(this, 'bidStartTime')}/>
          <TextField id="date" label="終了" type="date"
            className={classes.text}
            InputLabelProps={{shrink: true}}
            value={bidStopTime}
            onChange={this.handleChangeText.bind(this, 'bidStopTime')}/>
        </form>
      </div>
      <div className={classes.edit}>
        <div className={classes.buttons}>
          <Checkbox checked={this.state.checked}
            className={classes.checkbox}
            onChange={this.handleChangeCheckbox.bind(this, 'checked')}
            tabIndex={-1} disableRipple />
          <div className={classes.buttons}>
            <Button variant="raised"
              className={classes.button}
              onClick={this.handleDelete.bind(this)}>
              削除</Button>
          </div>
        </div>
      </div>
    </div>;
  }
};

const columnHeight = 62;
const checkboxWidth = 38;
const spaceWidth = 38;
const minWidth = 125;
const styles = theme => ({
  space:        { minWidth: spaceWidth }
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
, inputText:    { minWidth: minWidth*2 }
, text:         { marginLeft: theme.spacing.unit
                , marginRight: theme.spacing.unit }
});
BidsFilter.displayName = 'BidsFilter';
BidsFilter.defaultProps = { note: null };
BidsFilter.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(BidsFilter);
