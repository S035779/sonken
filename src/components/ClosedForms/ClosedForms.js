import React            from 'react';
import PropTypes        from 'prop-types';
import classNames       from 'classnames';
import NoteAction       from 'Actions/NoteAction';
import std              from 'Utilities/stdutils';
import Spinner          from 'Utilities/Spinner';

import { withStyles }   from '@material-ui/core/styles';
import { Input, Button, Checkbox, Typography, TextField, FormControl }
                        from '@material-ui/core';
import { InputLabel }   from '@material-ui/core/Input';
import RssButton        from 'Components/RssButton/RssButton';
import RssDialog        from 'Components/RssDialog/RssDialog';
import RssItemList      from 'Components/RssItemList/RssItemList';

class ClosedForms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      note:             props.note
    , itemFilter:       props.itemFilter
    , checked:          false
    , lastWeekAuction:  true
    , twoWeeksAuction:  true
    , lastMonthAuction: true
    , allAuction:       true
    , inAuction:        false
    , aucStartTime:     std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
    , aucStopTime:      std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
    , isSuccess:        false
    , isNotValid:       false
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(ClosedForms.displayName, 'Props', nextProps);
    const { itemFilter, note } = nextProps;
    this.setState({ note, itemFilter });
  }

  downloadFile(blob) {
    //std.logInfo(ClosedForms.dislpayName, 'downloadFile', blob);
    const anchor = document.createElement('a');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const fileReader = new FileReader();
    fileReader.onload = function() {
      anchor.href = URL.createObjectURL(new Blob([bom, this.result], { type: 'text/csv' }));
      anchor.target = '_blank';
      anchor.download = 'download.csv';
      anchor.click();
    }
    fileReader.readAsArrayBuffer(blob);
  }

  handleChangeCheckbox(name, event) {
    //std.logInfo(ClosedForms.displayName, 'handleChangeCheckbox', name);
    const checked = event.target.checked;
    switch(name) {
      case 'inAuction':
        this.setState({
          inAuction:        checked
        , allAuction:       !checked
        , lastWeekAuction:  !checked
        , twoWeeksAuction:  !checked
        , lastMonthAuction: !checked
        });
        break;
      case 'allAuction':
        this.setState({
          inAuction:        false
        , allAuction:       checked
        , lastWeekAuction:  true
        , twoWeeksAuction:  true
        , lastMonthAuction: true
        });
        break;
      case 'lastWeekAuction':
        this.setState({
          inAuction:        !checked
        , allAuction:       false
        , lastWeekAuction:  checked
        , twoWeeksAuction:  false
        , lastMonthAuction: false
        });
        break;
      case 'twoWeeksAuction':
        this.setState({
          inAuction:        false
        , allAuction:       false
        , lastWeekAuction:  true
        , twoWeeksAuction:  checked
        , lastMonthAuction: false
        });
        break;
      case 'lastMonthAuction':
        this.setState({
          inAuction:        false
        , allAuction:       false
        , lastWeekAuction:  true
        , twoWeeksAuction:  true
        , lastMonthAuction: checked
        });
        break;
    }
  }

  handleFilter() {
    const { lastWeekAuction, twoWeeksAuction, lastMonthAuction
      , allAuction, inAuction, aucStartTime, aucStopTime } = this.state;
    const { user } = this.props;
    NoteAction.filter(user, {lastWeekAuction, twoWeeksAuction
    , lastMonthAuction, allAuction, inAuction, aucStartTime, aucStopTime});
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
    const { itemFilter } = this.state;
    std.logInfo(ClosedForms.displayName, 'handleDownload', user);
    const spn = Spinner.of('app');
    spn.start();
    NoteAction.downloadItems(user, note._id, itemFilter)
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
    //std.logInfo(ClosedForms.displayName, 'State', this.state);
    //std.logInfo(ClosedForms.displayName, 'Props', this.props);
    const { classes, itemNumber, perPage, user, note, category } = this.props;
    const { aucStartTime, aucStopTime
      , lastWeekAuction, twoWeeksAuction, lastMonthAuction
      , allAuction, inAuction, isNotValid, isSuccess } = this.state;
    const name = note.name;
    const items = note.items ? note.items : [];
    const color = this.getColor(category);
    return <div className={classes.forms}>
      <div className={classes.header}>
        <Typography variant="title" noWrap 
          className={classes.title}>{note.title}</Typography>
        <div className={classes.buttons}>
          <RssButton color={color}
            onClick={this.handleDownload.bind(this)} 
            classes={classes.button}>ダウンロード</RssButton>
          <RssDialog open={isNotValid} title={'送信エラー'}
            onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
            内容に不備があります。もう一度確認してください。
          </RssDialog>
          <RssDialog open={isSuccess} title={'送信完了'}
            onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
            要求を受け付けました。
          </RssDialog>
        </div>
      </div>
    {category === 'closedsellers' || category === 'closedmarchant'
      ? (<div className={classes.edit}>
        <Typography variant="subheading" noWrap
          className={classes.column}>絞込件数：</Typography>
        <Checkbox color="primary" 
          className={classes.checkbox}
          checked={lastWeekAuction}
          onChange={this.handleChangeCheckbox.bind(this, 'lastWeekAuction')}
          tabIndex={-1} disableRipple />
        <Typography variant="subheading" noWrap
          className={classes.column}>終了後１週間</Typography>
        <Checkbox color="primary"
          className={classes.checkbox}
          checked={twoWeeksAuction}
          onChange={this.handleChangeCheckbox.bind(this, 'twoWeeksAuction')}
          tabIndex={-1} disableRipple />
        <Typography variant="subheading" noWrap
          className={classes.column}>終了後２週間</Typography>
        <Checkbox color="primary"
          className={classes.checkbox}
          checked={lastMonthAuction}
          onChange={this.handleChangeCheckbox.bind(this, 'lastMonthAuction')}
          tabIndex={-1} disableRipple />
        <Typography variant="subheading" noWrap
          className={classes.column}>終了後１ヶ月</Typography>
        <Checkbox color="primary"
          className={classes.checkbox}
          checked={allAuction}
          onChange={this.handleChangeCheckbox.bind(this, 'allAuction')}
          tabIndex={-1} disableRipple />
        <Typography variant="subheading" noWrap
          className={classes.column}>全て表示</Typography>
      </div>)
      : null }
    {category === 'closedsellers'  || category === 'closedmarchant'
      ? (<div className={classes.edit}>
        <div className={classes.column}>
          <Typography className={classes.title}>
            全{itemNumber}件中 {perPage > itemNumber ? itemNumber : perPage}件表示
          </Typography>
        </div>
        <div className={classes.datetimes}>
          <Checkbox color="primary"
            tabIndex={-1} disableRipple
            checked={inAuction}
            onChange={this.handleChangeCheckbox.bind(this, 'inAuction')}
            className={classes.checkbox}/>
          <Typography variant="subheading" noWrap
            className={classes.column}>入札終了時期：</Typography>
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
      </div>)
      : null }
    {category === 'closedsellers'  || category === 'closedmarchant'
      ? (<div className={classes.edit}>
        <div className={classes.buttons}>
          <div className={classes.buttons}>
            <Button variant="raised"
              onClick={this.handleFilter.bind(this)}
              className={classes.button}>絞り込み</Button>
          </div>
        </div>
      </div>)
      : null }
      <div className={classNames(
        category === 'closedsellers' && classes.filterList
      , category === 'closedmarchant' && classes.filterList
      )}>
        <RssItemList 
          user={user} 
          items={items} />
      </div>
    </div>;
  }
};

