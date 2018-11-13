import React                  from 'react';
import PropTypes              from 'prop-types';
import * as R                 from 'ramda';
import NoteAction             from 'Actions/NoteAction';
import std                    from 'Utilities/stdutils';
import Spinner                from 'Utilities/Spinner';

import { withStyles }         from '@material-ui/core/styles';
import { Button, Checkbox, Typography, TextField, Select, InputLabel, FormControl, MenuItem, CircularProgress }
                              from '@material-ui/core';
import RssButton              from 'Components/RssButton/RssButton';
import RssDialog              from 'Components/RssDialog/RssDialog';
import RssItemList            from 'Components/RssItemList/RssItemList';
import RssDownloadItemsDialog from 'Components/RssDownloadItemsDialog/RssDownloadItemsDialog';

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
    , sold: 0
    , page: 1
    , prevPage: 1
    , prevAllAuction: true
    , isSuccess: false
    , isNotValid: false
    , isRequest: false
    , isNotResult: false
    , isDownload: false
    , loadingImages: props.loadingImages
    , loadingDownload: props.loadingDownload
    };
    this.formsRef = React.createRef();
  }

  componentDidMount() {
    this.spn = Spinner.of('app');
  }

  componentWillUnmount() {
    this.spn.stop();
  }

  componentWillReceiveProps(nextProps) {
    const nextFilter = nextProps.itemFilter;
    const nextNote = nextProps.note;
    const nextPage = this.state.page;
    const nextLoadingDownload = nextProps.loadingDownload;
    const nextLoadingImages = nextProps.loadingImages;
    const prevAllAuction = this.state.prevAllAuction;
    const prevNote = this.state.note;
    const prevPage = this.state.prevPage;
    const prevLoadingDownload = this.state.loadingDownload;
    const prevLoadingImages = this.state.loadingImages;
    if(prevNote && nextNote.items.length !== 0) {
      if(nextNote._id !== prevNote._id) {
        std.logInfo(ClosedForms.displayName, 'Init', { nextNote, nextPage, prevNote, prevPage });
        this.formsRef.current.scrollTop = 0;
        this.setState({
          note: nextNote, page: 1, prevPage: 1
        , loadingDownload: nextLoadingDownload, loadingImages: nextLoadingImages
        , lastWeekAuction: true, twoWeeksAuction: true, lastMonthAuction: true
        , allAuction: true, inAuction: false
        , aucStartTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
        , aucStopTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
        , sold: 0
        });
      } else if(prevPage !== nextPage) {
        std.logInfo(ClosedForms.displayName, 'Update', { nextNote, nextPage, prevNote, prevPage });
        const getItems = obj => obj.items;
        const catItems = R.concat(prevNote.items);
        const setItems = objs => R.merge(prevNote, { items: objs });
        const setNote  = R.compose(setItems, catItems, getItems);
        this.setState({
          note: setNote(nextNote), prevPage: nextPage
        , loadingDownload: nextLoadingDownload, loadingImages: nextLoadingImages
        });
      } else if(!nextFilter.allAuction) {
        std.logInfo(ClosedForms.displayName, 'Filter', { nextFilter, prevAllAuction });
        this.formsRef.current.scrollTop = 0;
        this.setState({
          note: nextNote, page: 1, prevPage: 1
        , prevAllAuction: false
        , loadingDownload: nextLoadingDownload, loadingImages: nextLoadingImages
        });
      } else if(nextFilter.allAuction !== prevAllAuction) {
        std.logInfo(ClosedForms.displayName, 'Normal', { nextFilter, prevAllAuction });
        this.formsRef.current.scrollTop = 0;
        this.setState({
          note: nextNote, page: 1, prevPage: 1
        , prevAllAuction: true
        , loadingDownload: nextLoadingDownload, loadingImages: nextLoadingImages
        });
      } else if(nextLoadingDownload !== prevLoadingDownload || nextLoadingImages !== prevLoadingImages) {
        std.logInfo(ClosedForms.displayName, 'Ready', { nextNote, nextPage, prevNote, prevPage });
        this.setState({
          loadingDownload: nextLoadingDownload, loadingImages: nextLoadingImages
        });
      }
    } else if(prevNote && prevNote.items.length !== 0) {
      if(nextNote._id !== prevNote._id) {
        std.logInfo(ClosedForms.displayName, 'Next', { nextNote, nextPage, prevNote, prevPage });
        this.formsRef.current.scrollTop = 0;
        this.setState({ 
          note: nextNote, page: 1, prevPage: 1
        , prevAllAuction: true
        , loadingDownload: true, loadingImages: true
        });
      } else if(nextNote._id === prevNote._id) {
        std.logInfo(ClosedForms.displayName, 'Prev', { nextNote, nextPage, prevNote, prevPage });
        this.setState({ note: prevNote });
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

  handleChangeCheckbox(name, event) {
    //std.logInfo(ClosedForms.displayName, 'handleChangeCheckbox', name);
    const checked = event.target.checked;
    switch(name) {
      case 'inAuction':
        this.setState({
          inAuction: checked, allAuction: !checked, lastWeekAuction: !checked, twoWeeksAuction: !checked, lastMonthAuction: !checked
        });
        break;
      case 'allAuction':
        this.setState({
          inAuction: false, allAuction: checked, lastWeekAuction: true, twoWeeksAuction:  true, lastMonthAuction: true
        });
        break;
      case 'lastWeekAuction':
        this.setState({
          inAuction: !checked, allAuction: false, lastWeekAuction: checked, twoWeeksAuction: false, lastMonthAuction: false
        });
        break;
      case 'twoWeeksAuction':
        this.setState({
          inAuction: false, allAuction: false, lastWeekAuction: true, twoWeeksAuction: checked, lastMonthAuction: false
        });
        break;
      case 'lastMonthAuction':
        this.setState({
          inAuction: false, allAuction: false, lastWeekAuction: true, twoWeeksAuction: true, lastMonthAuction: checked
        });
        break;
    }
  }

  handleFilter() {
    const { user } = this.props;
    const { lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, aucStartTime, aucStopTime, sold, isRequest }
      = this.state;
    if(isRequest) return;
    this.fetch(1)
      .then(() => NoteAction.filter(user
        , { lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, aucStartTime, aucStopTime, sold }))
      .then(() => this.setState({ isRequest: false }))
      .then(() => this.spn.stop())
      .then(() => this.props.itemNumber === 0 ? this.setState({ isNotResult: true }) : null)
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

  handleChangeSelect(name, event) {
    const sold = event.target.value;
    std.logInfo(ClosedForms.displayName, 'handleChangeSelect', sold);
    this.setState({ sold, allAuction: false  })
  }

  handleImages() {
    const { user, note, itemNumber } = this.props;
    //std.logInfo(ClosedForms.displayName, 'handleImages', user);
    const { lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, aucStartTime, aucStopTime, sold } = this.state;
    const id = note._id;
    if(itemNumber !== 0) {
      this.spn.start();
      NoteAction.downloadImages(user, id
        , { lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, aucStartTime, aucStopTime, sold })
        .then(() => this.setState({ isSuccess: true }))
        .then(() => this.downloadImages(this.props.images))
        .then(() => this.spn.stop())
        .catch(err => {
          std.logError(ClosedForms.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
          this.spn.stop();
        });
    }
  }

  handleOpenDialog(name) {
    this.setState({ [name]: true });
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  fetch(page) {
    const { user, note } = this.props;
    const { lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, aucStartTime, aucStopTime, sold } = this.state;
    const id = note._id;
    const limit = 20;
    const skip = (page - 1) * limit;
    //std.logInfo(ClosedForms.displayName, 'fetch', { id, page });
    this.spn.start();
    this.setState({ isRequest: true, page });
    return NoteAction.fetch(user, id, skip, limit
      , { lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, aucStartTime, aucStopTime, sold });
  }

  downloadImages(blob) {
    std.logInfo(ClosedForms.displayName, 'downloadImages', blob);
    const anchor = document.createElement('a');
    const url = URL.createObjectURL(blob);
    anchor.href = url;
    anchor.target = '_blank';
    anchor.download = 'download.zip';
    anchor.click();
    URL.revokeObjectURL(url);
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
    const { classes, itemNumber, perPage, user, note, category, file } = this.props;
    const { aucStartTime, aucStopTime, lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, sold, page, isNotValid
      , isSuccess, isNotResult, isDownload, loadingDownload, loadingImages } = this.state;
    const { items } = this.state.note;
    const filter = { aucStartTime, aucStopTime, lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction, sold };
    const color = this.getColor(category);
    return <div ref={this.formsRef} onScroll={this.handlePagination.bind(this)} className={classes.forms}>
      <div className={classes.header}>
        <Typography variant="h6" noWrap className={classes.title}>{note.title}</Typography>
        <div className={classes.buttons}>
          <div className={classes.wrapper}>
            <RssButton color={color} disabled={loadingImages} onClick={this.handleImages.bind(this)}
              classes={classes.button}>画像保存</RssButton>
            {loadingImages && <CircularProgress color="inherit" size={24} className={classes.btnProgress} />}
          </div>
          <div className={classes.wrapper}>
            <RssButton color={color} disabled={loadingDownload} onClick={this.handleOpenDialog.bind(this, 'isDownload')}
              classes={classes.button}>ダウンロード</RssButton>
            {loadingDownload && <CircularProgress color="inherit"  size={24} className={classes.btnProgress} />}
          </div>
          <RssDownloadItemsDialog open={isDownload} title={'フォーマット'} user={user} category={category} checked={false} ids={[note._id]} itemNumber={itemNumber} 
            filter={filter} name="0001" file={file} onClose={this.handleCloseDialog.bind(this, 'isDownload')} />
          <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
            内容に不備があります。もう一度確認してください。
          </RssDialog>
          <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
            要求を受け付けました。
          </RssDialog>
          <RssDialog open={isNotResult} title={'検索結果なし'} onClose={this.handleCloseDialog.bind(this, 'isNotResult')}>
            検索条件を見直してください。
          </RssDialog>
        </div>
      </div>
      <div className={classes.edit}>
        <Typography variant="subtitle1" noWrap className={classes.column}>絞込件数：</Typography>
        <Checkbox color="primary" className={classes.checkbox} checked={lastWeekAuction}
          onChange={this.handleChangeCheckbox.bind(this, 'lastWeekAuction')} tabIndex={-1} disableRipple />
        <Typography variant="subtitle1" noWrap className={classes.column}>終了後１週間</Typography>
        <Checkbox color="primary" className={classes.checkbox} checked={twoWeeksAuction}
          onChange={this.handleChangeCheckbox.bind(this, 'twoWeeksAuction')} tabIndex={-1} disableRipple />
        <Typography variant="subtitle1" noWrap className={classes.column}>終了後２週間</Typography>
        <Checkbox color="primary" className={classes.checkbox} checked={lastMonthAuction}
          onChange={this.handleChangeCheckbox.bind(this, 'lastMonthAuction')} tabIndex={-1} disableRipple />
        <Typography variant="subtitle1" noWrap className={classes.column}>終了後１ヶ月</Typography>
        <Checkbox color="primary" className={classes.checkbox} checked={allAuction}
          onChange={this.handleChangeCheckbox.bind(this, 'allAuction')} tabIndex={-1} disableRipple />
        <Typography variant="subtitle1" noWrap className={classes.column}>全て表示</Typography>
      </div>
      <div className={classes.edit}>
        <div className={classes.column}>
          <Typography variant="body2" className={classes.title}>
            全{itemNumber}件中 {perPage > itemNumber ? itemNumber : perPage}件表示
          </Typography>
        </div>
        <div className={classes.datetimes}>
          <Checkbox color="primary" tabIndex={-1} disableRipple checked={inAuction}
            onChange={this.handleChangeCheckbox.bind(this, 'inAuction')} className={classes.checkbox}/>
          <Typography variant="subtitle1" noWrap className={classes.column}>入札終了時期：</Typography>
          <form className={classes.inputText} noValidate>
            <TextField id="start-time" label="始め" type="datetime-local" InputLabelProps={{shrink: true}} value={aucStartTime}
              onChange={this.handleChangeText.bind(this, 'aucStartTime')} className={classes.text}/>
            <TextField id="end-time" label="終わり" type="datetime-local" InputLabelProps={{shrink: true}} value={aucStopTime}
              onChange={this.handleChangeText.bind(this, 'aucStopTime')} className={classes.text}/>
          </form>
        </div>
        <FormControl className={classes.inputSelect}>
          <InputLabel htmlFor="results">落札件数</InputLabel>
          <Select value={sold} onChange={this.handleChangeSelect.bind(this, 'sold')}>
            <MenuItem value={0}>0</MenuItem>
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className={classes.edit}>
        <div className={classes.buttons}>
          <div className={classes.buttons}>
            <Button variant="contained" onClick={this.handleFilter.bind(this)} className={classes.button}>絞り込み</Button>
          </div>
        </div>
      </div>
      <div className={classes.filterList}>
        <RssItemList user={user} items={items} noteId={note._id} page={page}/>
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
, images: PropTypes.object
, itemNumber: PropTypes.number.isRequired
, perPage: PropTypes.number.isRequired
, loadingImages: PropTypes.bool.isRequired
, loadingDownload: PropTypes.bool.isRequired
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
const minWidth            = 125;
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
, inputSelect:  { margin: theme.spacing.unit / 3 + 1, minWidth }
, buttons:      { flex: 0, display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, margin: theme.spacing.unit
                , wordBreak: 'keep-all' }
, text:         { width: datetimeWidth, marginRight: theme.spacing.unit }
, wrapper:      { position: 'relative' }
, btnProgress:  { position: 'absolute', top: '50%', left: '50%', marginTop: -11, marginLeft: -11 }
});
export default withStyles(styles)(ClosedForms);
