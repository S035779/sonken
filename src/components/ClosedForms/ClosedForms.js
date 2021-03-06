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
      note:             props.note
    , checked:          false
    , page:             1,      prevPage: 1
    , lastWeekAuction:  true
    , twoWeeksAuction:  true
    , lastMonthAuction: true
    , allAuction:       true
    , asinAuction:      false
    , inAuction:        false
    , prevLastWeekAuction:  true
    , prevTwoWeeksAuction:  true
    , prevLastMonthAuction: true
    , prevAllAuction:       true
    , prevAsinAuction:      false
    , prevInAuction:        false
    , aucStartTime:     std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
    , aucStopTime:      std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
    , sold:             0
    , loadingImages:    props.loadingImages
    , loadingDownload:  props.loadingDownload
    , isSuccess:        false
    , isNotValid:       false
    , isRequest:        false
    , isNotResult:      false
    , isDownload:       false
    , isQueued:         false
    };
  }

  componentDidMount() {
    this.spn = Spinner.of('app');
  }

  componentWillUnmount() {
    this.spn.stop();
  }

  componentWillReceiveProps(nextProps) {
    const nextNote = nextProps.note;
    const nextPage = this.state.page;
    const nextLoadingDownload = nextProps.loadingDownload;
    const nextLoadingImages   = nextProps.loadingImages;
    const prevNote = this.state.note;
    const prevPage = this.state.prevPage;
    const prevLoadingDownload = this.state.loadingDownload;
    const prevLoadingImages = this.state.loadingImages;
    //std.logInfo(ClosedForms.displayName, 'Prop', { nextNote, prevNote });
    if(prevNote && nextNote.items.length !== 0) {
      if(nextNote._id !== prevNote._id) {
        //std.logInfo(ClosedForms.displayName, 'Init', { nextNote, nextPage, prevNote, prevPage });
        this.formsRef.scrollTop = 0;
        this.setState({
          note:             nextNote
        , page:             1
        , prevPage:         1
        , loadingDownload:  nextLoadingDownload
        , loadingImages:    nextLoadingImages
        , lastWeekAuction:  true
        , twoWeeksAuction:  true
        , lastMonthAuction: true
        , allAuction:       true
        , asinAuction:      false
        , inAuction:        false
        , aucStartTime:     std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
        , aucStopTime:      std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
        , sold:             0
        });
      } else if(prevPage !== nextPage) {
        //std.logInfo(ClosedForms.displayName, 'Update', { nextNote, nextPage, prevNote, prevPage });
        const getItems = obj => obj.items;
        const catItems = R.concat(prevNote.items);
        const setItems = objs => R.merge(prevNote, { items: objs });
        const setNote  = R.compose(setItems, catItems, getItems);
        this.setState({
          note:             setNote(nextNote)
        , prevPage:         nextPage
        , loadingDownload:  nextLoadingDownload
        , loadingImages:    nextLoadingImages
        });
      //} else if(!nextFilter.allAuction) {
      //  std.logInfo(ClosedForms.displayName, 'Filter', { nextFilter, prevAllAuction });
      //  this.setState({
      //    note: nextNote
      //  , prevAllAuction: false
      //  , loadingDownload: nextLoadingDownload, loadingImages: nextLoadingImages
      //  });
      //} else if(nextFilter.allAuction !== prevAllAuction) {
      //  std.logInfo(ClosedForms.displayName, 'Normal', { nextFilter, prevAllAuction });
      //  this.setState({
      //    note: nextNote, page: 1, prevPage: 1
      //  , prevAllAuction: true
      //  , loadingDownload: nextLoadingDownload, loadingImages: nextLoadingImages
      //  });
      } else if(this.isPrevFilter(nextProps.itemFilter, this.state)) {
        //std.logInfo(ClosedForms.displayName, 'Filter', { nextNote, nextPage, prevNote, prevPage });
        this.formsRef.scrollTop = 0;
        this.setState({ 
          note:             nextNote
        , page:             1
        , prevPage:         1
        , loadingDownload:  nextLoadingDownload
        , loadingImages:    nextLoadingImages
        , prevLastWeekAuction:  this.state.lastWeekAuction
        , prevTwoWeeksAuction:  this.state.twoWeeksAuction
        , prevLastMonthAuction: this.state.lastMonthAuction
        , prevAllAuction:       this.state.allAuction
        , prevAsinAuction:      this.state.asinAuction
        , prevInAuction:        this.state.inAuction
        });
      } else if(nextLoadingDownload !== prevLoadingDownload || nextLoadingImages !== prevLoadingImages) {
        //std.logInfo(ClosedForms.displayName, 'Ready', { nextNote, nextPage, prevNote, prevPage });
        this.setState({
          loadingDownload:  nextLoadingDownload
        , loadingImages:    nextLoadingImages
        });
      }
    } else if(prevNote && nextNote.items.length === 0) {
      if(nextNote._id !== prevNote._id) {
        //std.logInfo(ClosedForms.displayName, 'Next', { nextNote, nextPage, prevNote, prevPage });
        this.formsRef.scrollTop = 0;
        this.setState({
          note: nextNote
        , page: 1, prevPage: 1
        , loadingDownload:  true
        , loadingImages:    true
        , lastWeekAuction:  true
        , twoWeeksAuction:  true
        , lastMonthAuction: true
        , allAuction:       true
        , asinAuction:      false
        , inAuction:        false
        , aucStartTime:     std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
        , aucStopTime:      std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
        , sold:             0
        });
      }
    }
  }

  isPrevFilter(nextFilter, prevFilter) {
    return (
       nextFilter.lastWeekAuction  !== prevFilter.lastWeekAuction
    || nextFilter.twoWeeksAuction  !== prevFilter.twoWeeksAuction
    || nextFilter.lastMonthAuction !== prevFilter.lastMonthAuction
    || nextFilter.allAuction       !== prevFilter.allAuction
    || nextFilter.asinAuction      !== prevFilter.asinAuction
    || nextFilter.inAuction        !== prevFilter.inAuction
    || prevFilter.lastWeekAuction  !== prevFilter.prevLastWeekAuction
    || prevFilter.twoWeeksAuction  !== prevFilter.prevTwoWeeksAuction
    || prevFilter.lastMonthAuction !== prevFilter.prevLastMonthAuction
    || prevFilter.allAuction       !== prevFilter.prevAllAuction
    || prevFilter.asinAuction      !== prevFilter.prevAsinAuction
    || prevFilter.inAuction        !== prevFilter.prevInAuction
    );
  }

  handlePagination() {
    const { isRequest, page } = this.state;
    const scrollTop         = this.formsRef.scrollTop;
    const scrollHeight      = this.formsRef.scrollHeight;
    const clientHeight      = this.formsRef.clientHeight;
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
        {
          this.setState({
            inAuction:        checked
            , allAuction:       !checked
            , lastWeekAuction:  !checked
            , twoWeeksAuction:  !checked
            , lastMonthAuction: !checked
          });
          break;
        }
      case 'allAuction':
        {
          this.setState({
            inAuction:        false
            , allAuction:       checked
            , lastWeekAuction:  true
            , twoWeeksAuction:  true
            , lastMonthAuction: true
          }, () => this.handleFilter());
          break;
        }
      case 'lastWeekAuction':
        {
          this.setState({
            inAuction:        !checked
            , allAuction:       false
            , lastWeekAuction:  checked
            , twoWeeksAuction:  false
            , lastMonthAuction: false
          }, () => this.handleFilter());
          break;
        }
      case 'twoWeeksAuction':
        {
          this.setState({
            inAuction:        false
            , allAuction:       false
            , lastWeekAuction:  true
            , twoWeeksAuction:  checked
            , lastMonthAuction: false
          }, () => this.handleFilter());
          break;
        }
      case 'lastMonthAuction':
        {
          this.setState({
            inAuction:        false
            , allAuction:       false
            , lastWeekAuction:  true
            , twoWeeksAuction:  true
            , lastMonthAuction: checked
          }, () => this.handleFilter());
          break;
        }
      case 'asinAuction':
        {
          this.setState({
            asinAuction: checked
          }, () => this.handleFilter());
          break;
        }
    }
  }

  handleFilter() {
    const { user } = this.props;
    const { lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, asinAuction, inAuction, aucStartTime, aucStopTime, sold
      , isRequest } = this.state;
    if(isRequest) return;
    this.fetch(1)
      .then(() => NoteAction.filter(user, { lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, asinAuction, inAuction
        , aucStartTime, aucStopTime, sold }))
      .then(() => this.setState({ isRequest: false }))
      .then(() => this.spn.stop())
      //.then(() => this.props.itemNumber === 0 ? this.setState({ isNotResult: true }) : null)
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

  handleOpenDialog(name) {
    this.setState({ [name]: true });
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  fetch(page) {
    const { user, category, note } = this.props;
    const { lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, asinAuction, inAuction, aucStartTime, aucStopTime, sold } 
      = this.state;
    const id = note._id;
    const limit = 20;
    const skip = (page - 1) * limit;
    this.spn.start();
    this.setState({ isRequest: true, page });
    return NoteAction.fetch(user, category, id, skip, limit
      , { lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, asinAuction, inAuction, aucStartTime, aucStopTime, sold });
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
    const { classes, itemNumber, noteNumber, itemsNumber, perPage, user, note, category, file, images } = this.props;
    const { aucStartTime, aucStopTime, lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, asinAuction, inAuction, sold
      , page, isNotValid, isSuccess, isNotResult, isDownload, isQueued, loadingDownload, loadingImages } = this.state;
    const { items } = this.state.note;
    const filter = { aucStartTime, aucStopTime, lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, asinAuction, inAuction
      , sold };
    const color = this.getColor(category);
    return <div ref={node => this.formsRef = node} onScroll={this.handlePagination.bind(this)} className={classes.forms}>
      <div className={classes.header}>
        <Typography variant="h6" noWrap className={classes.title}>{note.title}</Typography>
        <div className={classes.buttons}>
          <div className={classes.wrapper}>
            <RssButton color={color} disabled={loadingDownload || loadingImages} onClick={this.handleOpenDialog.bind(this, 'isDownload')}
              classes={classes.button}>ダウンロード</RssButton>
            {(loadingDownload || loadingImages) && <CircularProgress color="inherit"  size={24} className={classes.btnProgress} />}
          </div>
          <RssDownloadItemsDialog open={isDownload} title={'フォーマット'} user={user} category={category} checked={false} 
            ids={[note._id]} noteNumber={noteNumber} itemsNumber={itemsNumber} itemNumber={itemNumber} filter={filter} 
            name="0001" file={file} images={images} onClose={this.handleCloseDialog.bind(this, 'isDownload')} />
          <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
            内容に不備があります。もう一度確認してください。
          </RssDialog>
          <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
            要求を受け付けました。
          </RssDialog>
          <RssDialog open={isNotResult} title={'検索結果なし'} onClose={this.handleCloseDialog.bind(this, 'isNotResult')}>
            検索条件を見直してください。
          </RssDialog>
          <RssDialog open={isQueued} title={'送信処理中'} onClose={this.handleCloseDialog.bind(this, 'isQueued')}>
            ジョブを処理中です。
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
        <Typography variant="subtitle1" noWrap className={classes.column}>全期間表示</Typography>
        <Checkbox color="primary" className={classes.checkbox} checked={asinAuction}
          onChange={this.handleChangeCheckbox.bind(this, 'asinAuction')} tabIndex={-1} disableRipple />
        <Typography variant="subtitle1" noWrap className={classes.column}>ASIN有り</Typography>
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
, images: PropTypes.array
, noteNumber: PropTypes.number.isRequired
, itemsNumber: PropTypes.number.isRequired
, itemNumber: PropTypes.number.isRequired
, perPage: PropTypes.number.isRequired
, loadingImages: PropTypes.bool.isRequired
, loadingDownload: PropTypes.bool.isRequired
, category: PropTypes.string.isRequired
};

const barHeightSmUp       = 64;
const barHeightSmDown     = 56;
const searchHeight        = 62;
const filterHeight        = 62 * 4;
const filterHeightSmDown  = `calc(100vh - ${barHeightSmDown}px  - ${filterHeight}px - ${searchHeight}px)`;
const filterHeightSmUp    = `calc(100vh - ${barHeightSmUp}px    - ${filterHeight}px - ${searchHeight}px)`;
const columnHeight        = 62;
const contentWidth        = 112;
const checkboxWidth       = 38;
const datetimeWidth       = 200;
const minWidth            = 125;
const styles = theme => ({
  forms:        { display: 'flex', flexDirection: 'column', overflow: 'auto' }
, filterList:   { width: '100%', height: filterHeightSmDown, [theme.breakpoints.up('sm')]: { height: filterHeightSmUp }}
, header:       { display: 'flex', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between'
                , height: columnHeight, minHeight: columnHeight, boxSizing: 'border-box', padding: '5px' }
, title:        { flex: 2, margin: theme.spacing.unit * 1.75 }
, datetimes:    { display: 'flex', flexDirection: 'row' }
, column:       { minWidth: contentWidth, margin: theme.spacing.unit * 1.75 }
, edit:         { display: 'flex', flexDirection: 'row', alignItems: 'stretch', height: columnHeight, minHeight: columnHeight
                , boxSizing: 'border-box', padding: '5px' }
, checkbox:     { flex: 0, minWidth: checkboxWidth }
, inputSelect:  { margin: theme.spacing.unit / 3 + 1, minWidth }
, buttons:      { flex: 0, display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, margin: theme.spacing.unit, wordBreak: 'keep-all' }
, text:         { width: datetimeWidth, marginRight: theme.spacing.unit }
, wrapper:      { position: 'relative' }
, btnProgress:  { position: 'absolute', top: '50%', left: '50%', marginTop: -11, marginLeft: -11 }
});
export default withStyles(styles)(ClosedForms);
