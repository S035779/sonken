import loadable                   from '@loadable/component';
import React                      from 'react';
import PropTypes                  from 'prop-types';
import NoteAction                 from 'Actions/NoteAction';
import std                        from 'Utilities/stdutils';
import Spinner                    from 'Utilities/Spinner';

import { withStyles }             from '@material-ui/core/styles';
import { FormControl, TextField } from '@material-ui/core';
const RssDialog       = loadable(() => import('Components/RssDialog/RssDialog'));
const RssButton       = loadable(() => import('Components/RssButton/RssButton'));
const LoginFormDialog = loadable(() => import('Components/LoginFormDialog/LoginFormDialog'));

class RssUploadDialog extends React.Component {
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
    std.logInfo(RssUploadDialog.displayName, 'handleChangeText', name);
    this.setState({ [name]: event.target.value });
  }

  handleCloseDialog(name, event) {
    this.props.onClose(name, event);
  }

  handleChangeFile(event) {
    const { user, category } = this.props;
    const { name } = this.state;
    const file = event.target.files.item(0);
    const spn = Spinner.of('app');
    spn.start();
    std.logInfo(RssUploadDialog.displayName, 'handleChangeFile', file.type + ";" + file.name);
    NoteAction.upload(user, category, file, name)
      //.then(() => NoteAction.fetchCategorys(user, category, 0, perPage))
      .then(() => this.setState({ isSuccess: true }))
      .then(() => spn.stop())
      .catch(err => {
        std.logError(RssUploadDialog.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        spn.stop();
      })
    ;
  }

  isValidate() {
    const { name } = this.state;
    return (name !== '');
  }

  render() {
    //std.logInfo(RssUploadDialog.displayName, 'Props', this.props);
    //std.logInfo(RssUploadDialog.displayName, 'State', this.state);
    const { classes, title, open } = this.props;
    const { isNotValid, isSuccess, name } = this.state;
    return <LoginFormDialog open={open} title={'アップロード'} onClose={this.handleCloseDialog.bind(this, 'isUpload')} >
        <div className={classes.dialog}>
        <FormControl component="fieldset" className={classes.column}>
          <TextField autoFocus margin="dense" value={name} onChange={this.handleChangeText.bind(this, 'name')}
            label={title} type="text" fullWidth />
        </FormControl>
        <div className={classes.buttons}>
          <label htmlFor="file" className={classes.uplabel}>
            <RssButton color="success" component="span" classes={classes.button}>アップロード</RssButton>
          </label>
          <input type="file" id="file" accept=".csv,.opml,text/csv,text/opml" onChange={this.handleChangeFile.bind(this)}
            className={classes.input}/>
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
RssUploadDialog.displayName = 'RssUploadDialog';
RssUploadDialog.defaultProps = {
  title: ''
, user: ''
, name: ''
, open: false
};
RssUploadDialog.propTypes = {
  classes: PropTypes.object.isRequired
, onClose: PropTypes.func.isRequired
, title: PropTypes.string.isRequired
, user: PropTypes.string.isRequired
, category: PropTypes.string.isRequired
, name: PropTypes.string.isRequired
, open: PropTypes.bool.isRequired
, perPage: PropTypes.number.isRequired
};

const columnHeight = 62;
const styles = theme => ({
  input:    { display: 'none' }
, dialog:   { display: 'flex', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'flex-start'
            , height: columnHeight, minHeight: columnHeight, boxSizeing: 'border-box', padding: 5 }
, buttons:  { flex: 0, display: 'flex', flexDirection: 'row' }
, button:   { flex: 1, margin: theme.spacing.unit, wordBreak: 'keep-all' }
});
export default withStyles(styles)(RssUploadDialog);
