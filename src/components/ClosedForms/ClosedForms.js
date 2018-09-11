import React            from 'react';
import PropTypes        from 'prop-types';
import * as R           from 'ramda';
import classNames       from 'classnames';
import NoteAction       from 'Actions/NoteAction';
import std              from 'Utilities/stdutils';
import Spinner          from 'Utilities/Spinner';

import { withStyles }   from '@material-ui/core/styles';
import { Button, Checkbox, Typography, TextField }
                        from '@material-ui/core';
import RssButton        from 'Components/RssButton/RssButton';
import RssDialog        from 'Components/RssDialog/RssDialog';
import RssItemList      from 'Components/RssItemList/RssItemList';

class ClosedForms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      note: props.note
    , checked: false
    , lastWeekAuction: true
    , twoWeeksAuction: true
    , lastMonthAuction: true
    , allAuction: true
    , inAuction: false
    , aucStartTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
    , aucStopTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
    , isSuccess: false
    , isNotValid: false
    , isRequest: false
    , page: 1
    , prevPage: 1
    , prevAllAuction: true
    };
    this.formsRef = React.createRef();
    this.spn = Spinner.of('app');
  }

  componentWillReceiveProps(nextProps) {
    const itemFilter      = nextProps.itemFilter;
    const nextNote        = nextProps.note;
    const nextPage        = this.state.page;
    const prevAllAuction  = this.state.prevAllAuction;
    const prevNote        = this.state.note;
    const prevPage        = this.state.prevPage;
    if(prevNote && (nextNote.items.length > 0)) {
      if(nextNote._id !== prevNote._id) {
        //std.logInfo(ClosedForms.displayName, 'Init', { nextNote, nextPage, prevNote, prevPage });
        this.formsRef.current.scrollTop = 0;
        this.setState({ note: nextNote, page: 1, prevPage: 1, itemFilter });
      } else if(prevPage !== nextPage) {
        //std.logInfo(ClosedForms.displayName, 'Update', { nextNote, nextPage, prevNote, prevPage });
        const getItems = obj => obj.items;
        const catItems = R.concat(prevNote.items);
        const setItems = objs => R.merge(prevNote, { items: objs });
        const setNote  = R.compose(setItems, catItems, getItems);
        this.setState({ note: setNote(nextNote), prevPage: nextPage, itemFilter });
      } else if(!itemFilter.allAuction) {
        //std.logInfo(ClosedForms.displayName, 'Filter', { itemFilter, prevAllAuction });
        this.formsRef.current.scrollTop = 0;
        this.setState({ note: nextNote, page: 1, prevPage: 1, itemFilter, prevAllAuction: false });
      } else if(itemFilter.allAuction !== prevAllAuction) {
        //std.logInfo(ClosedForms.displayName, 'Normal', { itemFilter, prevAllAuction });
        this.formsRef.current.scrollTop = 0;
        this.setState({ note: nextNote, page: 1, prevPage: 1, itemFilter, prevAllAuction: true });
      }
    }
  }

  handlePagination() {
    const { isRequest, page } = this.state;
    const documentElement   = this.formsRef.current;
    const scrollTop         = documentElement.scrollTop;
    const scrollHeight      = documentElement.scrollHeight;
    const clientHeight      = documentElement.clientHeight;
    const scrolledToBottom  = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
    if(scrolledToBottom && !isRequest) {
      this.fetch(page + 1)
        .then(() => this.setState({ isRequest: false }))
        .then(() => this.spn.stop())
        .catch(err => {
          std.logError(ClosedForms.displayName, err.name, err.message);
          this.spn.stop();
        });
    }
  }

  fetch(page) {
    const { user, note } = this.props;
    const {
      lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, aucStartTime, aucStopTime
    } = this.state;
    const id = note._id;
    const limit = 20;
    const skip = (page - 1) * limit;
    //std.logInfo(ClosedForms.displayName, 'fetch', { id, page });
    this.spn.start();
    this.setState({ isRequest: true, page });
    return NoteAction.fetch(user, id, skip, limit, {
      lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, aucStartTime, aucStopTime
    });
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
    const { user } = this.props;
    const {
      lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, aucStartTime, aucStopTime
    , isRequest
    } = this.state;
    if(isRequest) return;
    this.fetch(1)
      .then(() => NoteAction.filter(user , {
        lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, aucStartTime, aucStopTime
      }))
      .then(() => this.setState({ isRequest: false }))
      .then(() => this.spn.stop())
      .catch(err => {
        std.logError(ClosedForms.displayName, err.name, err.message);
        this.spn.stop();
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

  handleDownload() {
    const { user, note } = this.props;
    //std.logInfo(ClosedForms.displayName, 'handleDownload', user);
    const {
      lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, aucStartTime, aucStopTime
    } = this.state;
    const id = note._id;
    this.spn.start();
    NoteAction.downloadItems(user, id, {
      lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, aucStartTime, aucStopTime
    }).then(() => this.setState({ isSuccess: true }))
      .then(() => this.downloadFile(this.props.file))
      .then(() => this.spn.stop())
      .catch(err => {
        std.logError(ClosedForms.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        this.spn.stop();
      });
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
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
    const { aucStartTime, aucStopTime, lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction
      , inAuction, isNotValid, isSuccess } = this.state;
    const { items } = this.state.note;
    const color = this.getColor(category);
    return <div ref={this.formsRef} onScroll={this.handlePagination.bind(this)} className={classes.forms}>
      <div className={classes.header}>
        <Typography variant="title" noWrap className={classes.title}>{note.title}</Typography>
        <div className={classes.buttons}>
          <RssButton color={color} onClick={this.handleDownload.bind(this)} 
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
    {category === 'closedsellers' || category === 'closedmarchant' ? 
      (<div className={classes.edit}>
        <Typography variant="subheading" noWrap className={classes.column}>絞込件数：</Typography>
        <Checkbox color="primary" className={classes.checkbox} checked={lastWeekAuction}
          onChange={this.handleChangeCheckbox.bind(this, 'lastWeekAuction')} tabIndex={-1} disableRipple />
        <Typography variant="subheading" noWrap className={classes.column}>終了後１週間</Typography>
        <Checkbox color="primary" className={classes.checkbox} checked={twoWeeksAuction}
          onChange={this.handleChangeCheckbox.bind(this, 'twoWeeksAuction')} tabIndex={-1} disableRipple />
        <Typography variant="subheading" noWrap className={classes.column}>終了後２週間</Typography>
        <Checkbox color="primary" className={classes.checkbox} checked={lastMonthAuction}
          onChange={this.handleChangeCheckbox.bind(this, 'lastMonthAuction')} tabIndex={-1} disableRipple />
        <Typography variant="subheading" noWrap className={classes.column}>終了後１ヶ月</Typography>
        <Checkbox color="primary" className={classes.checkbox} checked={allAuction}
          onChange={this.handleChangeCheckbox.bind(this, 'allAuction')} tabIndex={-1} disableRipple />
        <Typography variant="subheading" noWrap className={classes.column}>全て表示</Typography>
      </div>) : null }
    {category === 'closedsellers'  || category === 'closedmarchant'
      ? (<div className={classes.edit}>
        <div className={classes.column}>
          <Typography className={classes.title}>
            全{itemNumber}件中 {perPage > itemNumber ? itemNumber : perPage}件表示
          </Typography>
        </div>
        <div className={classes.datetimes}>
          <Checkbox color="primary" tabIndex={-1} disableRipple checked={inAuction}
            onChange={this.handleChangeCheckbox.bind(this, 'inAuction')} className={classes.checkbox}/>
          <Typography variant="subheading" noWrap className={classes.column}>入札終了時期：</Typography>
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
            <Button variant="raised" onClick={this.handleFilter.bind(this)}
              className={classes.button}>絞り込み</Button>
          </div>
        </div>
      </div>)
      : null }
      <div className={classNames(
        category === 'closedsellers'  && classes.filterList
      , category === 'closedmarchant' && classes.filterList
      )} >
        <RssItemList user={user} items={items} />
      </div>
    </div>;
  }
}
ClosedForms.displayName = 'ClosedForms';
ClosedForms.defaultProps = { note: null };
ClosedForms.propTypes = {
  classes: PropTypes.object.isRequired
, note: PropTypes.object.isRequired
, itemFilter: PropTypes.object.isRequired
, user: PropTypes.string.isRequired
, file: PropTypes.object
, itemNumber: PropTypes.number.isRequired
, perPage: PropTypes.number.isRequired
, category: PropTypes.string.isRequired
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
export default withStyles(styles)(ClosedForms);
