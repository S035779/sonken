import React            from 'react';
import PropTypes        from 'prop-types';
import * as R           from 'ramda';
import NoteAction       from 'Actions/NoteAction';
import std              from 'Utilities/stdutils';
import Spinner          from 'Utilities/Spinner';

import { withStyles }   from '@material-ui/core/styles';
import { Input, Button, Typography, TextField, FormControl, InputLabel, CircularProgress } from '@material-ui/core';
import RssButton        from 'Components/RssButton/RssButton';
import RssDialog        from 'Components/RssDialog/RssDialog';
import RssItemList      from 'Components/RssItemList/RssItemList';
import RssDownloadItemsDialog from 'Components/RssDownloadItemsDialog/RssDownloadItemsDialog';

const isAlpha = process.env.NODE_ENV !== 'production';
const mon = '//www.mnrate.com/item/aid/';
const fba = '//sellercentral.amazon.co.jp/hz/fba/profitabilitycalculator/index?lang=ja_JP';

class RssForms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      note: props.note
    , asin: props.note.asin
    , price: props.note.price
    , bidsprice: props.note.bidsprice
    , body: props.note.body
    , isSuccess: false
    , isNotValid: false
    , isRequest: false
    , isDownload: false
    , loadingDownload: props.loadingDownload
    , page: 1
    , prevPage: 1
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
    const nextPage = this.state.page
    const nextLoadingDownload = nextProps.loadingDownload;
    const prevNote = this.state.note;
    const prevPage = this.state.prevPage;
    const prevLoadingDownload = this.state.loadingDownload;
    if(prevNote && nextNote.items.length !== 0) {
      if(nextNote._id !== prevNote._id) {
        std.logInfo(RssForms.displayName, 'Init', { nextNote, nextPage, prevNote, prevPage });
        this.formsRef.scrollTop = 0;
        this.setState({
          note: nextNote, page: 1, prevPage: 1
        , loadingDownload: nextLoadingDownload
        });
      } else if(prevPage !== nextPage) {
        std.logInfo(RssForms.displayName, 'Update', { nextNote, nextPage, prevNote, prevPage });
        const getItems = obj => obj.items;
        const catItems = R.concat(prevNote.items);
        const setItems = objs => R.merge(prevNote, { items: objs });
        const setNote  = R.compose(setItems, catItems, getItems);
        this.setState({
          note: setNote(nextNote), prevPage: nextPage
        , loadingDownload: nextLoadingDownload
        });
      } else if(prevLoadingDownload !== nextLoadingDownload) {
        std.logInfo(RssForms.displayName, 'Ready', { nextNote, nextPage, prevNote, prevPage });
        this.setState({
          loadingDownload: nextLoadingDownload
        });
      }
    } else if(prevNote && prevNote.items.length !== 0) {
      if(nextNote._id !== prevNote._id) {
        std.logInfo(RssForms.displayName, 'Next', { nextNote, nextPage, prevNote, prevPage });
        this.formsRef.scrollTop = 0;
        this.setState({
          note: nextNote, page: 1, prevPage: 1
        , loadingDownload: true
        });
      } else if(nextNote._id === prevNote._id) {
        std.logInfo(RssForms.displayName, 'Prev', { nextNote, nextPage, prevNote, prevPage });
        this.setState({ note: prevNote });
      }
    }
  }

  handlePagination() {
    const { isRequest, page } = this.state;
    const scrollTop         = this.formsRef.scrollTop;
    const scrollHeight      = this.formsRef.scrollHeight;
    const clientHeight      = this.formsRef.clientHeight;
    const scrolledToBottom  = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
    if(scrolledToBottom && !isRequest) {
      this.spn.start();
      this.fetch(page + 1)
        .then(() => this.setState({ isRequest: false }))
        .then(() => this.spn.stop())
        .catch(err => {
          std.logError(RssForms.displayName, err.name, err.message);
          this.spn.stop();
        });
    }
  }

  handleSave() {
    const { user } = this.props;
    const { note } = this.state;
    if(this.isValidate() && this.isChanged()) {
      NoteAction.update(user, note._id, note)
        .then(() => this.setState({ isSuccess: true }))
        .catch(err => {
          std.logError(RssForms.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
        });
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleAutoSave() {
    const { user } = this.props;
    const { note } = this.state;
    if(this.isValidate() && this.isChanged()) {
      NoteAction.update(user, note._id, note);
    }
  }

  handleChangeInput(name, event) {
    const { note } = this.state;
    const value = event.target.value
    switch (name) {
      case 'asin':
        this.setState({
          note: Object.assign({}, note, { asin: value })
        , asin: value
        });
        break;
      case 'price':
        this.setState({
          note: Object.assign({}, note, { price: Number(value) })
        , price: Number(value)
        });
        break;
      case 'bidsprice':
        this.setState({
          note: Object.assign({}, note, { bidsprice: Number(value) })
        , bidsprice: Number(value) 
        });
        break;
      case 'body':
        this.setState({
          note: Object.assign({}, note, { body: value })
        , body: value
        });
        break;
    }
  }

  //handleDownload() {
  //  const { user, note } = this.props;
  //  //std.logInfo(RssForms.displayName, 'handleDownload', user);
  //  this.spn.start();
  //  NoteAction.downloadItems(user, note._id)
  //    .then(() => this.setState({ isSuccess: true }))
  //    .then(() => this.downloadFile(this.props.file))
  //    .then(() => this.spn.stop())
  //    .catch(err => {
  //      std.logError(RssForms.displayName, err.name, err.message);
  //      this.setState({ isNotValid: true });
  //      this.spn.stop();
  //    });
  //}

  //downloadFile(blob) {
  //  //std.logInfo(RssForms.dislpayName, 'downloadFile', blob);
  //  const anchor = document.createElement('a');
  //  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  //  const fileReader = new FileReader();
  //  fileReader.onload = function() {
  //    anchor.href = URL.createObjectURL(new Blob([bom, this.result], { type: 'text/csv' }));
  //    anchor.target = '_blank';
  //    anchor.download = 'download.csv';
  //    anchor.click();
  //  }
  //  fileReader.readAsArrayBuffer(blob);
  //}

  handleOpenDialog(name) {
    this.setState({ [name]: true });
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  fetch(page) {
    const { user, note } = this.props;
    const id = note._id;
    const limit = 20;
    const skip = (page - 1) * limit;
    //std.logInfo(RssForms.displayName, 'fetch', { id, page });
    this.setState({ isRequest: true, page });
    return NoteAction.fetch(user, id, skip, limit);
  }

  isValidate() {
    const { asin, price, bidsprice } = this.state.note;
    return (
      asin !== ''
      && std.regexNumber(price) 
      && std.regexNumber(bidsprice)
    );
  }

  isChanged() {
    const { asin, price, bidsprice, body } = this.state.note;
    const { note } = this.props;
    return (
      note.asin !== asin 
      || note.price !== price
      || note.bidsprice !== bidsprice 
      || note.body !== body
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
    //std.logInfo(RssForms.displayName, 'State', this.state);
    const { classes, itemNumber, user, note, category, file } = this.props;
    const { page, isNotValid, isSuccess, isDownload, loadingDownload } = this.state;
    const { items, asin, price, bidsprice, body} = this.state.note;
    const isChanged = this.isChanged();
    const link_mon = mon + asin;
    const link_fba = fba;
    const link_amz = note.AmazonUrl;
    const name = note.name;
    const color = this.getColor(category);
    return <div ref={node => this.formsRef = node} onScroll={this.handlePagination.bind(this)} className={classes.forms}>
      <div className={classes.header}>
        <Typography variant="h6" noWrap className={classes.title}>{note.title}</Typography>
        <div className={classes.buttons}>
          { isAlpha 
            ? ( <div className={classes.wrapper}>
              <RssButton color={color} disabled={loadingDownload} onClick={this.handleOpenDialog.bind(this, 'isDownload')}
                classes={classes.button}>ダウンロード</RssButton>
              {loadingDownload && <CircularProgress color="inherit" size={24} className={classes.btnProgress} />}
              </div> )
            : null }
          <RssDownloadItemsDialog open={isDownload} title={'フォーマット'} user={user} category={category} checked={false} ids={[note._id]} itemNumber={itemNumber}
            name="0001" file={file} onClose={this.handleCloseDialog.bind(this, 'isDownload')} />
          <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
            内容に不備があります。もう一度確認してください。
          </RssDialog>
          <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
            要求を受け付けました。
          </RssDialog>
        </div>
      </div>
      <div className={classes.edit}>
        <FormControl className={classes.text}>
          <InputLabel htmlFor="asin">ASIN</InputLabel>
          <Input id="asin" value={asin} onChange={this.handleChangeInput.bind(this, 'asin')}/>
        </FormControl>
        <div className={classes.buttons}>
          <Button variant="contained" size="medium" onClick={this.handleSave.bind(this)} className={classes.button}>
            {isChanged ? '*' : ''}登録
          </Button>
        </div>
        <div className={classes.buttons}>
          <Button color="primary" size="large" href={link_mon} target="_blank" className={classes.link}>モノレート</Button>
          <Button color="primary" size="large" href={link_fba} target="_blank" className={classes.link}>FBA料金シュミレーター</Button>
        </div>
      </div>
      <div className={classes.edit}>
        <Typography variant="subtitle1" noWrap className={classes.label}>Amazon商品名：</Typography>
        <Button color="primary" size="large" fullWidth href={link_amz} target="_blank" className={classes.name}>{name}</Button>
      </div>
      {this.props.children}
      <div className={classes.memo}>
        <div className={classes.texts}>
          <div className={classes.edit}>
            <TextField id="number" label="想定売値" value={price} onChange={this.handleChangeInput.bind(this, 'price')}
              onBlur={this.handleAutoSave.bind(this)} type="number" className={classes.text} InputLabelProps={{ shrink: true }} 
              margin="none" />
          </div>
          <div className={classes.edit}>
            <TextField id="number" label="最高入札額" value={bidsprice} onChange={this.handleChangeInput.bind(this, 'bidsprice')}
              onBlur={this.handleAutoSave.bind(this)} type="number" className={classes.text} InputLabelProps={{ shrink: true }} 
              margin="none" />
          </div>
        </div>
        <div className={classes.textarea}>
        <TextField id="body" label="自由入力欄" multiline rows="4" fullWidth margin="none" value={body} 
          onChange={this.handleChangeInput.bind(this, 'body')} onBlur={this.handleAutoSave.bind(this)} className={classes.field}/>
        </div>
      </div>
      <div className={classes.noteList}>
        <RssItemList user={user} items={items} noteId={note._id} page={page}/>
      </div>
    </div>;
  }
}
RssForms.displayName = 'RssForms';
RssForms.defaultProps = { note: null };
RssForms.propTypes = {
  classes: PropTypes.object.isRequired
, user: PropTypes.string.isRequired
, note: PropTypes.object.isRequired
, file: PropTypes.object
, itemNumber: PropTypes.number.isRequired
, loadingDownload: PropTypes.bool.isRequired
, category: PropTypes.string.isRequired
, children: PropTypes.object.isRequired
};

const barHeightSmUp     = 64;
const barHeightSmDown   = 56;
const searchHeight      = 62;
const filterHeight      = 62 * 9;
const listHeightSmDown  = `calc(100vh - ${barHeightSmDown}px  - ${filterHeight}px - ${searchHeight}px)`;
const listHeightSmUp    = `calc(100vh - ${barHeightSmUp}px - ${filterHeight}px - ${searchHeight}px)`;
const columnHeight = 62;
const styles = theme => ({
  forms:        { display: 'flex', flexDirection: 'column'
                , overflow: 'scroll' }
, noteList:     { width: '100%'
                , height: listHeightSmDown
                , [theme.breakpoints.up('sm')]: {
                  height: listHeightSmUp }}
, header:       { display: 'flex', flexDirection: 'row' 
                , alignItems: 'stretch', justifyContent: 'space-between'
                , height: columnHeight, minHeight: columnHeight
                , boxSizing: 'border-box', padding: '5px' }
, title:        { flex: 2, margin: theme.spacing.unit * 1.75 }
, label:        { margin: theme.spacing.unit * 1.75 }
, edit:         { display: 'flex', flexDirection: 'row'
                , alignItems: 'stretch'
                , height: columnHeight, minHeight: columnHeight
                , boxSizing: 'border-box'
                , padding: '5px' }
, buttons:      { display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, margin: theme.spacing.unit
                , wordBreak: 'keep-all' }
, link:         { flex: 1, margin: theme.spacing.unit /2
                , wordBreak: 'keep-all' }
, name:         { flex: 1, margin: theme.spacing.unit /2
                , border: '1px solid #CCC'
                , wordBreak: 'keep-all' }
, text:         { marginLeft: theme.spacing.unit * 1.75 }
, wrapper:      { position: 'relative' }
, btnProgress:  { position: 'absolute', top: '50%', left: '50%', marginTop: -11, marginLeft: -11 }
, memo:         { display: 'flex', flexDirection: 'row'
                , alignItems: 'stretch'
                , height: columnHeight * 2, minHeight: columnHeight * 2
                , boxSizing: 'border-box' }
, field:        { paddingTop: 5 }
, textarea:     { width: '100%', padding: 5 }
});
export default withStyles(styles)(RssForms);
