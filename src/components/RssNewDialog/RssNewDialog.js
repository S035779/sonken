import loadable         from '@loadable/component';
import React            from 'react';
import PropTypes        from 'prop-types'
import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import { TextField, FormControl } from '@material-ui/core';
const RssDialog       = loadable(() => import('Components/RssDialog/RssDialog'));
const LoginFormDialog = loadable(() => import('Components/LoginFormDialog/LoginFormDialog'));

class RssNewDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSuccess:  false
    , isNotValid: false
    , name:      props.name
    };
  }

  handleClose(name) {
    this.setState({ [name]: false });
  }

  handleChangeText(name, event) {
    std.logInfo(RssNewDialog.displayName, 'handleChangeText', name);
    this.setState({ [name]: event.target.value });
  }

  handleCloseDialog() {
    this.props.onClose();
  }

  handleSubmitDialog() {
    if(this.isValidate() && this.isChanged()) {
      const { name } = this.state;
      this.props.onSubmit(name);
      this.setState({ name: 'Untitled' })
      this.props.onClose();
    } else {
      this.setState({ isNotValid: true });
    }
  }

  isValidate() {
    const { name } = this.state;
    return name !=='';
  }

  isChanged() {
    const { name } = this.state;
    return this.props.name !== name;
  }

  render() {
    //std.logInfo(RssNewDialog.displayName, 'Props', this.props);
    //std.logInfo(RssNewDialog.displayName, 'State', this.state);
    const { classes, open, title } = this.props;
    const { isNotValid, isSuccess, name } = this.state;
    const paperClass = { paper: classes.dialog };
    return <LoginFormDialog open={open} title={'カテゴリー編集'}
        onClose={this.handleCloseDialog.bind(this)} onSubmit={this.handleSubmitDialog.bind(this)}
        isSubmit classes={paperClass} className={classes.fieldset}>
        <FormControl component="fieldset" className={classes.column}>
          <TextField autoFocus margin="dense" value={name} onChange={this.handleChangeText.bind(this, 'name')}
            label={title + 'カテゴリー'} type="text" fullWidth />
        </FormControl>
        <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleClose.bind(this, 'isNotValid')}>
          内容に不備があります。もう一度確認してください。</RssDialog>
        <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleClose.bind(this, 'isSuccess')}>
          要求を受け付けました。</RssDialog>
      </LoginFormDialog>
    ;
  }
}
RssNewDialog.displayName = 'RssNewDialog';
RssNewDialog.defaultProps = { open: false };
RssNewDialog.propTypes = {
  classes:  PropTypes.object.isRequired
, open: PropTypes.bool.isRequired
, name: PropTypes.string.isRequired
, title: PropTypes.string.isRequired
, onClose: PropTypes.func.isRequired
, onSubmit: PropTypes.func.isRequired
};

const styles = theme => ({
  fieldset:   { display: 'flex', flexDirection: 'column' }
, dialog:     { width: 256 }
, column:     { flex: 1, width: '100%', marginTop: theme.spacing.unit *2 }
});
export default withStyles(styles)(RssNewDialog);
