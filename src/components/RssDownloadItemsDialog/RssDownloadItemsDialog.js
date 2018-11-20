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

  handleDownload() {
    std.logInfo(RssDownloadItemsDialog.displayName, 'handleDownload', this.props);
    const { user, ids, filter, itemNumber, category, checked } = this.props;
    const { name } = this.state;
    NoteAction.deleteCache();
    if(itemNumber !== 0) {
      if(checked) {
        this.spn.start();
        std.logInfo(RssDownloadItemsDialog.displayName, 'handleDownload', { user, category, filter, name });
        NoteAction.createJob('download/items', { user, category, filter, type: name })
          .then(() => this.setState({ isSuccess: true }))
          //.then(() => this.props.file && this.props.file.size !== 0
          //  ? this.downloadFile(this.props.file, { type: 'application/zip' }) : null)
          .then(() => this.props.signedlink ? this.downloadLink(this.props.signedlink, { type: 'application/zip' }) : null)
          .then(() => this.spn.stop())
          .catch(err => {
            std.logError(RssDownloadItemsDialog.displayName, err.name, err.message);
            this.setState({ isNotValid: true });
            this.spn.stop();
          });
      } else {
        this.spn.start();
        std.logInfo(RssDownloadItemsDialog.displayName, 'handleDownload', { user, ids, filter, name });
        NoteAction.downloadItems(user, category, ids, filter, name)
          .then(() => this.setState({ isSuccess: true }))
          .then(() => this.downloadFile(this.props.file, { type: 'text/csv' }))
          .then(() => this.spn.stop())
          .catch(err => {
            std.logError(RssDownloadItemsDialog.displayName, err.name, err.message);
            this.setState({ isNotValid: true });
            this.spn.stop();
          });
      }
    }
  }

  downloadLink(link, mime) {
    std.logInfo(RssDownloadItemsDialog.displayName, 'downloadLink', link);
    const isCSV = mime.type === 'text/csv';
    const anchor = document.createElement('a');
    anchor.href = link;
    anchor.target = '_blank';
    anchor.download = isCSV ? 'download.csv' : 'download.zip';
    anchor.click();
  }

  downloadFile(blob, mime) {
    std.logInfo(RssDownloadItemsDialog.displayName, 'downloadFile', blob);
    const isCSV = mime.type === 'text/csv';
    const anchor = document.createElement('a');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const fileReader = new FileReader();
    fileReader.onload = function() {
      const url = isCSV ? URL.createObjectURL(new Blob([bom, this.result], mime)) : URL.createObjectURL(new Blob([this.result], mime));
      anchor.href = url;
      anchor.target = '_blank';
      anchor.download = isCSV ? 'download.csv' : 'download.zip';
      anchor.click();
      URL.revokeObjectURL(url);
    }
    fileReader.readAsArrayBuffer(blob);
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
    const { isNotValid, isSuccess, name } = this.state;
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
          <RssButton color="success" onClick={this.handleDownload.bind(this)} classes={classes.button}>ダウンロード</RssButton>
          <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleClose.bind(this, 'isNotValid')}>
            内容に不備があります。もう一度確認してください。
          </RssDialog>
          <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleClose.bind(this, 'isSuccess')}>
            要求を受け付けました。
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
, itemNumber: PropTypes.number.isRequired
, name: PropTypes.string.isRequired
, open: PropTypes.bool.isRequired
, file: PropTypes.object
, signedlink: PropTypes.string
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
