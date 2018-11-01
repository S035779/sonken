import React                  from 'react';
import PropTypes              from 'prop-types';
import NoteAction             from 'Actions/NoteAction';
import std                    from 'Utilities/stdutils';
import Spinner                from 'Utilities/Spinner';

import { withStyles }         from '@material-ui/core/styles';
import { Button, Checkbox }   from '@material-ui/core';
import RssDialog              from 'Components/RssDialog/RssDialog';
import RssButton              from 'Components/RssButton/RssButton';
import RssDownloadItemsDialog from 'Components/RssDownloadItemsDialog/RssDownloadItemsDialog';

const isAlpha = process.env.NODE_ENV !== 'production';

class RssButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false
    , isSuccess: false
    , isNotValid: false
    , isDownload: false
    };
  }

  componentDidMount() {
    NoteAction.select(this.props.user, []);
  }

  handleChangeCheckbox(event) {
    const checked = event.target.checked;
    this.setState({ checked });

    const { user, notes } = this.props;
    const ids = checked ? notes.map(note => note._id) : [];
    std.logInfo(RssButtons.displayName, 'handleChangeCheckbox', ids);
    NoteAction.select(user, ids);
  }

  handleReaded() {
    const { user, selectedNoteId } = this.props;
    std.logInfo(RssButtons.displayName, 'handleReaded', selectedNoteId);
    NoteAction.createRead(user, selectedNoteId);
    this.setState({ checked: false });
  }

  handleDelete() {
    const { user, selectedNoteId } = this.props;
    std.logInfo(RssButtons.displayName, 'handleDelete', selectedNoteId);
    if(window.confirm('Are you sure?')) {
      const spn = Spinner.of('app');
      spn.start();
      NoteAction.delete(user, selectedNoteId)
        .then(()    => this.setState({ isSuccess: true }) )
        .then(()    => this.setState({ checked: false })  )
        .then(()    => spn.stop()                         )
        .catch(err  => {
          std.logError(RssButtons.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
          spn.stop();
        })
      ;
    }
  }

  //handleDownload() {
  //  const { user, selectedNoteId, itemFilter } = this.props;
  //  std.logInfo(RssButtons.displayName, 'handleDownload', user);
  //  const spn = Spinner.of('app');
  //  if(selectedNoteId.length) {
  //    spn.start();
  //    NoteAction.downloadItems(user, selectedNoteId, itemFilter)
  //      .then(() => this.setState({ isSuccess: true }))
  //      .then(() => this.downloadFile(this.props.file))
  //      .then(() => spn.stop())
  //      .catch(err => {
  //        std.logError(RssButtons.displayName, err.name, err.message);
  //        this.setState({ isNotValid: true });
  //        spn.stop();
  //      });
  //  }
  //}

  //downloadFile(blob) {
  //  std.logInfo(RssButtons.displayName, 'downloadFile', blob);
  //  const anchor = document.createElement('a');
  //  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  //  const fileReader = new FileReader();
  //  fileReader.onload = function() {
  //    const url = URL.createObjectURL(new Blob([bom, this.result], { type: 'text/csv' }));
  //    anchor.href = url;
  //    anchor.target = '_blank';
  //    anchor.download = 'download.csv';
  //    anchor.click();
  //    URL.revokeObjectURL(url);
  //  };
  //  fileReader.readAsArrayBuffer(blob);
  //}

  handleOpenDialog(name) {
    this.setState({ [name]: true });
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  getColor(category) {
    switch(category) {
      case 'marchant':
        return 'skyblue';
      case 'sellers':
        return 'orange';
      case 'closedmarchant':
        return 'green';
      case 'closedsellers':
        return 'yellow';
    }
  }

  render() {
    const { classes, category, user, notes, selectedNoteId, itemFilter, file } = this.props;
    const { isSuccess, isNotValid, isDownload, checked } = this.state;
    const color = this.getColor(category);
    const itemNumber = notes.length;
    return <div className={classes.noteButtons}>
      <Checkbox checked={checked} className={classes.checkbox} onChange={this.handleChangeCheckbox.bind(this)}
        tabIndex={-1} disableRipple />
      <div className={classes.buttons}>
        <Button variant="raised" className={classes.button} onClick={this.handleReaded.bind(this)}>既読にする</Button>
        <Button variant="raised" className={classes.button} onClick={this.handleDelete.bind(this)}>削除</Button>
      { isAlpha
        ? <RssButton color={color} className={classes.button} onClick={this.handleOpenDialog.bind(this, 'isDownload')}>
            ダウンロード
          </RssButton>
        : null }
        <RssDownloadItemsDialog open={isDownload} title={'フォーマット'} user={user} ids={selectedNoteId} itemNumber={itemNumber}
          filter={itemFilter} name="0001" file={file} onClose={this.handleCloseDialog.bind(this, 'isDownload')} />
        <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
          要求を受け付けました。
        </RssDialog>
        <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
          内容に不備があります。もう一度確認してください。
        </RssDialog>
      </div>
    </div>;
  }
}
RssButtons.displayName = 'RssButtons';
RssButtons.defaultProps = {};
RssButtons.propTypes = {
  classes: PropTypes.object.isRequired
, user: PropTypes.string.isRequired
, notes: PropTypes.array.isRequired
, selectedNoteId: PropTypes.array.isRequired
, file: PropTypes.object
, category: PropTypes.string.isRequired
, itemFilter: PropTypes.object.isRequired
};

const titleHeight   = 62;
const checkboxWidth = 38;
const styles = theme => ({
  noteButtons:  { display: 'flex', flexDirection: 'row'
                , alignItems: 'stretch', justifyContent: 'flex-start' 
                , height: titleHeight, minHeight: titleHeight
                , boxSizing: 'border-box'
                , padding: '5px' }
, checkbox:     { flex: 0, minWidth: checkboxWidth }
, buttons:      { flex: 0, display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, margin: theme.spacing.unit
                , wordBreak: 'keep-all' }
});
export default withStyles(styles)(RssButtons);
