import React      from 'react';
import PropTypes  from 'prop-types';
import { Button, Dialog, TextField }
                  from 'material-ui';
import { DialogActions, DialogContent, DialogTitle, withMobileDialog }
                  from 'material-ui/Dialog';
import { Slide }  from 'material-ui/transitions';

const Transition =  props => <Slide direction="up" {...props} />;

class LoginFormDialog extends React.Component {
  handleClose() {
    this.props.onClose();
  }

  handleSubmit() {
    this.props.onSubmit();
  }

  renderSubmitButton() {
    return <Button
        onClick={this.handleSubmit.bind(this)}
        color="primary">
        設定
      </Button>
    ;
  }

  render() {
    const { open, fullScreen, children, title, isSubmit, classes }
      = this.props;
    const renderSubmitButton
      = isSubmit ? this.renderSubmitButton() : null;
    return <Dialog
      fullScreen={fullScreen}
      transitionComponent={Transition}
      open={open}
      onClose={this.handleClose.bind(this)}
      classes={classes}
      aria-labelledby="responsive-dialog-title">
      <DialogTitle id="responsive-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={this.handleClose.bind(this)} color="primary">
        戻る
        </Button>
        {renderSubmitButton}
      </DialogActions>
    </Dialog>;
  }
}
LoginFormDialog.displayName = 'LoginFormDialog';
LoginFormDialog.defaultProps = {};
LoginFormDialog.propTypes = {
  fullScreen: PropTypes.bool.isRequired
};
export default withMobileDialog()(LoginFormDialog);
