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

class RssDownloadDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSuccess:  false
    , isNotValid: false
    , name: props.name
    };
  }

  handleClose(name) {
    this.setState({ [name]: false });
  }

  handleChangeSelect(name, event) {
    std.logInfo(RssDownloadDialog.displayName, 'handleChangeSelect', name);
    this.setState({ [name]: event.target.value });
  }

  handleCloseDialog(name, event) {
    this.props.onClose(name, event);
  }

  handleDownload() {
    const { user, category } = this.props;
    const { name } = this.state;
    const spn = Spinner.of('app');
    spn.start();
    std.logInfo(RssDownloadDialog.displayName, 'handleDownload', user);
    NoteAction.download(user, category, name)
      .then(() => this.downloadFile(this.props.file))
      .then(() => this.setState({ isSuccess: true }))
      .then(() => spn.stop())
      .catch(err => {
        std.logError(RssDownloadDialog.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        spn.stop();
      });
  }

  downloadFile(blob) {
    std.logInfo(RssDownloadDialog.displayName, 'downloadFile', blob);
    const anchor = document.createElement('a');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const fileReader = new FileReader();
    fileReader.onload = function() {
      const url = URL.createObjectURL(new Blob([bom, this.result], { type: 'text/csv' }));
      anchor.href = url;
      anchor.target = '_blank';
      anchor.download = 'download.csv';
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
    //std.logInfo(RssDownloadDialog.displayName, 'Props', this.props);
    //std.logInfo(RssDownloadDialog.displayName, 'State', this.state);
    const { classes, title, open } = this.props;
    const { isNotValid, isSuccess, name } = this.state;
    const formats = [
      { id: '0001', name: 'CSV', type: 'text/csv' }
    ];
    const renderMenu = formats ? formats.map((obj, idx) => this.renderMenu(obj, idx)) : [];
    return <LoginFormDialog open={open} title={'ダウンロード'} onClose={this.handleCloseDialog.bind(this, 'isDownload')} >
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
      </LoginFormDialog>;
  }
}
RssDownloadDialog.displayName = 'RssDownloadDialog';
RssDownloadDialog.defaultProps = {
  title: ''
, user: ''
, name: ''
, open: false
};
RssDownloadDialog.propTypes = {
  classes: PropTypes.object.isRequired
, onClose: PropTypes.func.isRequired
, title: PropTypes.string.isRequired
, user: PropTypes.string.isRequired
, category: PropTypes.string.isRequired
, name: PropTypes.string.isRequired
, open: PropTypes.bool.isRequired
, file: PropTypes.object
};

const buttonWidth = 88;
const styles = theme => ({
  input:   { display: 'none' }
, buttons: { flex: 0, display: 'flex', flexDirection: 'row' }
, button:  { flex: 1, width: buttonWidth, margin: theme.spacing.unit /2, textAlign: 'center', wordBreak: 'keep-all', padding: 4 }
});
export default withStyles(styles)(RssDownloadDialog);
