import React            from 'react';
import PropTypes        from 'prop-types';
import NoteAction       from 'Actions/NoteAction';
import std              from 'Utilities/stdutils';
import Spinner          from 'Utilities/Spinner';

import { withStyles }   from 'material-ui/styles';
import { Input, Button, Checkbox, Typography, TextField }
                        from 'material-ui';
import { InputLabel }   from 'material-ui/Input';
import { FormControl }  from 'material-ui/Form';
import RssButton        from 'Components/RssButton/RssButton';
import RssDialog        from 'Components/RssDialog/RssDialog';
import RssItemList      from 'Components/RssItemList/RssItemList';

class ClosedForms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      note:           props.note
    , itemFilter:     props.itemFilter
    , checked:        false
    , endAuction:     true
    , allAuction:     true
    , inAuction:      false
    , aucStartTime:   std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
    , aucStopTime:    std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
    , isSuccess:      false
    , isNotValid:     false
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(ClosedForms.displayName, 'Props', nextProps);
    const { itemFilter, note } = nextProps;
    this.setState({ note, itemFilter });
  }

  downloadFile(blob) {
    std.logInfo(ClosedForms.dislpayName, 'downloadFile', blob);
    const a = document.createElement('a');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const fileReader = new FileReader();
    fileReader.onload = function() {
      a.href = URL.createObjectURL(
        new Blob([bom, this.result], { type: 'text/csv' }));
      a.target = '_blank';
      a.download = 'download.csv';
      a.click();
    }
    fileReader.readAsArrayBuffer(blob);
  }

  handleChangeCheckbox(name, event) {
    std.logInfo(ClosedForms.displayName, 'handleChangeCheckbox', name);
    const checked = event.target.checked;
    switch(name) {
      case 'inAuction':
        this.setState({
          inAuction:  checked
        , allAuction: !checked
        , endAuction: !checked
        });
        break;
      case 'allAuction':
        this.setState({
          inAuction:  false
        , allAuction: checked
        , endAuction: true
        });
        break;
      case 'endAuction':
        this.setState({
          inAuction:  !checked
        , allAuction: false
        , endAuction: checked
        });
        break;
    }
  }

  handleFilter() {
    const { endAuction, allAuction, inAuction, aucStartTime, aucStopTime } = this.state;
    const { user } = this.props;
    std.logInfo(ClosedForms.displayName, 'handleFilter', {
      endAuction, allAuction, inAuction, aucStartTime, aucStopTime
    });
    NoteAction.filter(user, {
      endAuction, allAuction, inAuction, aucStartTime, aucStopTime
    });
  }

  handleChangeText(name, event) {
    switch(name) {
      case 'aucStartTime':
        this.setState({ aucStartTime: event.target.value });
        break;
      case 'aucStopTime':
        this.setState({ aucStopTime: event.target.value });
        break;
    }
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  handleDownload(event) {
    const { user, note } = this.props;
    std.logInfo(ClosedForms.displayName, 'handleDownload', user);
    const spn = Spinner.of('app');
    spn.start();
    NoteAction.downloadItems(user, note._id)
      .then(() => this.setState({ isSuccess: true }))
      .then(() => this.downloadFile(this.props.file))
      .then(() => spn.stop())
      .catch(err => {
        std.logError(ClosedForms.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        spn.stop();
      })
    ;
  }

  isValidate() {
    const { asin, price, bidsprice, body } = this.state.note;
    return (asin !== ''
      && std.regexNumber(price) && std.regexNumber(bidsprice)
    );
  }

  getColor(category) {
    switch(category) {
      case 'marchant':
        return 'skyblue';
      case 'sellers':
        return 'orange';
      case 'closedmarchant':
        return 'green';
      case 'closedsellers':
        return 'yellow';
    }
  }

  render() {
    std.logInfo(ClosedForms.displayName, 'State', this.state);
    const { classes, user, note, category } = this.props;
    const { aucStartTime, aucStopTime, endAuction, allAuction, inAuction, isNotValid, isSuccess } = this.state;
    const name = note.name;
    const items = note.items ? note.items : [];
    const color = this.getColor(category);
    return <div className={classes.forms}>
      <div className={classes.header}>
        <Typography variant="title" noWrap className={classes.title}>{note.title}</Typography>
        <div className={classes.buttons}>
          <RssButton color={color}
            onClick={this.handleDownload.bind(this)} 
            classes={classes.button}>ダウンロード</RssButton>
        </div>
      </div>
      <div className={classes.edit}>
        <div className={classes.space}/>
        <Typography variant="subheading" noWrap
          className={classes.title}>絞込件数：</Typography>
        <Checkbox color="primary" 
          className={classes.checkbox}
          checked={endAuction}
          onChange={this.handleChangeCheckbox.bind(this, 'endAuction')}
          tabIndex={-1} disableRipple />
        <Typography variant="subheading" noWrap
          className={classes.title}>本日入札終了</Typography>
        <Checkbox color="primary"
          className={classes.checkbox}
          checked={allAuction}
          onChange={this.handleChangeCheckbox.bind(this, 'allAuction')}
          tabIndex={-1} disableRipple />
        <Typography variant="subheading" noWrap
          className={classes.title}>全て表示</Typography>
        <div className={classes.datetimes}>
          <Checkbox color="primary"
            tabIndex={-1} disableRipple
            checked={inAuction}
            onChange={this.handleChangeCheckbox.bind(this, 'inAuction')}
            className={classes.checkbox}/>
          <Typography variant="subheading" noWrap
            className={classes.title}>入札終了時期：</Typography>
          <form className={classes.inputText} noValidate>
            <TextField id="start-time" label="始め" type="datetime-local"
              InputLabelProps={{shrink: true}}
              value={aucStartTime}
              onChange={this.handleChangeText.bind(this, 'aucStartTime')}
              className={classes.text}/>
            <TextField id="end-time" label="終わり" type="datetime-local"
              InputLabelProps={{shrink: true}}
              value={aucStopTime}
              onChange={this.handleChangeText.bind(this, 'aucStopTime')}
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
      <div className={classes.noteList}>
        <RssItemList user={user} items={items} />
      </div>
    </div>;
  }
};

const columnHeight = 62;
const checkboxWidth = 38;
const datetimeWidth = 200;
const styles = theme => ({
  space:        { width: checkboxWidth }
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
ClosedForms.displayName = 'ClosedForms';
ClosedForms.defaultProps = { items: null };
ClosedForms.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(ClosedForms);