const barHeightSmUp       = 64;
const barHeightSmDown     = 56;
const searchHeight        = 62;
const normalHeight        = 62 * 1;
const filterHeight        = 62 * 4;
const normalHeightSmDown  = `calc(100vh - ${barHeightSmDown}px  - ${normalHeight}px - ${searchHeight}px)`;
const normalHeightSmUp    = `calc(100vh - ${barHeightSmUp}px    - ${normalHeight}px - ${searchHeight}px)`;
const filterHeightSmDown  = `calc(100vh - ${barHeightSmDown}px  - ${filterHeight}px - ${searchHeight}px)`;
const filterHeightSmUp    = `calc(100vh - ${barHeightSmUp}px    - ${filterHeight}px - ${searchHeight}px)`;
const columnHeight        = 62;
const contentWidth        = 112;
const checkboxWidth       = 38;
const datetimeWidth       = 200;
const styles = theme => ({
  forms:        { display: 'flex', flexDirection: 'column', overflow: 'scroll' }
, normalList:   { width: '100%', height: normalHeightSmDown 
                , [theme.breakpoints.up('sm')]: { height: normalHeightSmUp }}
, filterList:   { width: '100%', height: filterHeightSmDown 
                , [theme.breakpoints.up('sm')]: { height: filterHeightSmUp }}
, header:       { display: 'flex', flexDirection: 'row'
                , alignItems: 'stretch', justifyContent: 'space-between'
                , height: columnHeight, minHeight: columnHeight
                , boxSizing: 'border-box', padding: '5px' }
, title:        { flex: 2, margin: theme.spacing.unit * 1.75 }
, datetimes:    { display: 'flex', flexDirection: 'row' }
, column:       { minWidth: contentWidth
                , margin: theme.spacing.unit * 1.75 }
, edit:         { display: 'flex', flexDirection: 'row'
                , alignItems: 'stretch'
                , height: columnHeight, minHeight: columnHeight
                , boxSizing: 'border-box', padding: '5px' }
, checkbox:     { flex: 0, minWidth: checkboxWidth }
, buttons:      { flex: 0, display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, margin: theme.spacing.unit
                , wordBreak: 'keep-all' }
, text:         { width: datetimeWidth, marginRight: theme.spacing.unit }
});
ClosedForms.displayName = 'ClosedForms';
ClosedForms.defaultProps = { note: null };
ClosedForms.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(ClosedForms);
