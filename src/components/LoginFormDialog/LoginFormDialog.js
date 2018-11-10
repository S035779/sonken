import React      from 'react';
import PropTypes  from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, withMobileDialog, Slide } from '@material-ui/core';

const Transition =  props => <Slide direction="up" {...props} />;

class LoginFormDialog extends React.Component {
  handleClose() {
    this.props.onClose();
  }

  handleSubmit() {
    this.props.onSubmit();
  }

  renderSubmitButton() {
    return <Button onClick={this.handleSubmit.bind(this)} color="primary">設定</Button>;
  }

  render() {
    const { open, fullScreen, children, title, isSubmit, classes } = this.props;
    const renderSubmitButton = isSubmit ? this.renderSubmitButton() : null;
    return <Dialog fullScreen={fullScreen} TransitionComponent={Transition} open={open} onClose={this.handleClose.bind(this)}
      classes={classes} aria-labelledby="responsive-dialog-title">
      <DialogTitle id="responsive-dialog-title">{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={this.handleClose.bind(this)} color="primary">戻る</Button>
        {renderSubmitButton}
      </DialogActions>
    </Dialog>;
  }
}
LoginFormDialog.displayName = 'LoginFormDialog';
LoginFormDialog.defaultProps = {};
LoginFormDialog.propTypes = {
  fullScreen: PropTypes.bool.isRequired
, onClose: PropTypes.func.isRequired
, onSubmit: PropTypes.func
, open: PropTypes.bool.isRequired
, children: PropTypes.node.isRequired
, title: PropTypes.string.isRequired
, isSubmit: PropTypes.bool
, classes: PropTypes.object
};
export default withMobileDialog()(LoginFormDialog);
