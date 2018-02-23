import React      from 'react';
import PropTypes  from 'prop-types';
import { Button, Dialog, TextField }
                  from 'material-ui';
import { DialogActions, DialogContent, DialogContentText, DialogTitle
, withMobileDialog }
                  from 'material-ui/Dialog';
import { Slide }  from 'material-ui/transitions';

const Transition =  props => <Slide direction="up" {...props} />;

class RssFormDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { title: props.note.title }
  }

  handleClose() {
    this.props.onClose();
  }

  handleSubmit() {
    const { title } = this.state;
    this.logInfo('handleSubmit', title);
    const newNote = Object.assign({}, this.props.note, { title })
    this.props.onSubmit(newNote);
    this.props.onClose();
  }

  handleChangeText(name, event) {
    switch(name) {
      case 'title':
        this.setState({ title: event.target.value });
        break;
    }
  }

  logInfo(name, info) {
    console.info('>>> Info', name, info);
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
RssFormDialog.defaultProps = {
  note: null
};
RssFormDialog.propTypes = {
  fullScreen: PropTypes.bool.isRequired
};
export default withMobileDialog()(RssFormDialog);
