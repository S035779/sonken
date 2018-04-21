import React            from 'react';
import PropTypes        from 'prop-types';
import NoteAction       from 'Actions/NoteAction';
import std              from 'Utilities/stdutils';
import Spinner          from 'Utilities/Spinner';

import { withStyles }   from 'material-ui/styles';
import { Button, Checkbox }
                        from 'material-ui';
import RssDialog        from 'Components/RssDialog/RssDialog';

class RssButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false
    , isSuccess: false
    , isNotValid: false
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

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  render() {
    const { classes } = this.props;
    const { isSuccess, isNotValid, checked } = this.state;
    return <div className={classes.noteButtons}>
      <Checkbox checked={checked}
        className={classes.checkbox}
        onChange={this.handleChangeCheckbox.bind(this)}
        tabIndex={-1} disableRipple />
      <div className={classes.buttons}>
        <Button variant="raised"
          className={classes.button}
          onClick={this.handleReaded.bind(this)}>既読にする</Button>
        <Button variant="raised"
          className={classes.button}
          onClick={this.handleDelete.bind(this)}>削除</Button>
        <RssDialog open={isSuccess} title={'送信完了'}
          onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
          要求を受け付けました。
        </RssDialog>
        <RssDialog open={isNotValid} title={'送信エラー'}
          onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
          内容に不備があります。もう一度確認してください。
        </RssDialog>
      </div>
    </div>;
  }
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
RssButtons.displayName = 'RssButtons';
RssButtons.defaultProps = {};
RssButtons.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssButtons);
