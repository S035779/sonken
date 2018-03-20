import React          from 'react';
import PropTypes      from 'prop-types';
import std            from 'Utilities/stdutils';

import { Button, Dialog, TextField }
                      from 'material-ui';
import { DialogActions, DialogContent, DialogContentText, DialogTitle
, withMobileDialog }  from 'material-ui/Dialog';
import { Slide }      from 'material-ui/transitions';

const Transition =  props => <Slide direction="up" {...props} />;

class RssFormDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
       title: props.title
    }
  }

  handleClose() {
    this.props.onClose();
  }

  handleSubmit() {
    const { title } = this.state;
    const { selectedNoteId } = this.props;
    std.logInfo(RssFormDialog.displayName, 'handleSubmit', selectedNoteId);
    this.props.onSubmit(selectedNoteId, title);
  }

  handleChangeText(name, event) {
    this.setState({ [name]: event.target.value });
  }

  render() {
    const { open, fullScreen, children, title } = this.props;
    return <Dialog fullScreen={fullScreen}
      transition={Transition} open={open}
      onClose={this.handleClose.bind(this)}
      aria-labelledby="responsive-dialog-title">
      <DialogTitle id="responsive-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{children}</DialogContentText>
        <TextField autoFocus margin="dense" id="title"
          value={this.state.title}
          onChange={this.handleChangeText.bind(this, 'title')}
          label="入力" type="text" fullWidth />
      </DialogContent>
      <DialogActions>
        <Button onClick={this.handleClose.bind(this)} color="primary">
        キャンセル
        </Button>
        <Button onClick={this.handleSubmit.bind(this)} color="primary">
        編集する
        </Button>
      </DialogActions>
    </Dialog>;
  }
}

RssFormDialog.displayName = 'RssFormDialog';
RssFormDialog.defaultProps = {  };
RssFormDialog.propTypes = {
  fullScreen: PropTypes.bool.isRequired
};
export default withMobileDialog()(RssFormDialog);
