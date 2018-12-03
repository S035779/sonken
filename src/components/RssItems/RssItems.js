import React                  from 'react';
import PropTypes              from 'prop-types';
import * as R                 from 'ramda';
import NoteAction             from 'Actions/NoteAction';
import std                    from 'Utilities/stdutils';
import Spinner                from 'Utilities/Spinner';

import { withStyles }         from '@material-ui/core/styles';
import { Typography, CircularProgress }
                              from '@material-ui/core';
import RssButton              from 'Components/RssButton/RssButton';
import RssDialog              from 'Components/RssDialog/RssDialog';
import RssItemList            from 'Components/RssItemList/RssItemList';
import RssDownloadItemsDialog from 'Components/RssDownloadItemsDialog/RssDownloadItemsDialog';

const isAlpha = process.env.NODE_ENV !== 'production';

class RssItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      note: props.note
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
    const nextPage = this.state.page;
    const nextLoadingDownload = nextProps.loadingDownload;
    const prevNote = this.state.note;
    const prevPage = this.state.prevPage;
    const prevLoadingDownload = this.state.loadingDownload;
    if(prevNote && nextNote.items.length !== 0) {
      if(nextNote._id !== prevNote._id) {
        std.logInfo(RssItems.displayName, 'Init', { nextNote, nextPage, prevNote, prevPage });
        this.formsRef.scrollTop = 0;
        this.setState({
          note: nextNote, page: 1, prevPage: 1
        , loadingDownload: nextLoadingDownload
        });
      } else if(prevPage !== nextPage) {
        std.logInfo(RssItems.displayName, 'Update', { nextNote, nextPage, prevNote, prevPage });
        const getItems = obj => obj.items;
        const catItems = R.concat(prevNote.items);
        const setItems = objs => R.merge(prevNote, { items: objs });
        const setNote  = R.compose(setItems ,catItems ,getItems);
        this.setState({
          note: setNote(nextNote), prevPage: nextPage
        , loadingDownload: nextLoadingDownload
        });
      } else if(prevLoadingDownload !== nextLoadingDownload) {
        std.logInfo(RssItems.displayName, 'Ready', { nextNote, nextPage, prevNote, prevPage });
        this.setState({
          loadingDownload: nextLoadingDownload
        });
      }
    } else if(prevNote && prevNote.items.length !== 0) {
      if(nextNote._id !== prevNote._id) {
        std.logInfo(RssItems.displayName, 'Next', { nextNote, nextPage, prevNote, prevPage });
        this.formsRef.scrollTop = 0;
        this.setState({
          note: nextNote, page: 1, prevPage: 1
        , loadingDownload: true
        });
      } else if(nextNote._id === prevNote._id) {
        std.logInfo(RssItems.displayName, 'Prev', { nextNote, nextPage, prevNote, prevPage });
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
          std.logError(RssItems.displayName, err.name, err.message);
          this.spn.stop();
        });
    }
  }

  //handleDownload() {
  //  const { user, note } = this.props;
  //  //std.logInfo(RssItems.displayName, 'handleDownload', user);
  //  this.spn.start();
  //  NoteAction.downloadItems(user, note._id)
  //    .then(() => this.setState({ isSuccess: true }))
  //    .then(() => this.downloadFile(this.props.file))
  //    .then(() => this.spn.stop())
  //    .catch(err => {
  //      std.logError(RssItems.displayName, err.name, err.message);
  //      this.setState({ isNotValid: true });
  //      this.spn.stop();
  //    })
  //  ;
  //}

  //downloadFile(blob) {
  //  //std.logInfo(RssItems.displayName, 'downloadFile', blob);
  //  const a = document.createElement('a');
  //  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  //  const fileReader = new FileReader();
  //  fileReader.onload = function() {
  //    a.href = URL.createObjectURL(new Blob([bom, this.result], { type: 'text/csv' }));
  //    a.target = '_blank';
  //    a.download = 'download.csv';
  //    a.click();
  //  };
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
    //std.logInfo(RssItems.displayName, 'fetch', { id, page });
    this.setState({ isRequest: true, page });
    return NoteAction.fetch(user, id, skip, limit);
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
    const { classes, noteNumber, itemNumber, user, note, category, file, images } = this.props;
    const { page, isNotValid, isSuccess, isDownload, loadingDownload } = this.state;
    const { items } = this.state.note;
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
          <RssDownloadItemsDialog open={isDownload} title={'フォーマット'} user={user} category={category} checked={false} 
            ids={[note._id]} noteNumber={noteNumber} itemNumber={itemNumber} name="0001" file={file} images={images} 
            onClose={this.handleCloseDialog.bind(this, 'isDownload')} />
          <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
            内容に不備があります。もう一度確認してください。
          </RssDialog>
          <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
            要求を受け付けました。
          </RssDialog>
        </div>
      </div>
      <div className={classes.noteList}>
        <RssItemList user={user} items={items} noteId={note._id} page={page}/>
      </div>
    </div>;
  }
}
RssItems.displayName = 'RssItems';
RssItems.defaultProps = { note: null };
RssItems.propTypes = {
  classes: PropTypes.object.isRequired
, user: PropTypes.string.isRequired
, note: PropTypes.object.isRequired
, file: PropTypes.object
, images: PropTypes.array
, noteNumber: PropTypes.number.isRequired
, itemNumber: PropTypes.number.isRequired
, loadingDownload: PropTypes.bool.isRequired
, category: PropTypes.string.isRequired
};

const barHeightSmDown   = 64;
const barHeightSmUp     = 56;
const searchHeight      = 62;
const filterHeight      = 62;
const listHeightSmDown  = `calc(100vh - ${barHeightSmDown}px - ${filterHeight}px - ${searchHeight}px)`;
const listHeightSmUp    = `calc(100vh - ${barHeightSmUp}px - ${filterHeight}px - ${searchHeight}px)`;
const columnHeight = 62;
const styles = theme => ({
  forms:        { display: 'flex', flexDirection: 'column', overflow: 'scroll' }
, noteList:     { width: '100%'
                , height: listHeightSmDown
                , [theme.breakpoints.up('sm')]: { height: listHeightSmUp }}
, header:       { display: 'flex', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between'
                , height: columnHeight, minHeight: columnHeight, boxSizing: 'border-box', padding: '5px' }
, title:        { flex: 2, margin: theme.spacing.unit * 1.75 }
, buttons:      { display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, margin: theme.spacing.unit, wordBreak: 'keep-all'  }
, wrapper:      { position: 'relative' }
, btnProgress:  { position: 'absolute', top: '50%', left: '50%', marginTop: -11, marginLeft: -11 }
});
export default withStyles(styles)(RssItems);
