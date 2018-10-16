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

class RssFileDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSuccess:  false
    , isNotValid: false
    , name: props.name
    , perPage: props.perPage
    };
  }

  handleClose(name) {
    this.setState({ [name]: false });
  }

  handleChangeText(name, event) {
    std.logInfo(RssFileDialog.displayName, 'handleChangeText', name);
    this.setState({ [name]: event.target.value });
  }

  handleChangeSelect(name, event) {
    std.logInfo(RssFileDialog.displayName, 'handleChangeSelect', name);
    this.setState({ [name]: event.target.value });
  }

  handleCloseDialog(name, event) {
    this.props.onClose(name, event);
  }

  handleChangeFile(event) {
    const { user, category } = this.props;
    const { perPage, name } = this.state;
    const file = event.target.files.item(0);
    const spn = Spinner.of('app');
    spn.start();
    std.logInfo(RssFileDialog.displayName, 'handleChangeFile', file.type + ";" + file.name);
    NoteAction.upload(user, category, file, name)
      .then(() => NoteAction.fetchCategorys(user, category, 0, perPage))
      .then(() => this.setState({ isSuccess: true }))
      .then(() => spn.stop())
      .catch(err => {
        std.logError(RssFileDialog.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        spn.stop();
      })
    ;
  }

  handleDownload() {
    const { user, category } = this.props;
    const spn = Spinner.of('app');
    spn.start();
    std.logInfo(RssFileDialog.displayName, 'handleDownload', user);
    NoteAction.download(user, category)
      .then(() => this.downloadFile(this.props.file))
      .then(() => this.setState({ isSuccess: true }))
      .then(() => spn.stop())
      .catch(err => {
        std.logError(RssFileDialog.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        spn.stop();
      });
  }

  downloadFile(blob) {
    std.logInfo(RssFileDialog.displayName, 'downloadFile', blob);
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
    return <MenuItem key={idx} value={obj.id}>{obj.name}（フォーマット：{obj.type}）</MenuItem>;
  }

  isValidate() {
    const { name } = this.state;
    return (name !== '');
  }

  render() {
    //std.logInfo(RssFileDialog.displayName, 'Props', this.props);
    //std.logInfo(RssFileDialog.displayName, 'State', this.state);
    const { classes, title, open, isdownload, isupload } = this.props;
    const { isNotValid, isSuccess, name } = this.state;
    const formats = [
      { id: '0001', name: 'CSV-1', type: 'text/csv' }
    , { id: '0002', name: 'CSV-2', type: 'text/csv' }
    , { id: '0003', name: 'CSV-3', type: 'text/csv' }
    , { id: '0004', name: 'OPML',  type: 'application/opml' }
    ];
    const renderMenu = formats ? formats.map((obj, idx) => this.renderMenu(obj, idx)) : [];
    return <LoginFormDialog open={open} title={isdownload ? 'ダウンロード' : 'アップロード'}
        onClose={this.handleCloseDialog.bind(this, isdownload ? 'isDownload' : 'isUpload')} >
        { isupload
          ? ( <FormControl component="fieldset" className={classes.column}>
              <TextField autoFocus margin="dense" value={name} onChange={this.handleChangeText.bind(this, 'name')}
                label={title} type="text" fullWidth />
            </FormControl> )
          : ( <FormControl component="fieldset" className={classes.column}>
              <TextField select autoFocus margin="dense" value={name} onChange={this.handleChangeSelect.bind(this, 'name')}
                label="title" fullWidth>
                {renderMenu}
              </TextField>
            </FormControl> ) }
        { isupload
          ? ( <label htmlFor="file" className={classes.uplabel}>
              <RssButton color="success" component="span" classes={classes.button}>アップロード</RssButton>
            </label> )
          : ( <label className={classes.uplabel}>
              <RssButton color="success" component="span" classes={classes.button}>ダウンロード</RssButton>
            </label> ) }
        <input type="file" id="file" accept=".csv,.opml,text/csv,text/opml" onChange={this.handleChangeFile.bind(this)}
          className={classes.input}/>
        <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleClose.bind(this, 'isNotValid')}>
          内容に不備があります。もう一度確認してください。
        </RssDialog>
        <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleClose.bind(this, 'isSuccess')}>
          要求を受け付けました。
        </RssDialog>
      </LoginFormDialog>;
  }
}
RssFileDialog.displayName = 'RssFileDialog';
RssFileDialog.defaultProps = {
  title: ''
, user: ''
, name: ''
, open: false
};
RssFileDialog.propTypes = {
  classes: PropTypes.object.isRequired
, onClose: PropTypes.func.isRequired
, title: PropTypes.string.isRequired
, user: PropTypes.string.isRequired
, category: PropTypes.string.isRequired
, name: PropTypes.string.isRequired
, open: PropTypes.bool.isRequired
, perPage: PropTypes.number.isRequired
, isdownload: PropTypes.bool.isRequired
, isupload: PropTypes.bool.isRequired
, file: PropTypes.object
};

const styles = {
  input:      { display: 'none' }
};
export default withStyles(styles)(RssFileDialog);
