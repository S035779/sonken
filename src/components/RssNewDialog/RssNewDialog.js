import React            from 'react';
import PropTypes        from 'prop-types'
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { TextField }    from 'material-ui';
import { FormLabel, FormControl, FormHelperText }
                        from 'material-ui/Form';
import RssDialog        from 'Components/RssDialog/RssDialog';
import LoginFormDialog  from 'Components/LoginFormDialog/LoginFormDialog';

class RssNewDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSuccess:  false
    , isNotValid: false
    , title:      props.title
    };
  }

  handleClose(name, event) {
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
      const { title } = this.state;
      this.props.onSubmit(title);
      this.props.onClose();
    } else {
      this.setState({ isNotValid: true });
    }
  }

  isValidate() {
    return true;
  }

  isChanged() {
    return true;
  }

  render() {
    //std.logInfo(RssNewDialog.displayName, 'Props', this.props);
    //std.logInfo(RssNewDialog.displayName, 'State', this.state);
    const { classes, open, category } = this.props;
    const { isNotValid, isSuccess, title } = this.state;
    const name = category === 'marchant'
      ? '商品RSS' : category === 'sellers' ? '出品者RSS' : null;
    const paperClass = { paper: classes.dialog };
    return <LoginFormDialog 
        open={open} 
        title={'カテゴリー編集'}
        onClose={this.handleCloseDialog.bind(this)}
        onSubmit={this.handleSubmitDialog.bind(this)}
        isSubmit classes={paperClass}
        className={classes.fieldset}>
        <FormControl component="fieldset" className={classes.column}>
          <TextField autoFocus margin="dense"
            value={title}
            onChange={this.handleChangeText.bind(this, 'title')}
            label={name + 'カテゴリー'} type="text" fullWidth />
        </FormControl>
        <RssDialog open={isNotValid} title={'送信エラー'}
          onClose={this.handleClose.bind(this, 'isNotValid')}>
          内容に不備があります。もう一度確認してください。
        </RssDialog>
        <RssDialog open={isSuccess} title={'送信完了'}
          onClose={this.handleClose.bind(this, 'isSuccess')}>
          要求を受け付けました。
        </RssDialog>
      </LoginFormDialog>
    ;
  }
};
const styles = theme => ({
  fieldset:   { display: 'flex', flexDirection: 'column' }
, dialog:     { width: 256 }
, column:     { flex: 1, width: '100%', marginTop: theme.spacing.unit *2 }
});
RssNewDialog.displayName = 'RssNewDialog';
RssNewDialog.defaultProps = {
  open: false
};
RssNewDialog.propTypes = {
  classes:  PropTypes.object.isRequired
, onClose:  PropTypes.func.isRequired
, onSubmit: PropTypes.func.isRequired
, open:     PropTypes.bool.isRequired
};
export default withStyles(styles)(RssNewDialog);
