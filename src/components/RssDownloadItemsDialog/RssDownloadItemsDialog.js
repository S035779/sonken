import * as R                     from 'ramda';
import React                      from 'react';
import PropTypes                  from 'prop-types';
import NoteAction                 from 'Actions/NoteAction';
import std                        from 'Utilities/stdutils';
import Spinner                    from 'Utilities/Spinner';

import { withStyles }             from '@material-ui/core/styles';
import { FormControl, TextField, MenuItem } from '@material-ui/core';
import RssDialog                  from 'Components/RssDialog/RssDialog';
import RssButton                  from 'Components/RssButton/RssButton';
import LoginFormDialog            from 'Components/LoginFormDialog/LoginFormDialog';

class RssDownloadItemsDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSuccess:  false
    , isNotValid: false
    , isQueued: false
    , name: props.name
    };
  }

  componentDidMount() {
    this.spn = Spinner.of('app');
  }

  componentWillUnmount() {
    this.spn.stop();
  }

  handleClose(name) {
    this.setState({ [name]: false });
  }

  handleChangeSelect(name, event) {
    std.logInfo(RssDownloadItemsDialog.displayName, 'handleChangeSelect', name);
    this.setState({ [name]: event.target.value });
  }

  handleCloseDialog(name, event) {
    this.props.onClose(name, event);
  }

  handleDownload(operation) {
    std.logInfo(RssDownloadItemsDialog.displayName, 'handleDownload', this.props);
    const { user, ids, filter, noteNumber, itemNumber, category, checked } = this.props;
    if(noteNumber === 0 || itemNumber === 0) return;
    const type = operation === 'download/items' ? this.state.name : '9999';
    const number = checked ? noteNumber : R.length(ids);
    const params = checked ? { user, category, filter, type, number } : { user, category, filter, ids, type, number };
    switch(operation) { 
      case 'download/items':
      case 'download/images':
        return this.download(operation, params);
      case 'signedlink/images':
        return this.signedlink(operation, params);
      case 'clearcache/images':
        return this.clearcache(operation, params);
    }
  }

  clearcache(operation, params) {
    this.spn.start();
    NoteAction.deleteCache()
    return NoteAction.clearcacheJob(operation, params)
      .then(() => this.setState({ isSuccess: true }))
      .then(() => this.spn.stop())
      .catch(err => {
        std.logError(RssDownloadItemsDialog.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        this.spn.stop();
      });
  }

  signedlink(operation, params) {
    const { user, category } = params;
    this.spn.start();
    NoteAction.deleteCache()
    return NoteAction.signedlinkJob(operation, params)
      .then(() => this.props.images && R.length(this.props.images) !== 0
        ? this.setState({ isSuccess: true,  isQueued: false }) : this.setState({ isSuccess: false, isQueued: true  }))
      .then(() => this.props.images && R.length(this.props.images) !== 0
        ? this.downloadFile(operation, { urls: this.props.images }) : null)
      .then(() => this.spn.stop())
      .then(() => NoteAction.fetchJobs({ user, category }))
      .catch(err => {
        std.logError(RssDownloadItemsDialog.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        this.spn.stop();
      });
  }

  download(operation, params) {
    const { user, category } = params;
    this.spn.start();
    NoteAction.deleteCache()
    return NoteAction.downloadJob(operation, params) 
      .then(() => this.props.file && this.props.file.size !== 0
        ? this.setState({ isSuccess: true,  isQueued: false }) : this.setState({ isSuccess: false, isQueued: true  }))
      .then(() => this.props.file && this.props.file.size !== 0
        ? this.downloadFile(operation, { blob: this.props.file }) : null)
      .then(() => this.spn.stop())
      .then(() => NoteAction.fetchJobs({ user, category }))
      .catch(err => {
        std.logError(RssDownloadItemsDialog.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        this.spn.stop();
      });
  }

  downloadFile(operation, { blob, urls }) {
    std.logInfo(RssDownloadItemsDialog.displayName, 'downloadFile', blob);
    switch(operation) {
      case 'download/items':
        {
          const fileReader = new FileReader();
          fileReader.onload = function() {
            const url       = URL.createObjectURL(new Blob([this.result], { type: 'application/zip' }));
            const anchor    = document.createElement('a');
            anchor.href     = url;
            anchor.target   = '_blank';
            anchor.download = 'LIST-' + std.formatDate(new Date(), 'YYYYMMDDhhmmss') + '.zip';
            anchor.click();
            URL.revokeObjectURL(url);
          }
          fileReader.readAsArrayBuffer(blob);
          break;
        }
      case 'download/images':
        {
          const fileReader  = new FileReader();
          fileReader.onload = function() {
            const url       = URL.createObjectURL(new Blob([this.result], { type: 'application/zip' }));
            const anchor    = document.createElement('a');
            anchor.href     = url;
            anchor.target   = '_blank';
            anchor.download = 'IMG-'  + std.formatDate(new Date(), 'YYYYMMDDhhmmss') + '.zip';
            anchor.click();
            URL.revokeObjectURL(url);
          }
          fileReader.readAsArrayBuffer(blob);
          break;
        }
      case 'signedlink/images':
        {
          const setLinks    = R.map(url => {
            const anchor    = document.createElement('a');
            anchor.href     = url;
            anchor.target   = '_blank';
            anchor.download = 'IMG-'  + std.formatDate(new Date(), 'YYYYMMDDhhmmss') + '.zip';
            anchor.click();
          });
          setLinks(urls);
          break;
        }
    }
  }

  renderMenu(obj, idx) {
    return <MenuItem key={idx} value={obj.id}>{obj.name}（タイプ：{obj.type}）</MenuItem>;
  }

  isValidate() {
    const { name } = this.state;
    return (name !== '');
  }

  render() {
    //std.logInfo(RssDownloadItemsDialog.displayName, 'Props', this.props);
    //std.logInfo(RssDownloadItemsDialog.displayName, 'State', this.state);
    const { classes, title, open } = this.props;
    const { isNotValid, isSuccess, isQueued, name } = this.state;
    const formats = [
      { id: '0001', name: 'デフォルト', type: 'text/csv' }
    , { id: '0002', name: 'フォーマット１', type: 'text/csv' }
    , { id: '0003', name: 'フォーマット２', type: 'text/csv' }
    , { id: '0004', name: 'フォーマット３', type: 'text/csv' }
    ];
    const renderMenu = formats ? formats.map((obj, idx) => this.renderMenu(obj, idx)) : [];
    return <LoginFormDialog open={open} title={'ダウンロード'} onClose={this.handleCloseDialog.bind(this, 'isDownload')} >
        <div className={classes.dialog}>
        <FormControl component="fieldset" className={classes.column}>
          <TextField select autoFocus margin="dense" value={name} onChange={this.handleChangeSelect.bind(this, 'name')}
            label={title} fullWidth>{renderMenu}</TextField>
        </FormControl>
        <div className={classes.buttons}>
          <RssButton color="success" onClick={this.handleDownload.bind(this, 'signedlink/images')} classes={classes.button}>
            画像保存
          </RssButton>
          <RssButton color="success" onClick={this.handleDownload.bind(this, 'clearcache/images')} classes={classes.button}>
            キャッシュ削除
          </RssButton>
          <RssButton color="success" onClick={this.handleDownload.bind(this, 'download/items')} classes={classes.button}>
            リスト保存
          </RssButton>
          <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleClose.bind(this, 'isNotValid')}>
            内容に不備があります。もう一度確認してください。
          </RssDialog>
          <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleClose.bind(this, 'isSuccess')}>
            要求を受け付けました。
          </RssDialog>
          <RssDialog open={isQueued} title={'送信処理中'} onClose={this.handleClose.bind(this, 'isQueued')}>
            ジョブを処理中です。
          </RssDialog>
        </div>
        </div>
      </LoginFormDialog>;
  }
}
RssDownloadItemsDialog.displayName = 'RssDownloadItemsDialog';
RssDownloadItemsDialog.defaultProps = {
  title: ''
, user: ''
, name: ''
, open: false
};
RssDownloadItemsDialog.propTypes = {
  classes: PropTypes.object.isRequired
, onClose: PropTypes.func.isRequired
, title: PropTypes.string.isRequired
, user: PropTypes.string.isRequired
, category: PropTypes.string.isRequired
, checked: PropTypes.bool.isRequired
, ids: PropTypes.array.isRequired
, filter: PropTypes.object
, noteNumber: PropTypes.number.isRequired
, itemNumber: PropTypes.number.isRequired
, name: PropTypes.string.isRequired
, open: PropTypes.bool.isRequired
, file: PropTypes.object
, images: PropTypes.array
};

const columnHeight = 62;
const styles = theme => ({
  input:    { display: 'none' }
, dialog:   { display: 'flex', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'flex-start'
            , height: columnHeight, minHeight: columnHeight, boxSizing: 'border-box', padding: 5 }
, buttons:  { flex: 0, display: 'flex', flexDirection: 'row' }
, button:   { flex: 1, margin: theme.spacing.unit, wordBreak: 'keep-all' }
});
export default withStyles(styles)(RssDownloadItemsDialog);
