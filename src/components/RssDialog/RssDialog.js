import React      from 'react';
import PropTypes  from 'prop-types';
import { Button, Dialog, TextField }
                  from 'material-ui';
import { DialogActions, DialogContent, DialogContentText, DialogTitle
, withMobileDialog }
                  from 'material-ui/Dialog';
import { Slide }  from 'material-ui/transitions';

const Transition =  props => <Slide direction="up" {...props} />;

class RssDialog extends React.Component {
  handleClose() {
    this.props.onClose();
  }

  render() {
    const { open, fullScreen, children, title } = this.props;
    return <Dialog
      fullScreen={fullScreen}
      TransitionComponent={Transition}
      open={open}
      onClose={this.handleClose.bind(this)}
      aria-labelledby="responsive-dialog-title">
      <DialogTitle id="responsive-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{children}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={this.handleClose.bind(this)} color="primary">
          戻る
        </Button>
      </DialogActions>
    </Dialog>;
  }
}
RssDialog.displayName = 'RssDialog';
RssDialog.defaultProps = {};
RssDialog.propTypes = {
  fullScreen: PropTypes.bool.isRequired
};
export default withMobileDialog()(RssDialog);
