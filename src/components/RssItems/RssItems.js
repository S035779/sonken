import React          from 'react';
import PropTypes      from 'prop-types';
import * as R         from 'ramda';
import NoteAction     from 'Actions/NoteAction';
import std            from 'Utilities/stdutils';
import Spinner        from 'Utilities/Spinner';

import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import RssButton      from 'Components/RssButton/RssButton';
import RssDialog      from 'Components/RssDialog/RssDialog';
import RssItemList    from 'Components/RssItemList/RssItemList';

const isAlpha = process.env.NODE_ENV !== 'production';

class RssItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      note: props.note
    , isSuccess: false
    , isNotValid: false
    , isRequest: false
    , page: 1
    , prevPage: 1
    };
    this.formsRef = React.createRef();
  }

  componentWillReceiveProps(nextProps) {
    const nextNote = nextProps.note;
    const nextPage = this.state.page;
    const prevNote = this.state.note;
    const prevPage = this.state.prevPage;
    if(prevNote && (nextNote._id !== prevNote._id)) {
      this.setState({ note: nextNote, page: 1, prevPage: 1 });
    } else if(prevNote && (prevPage !== nextPage) && nextNote.items.length) {
      std.logInfo(RssItems.displayName, 'Props', { nextNote, nextPage, prevNote, prevPage });
      const getItems = obj => obj.items;
      const catItems = R.concat(nextNote.items);
      const setItems = objs => R.merge(nextNote, { items: objs });
      const setNote  = R.compose(setItems ,catItems ,getItems);
      this.setState({ note: setNote(prevNote), prevPage: nextPage });
    }
  }

  handlePagination() {
    const documentElement   = this.formsRef.current;
    const scrollTop         = documentElement.scrollTop;
    const scrollHeight      = documentElement.scrollHeight;
    const clientHeight      = documentElement.clientHeight;
    const scrolledToBottom  = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
    if(scrolledToBottom) this.fetch();
  }

  fetch() {
    if(this.state.isRequest) return;
    const { user, note } = this.props;
    const page = this.state.page + 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const spn = Spinner.of('app');
    std.logInfo(RssItems.displayName, 'fetch', { id: note._id, page });
    spn.start();
    NoteAction.fetch(user, note._id, skip, limit)
      .then(() => this.setState({ isRequest: false }))
      .then(() => spn.stop());
    this.setState({ isRequest: true, page });
  }

  downloadFile(blob) {
    std.logInfo(RssItems.displayName, 'downloadFile', blob);
    const a = document.createElement('a');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const fileReader = new FileReader();
    fileReader.onload = function() {
      a.href = URL.createObjectURL(new Blob([bom, this.result], { type: 'text/csv' }));
      a.target = '_blank';
      a.download = 'download.csv';
      a.click();
    };
    fileReader.readAsArrayBuffer(blob);
  }
  
  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  handleDownload() {
    const { user, note } = this.props;
    std.logInfo(RssItems.displayName, 'handleDownload', user);
    const spn = Spinner.of('app');
    spn.start();
    NoteAction.downloadItems(user, note._id)
      .then(() => this.setState({ isSuccess: true }))
      .then(() => this.downloadFile(this.props.file))
      .then(() => spn.stop())
      .catch(err => {
        std.logError(RssItems.displayName, err.name, err.message);
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
    const { classes, user, note, category } = this.props;
    const { isNotValid, isSuccess } = this.state;
    const items = note.items ? note.items : [];
    const color = this.getColor(category);
    const page = { number: 0, perPage: 20, maxNumber: 9999 };
    return <div ref={this.formsRef} onScroll={this.handlePagination.bind(this)} className={classes.forms}>
      <div className={classes.header}>
        <Typography variant="title" noWrap className={classes.title}>{note.title}</Typography>
        <div className={classes.buttons}>
          { isAlpha ? (<RssButton color={color}
            onClick={this.handleDownload.bind(this)}
            classes={classes.button}>ダウンロード</RssButton>) : null }
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
      <div className={classes.noteList}>
        <RssItemList id={note._id} user={user} items={items} page={page} />
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
});
export default withStyles(styles)(RssItems);
