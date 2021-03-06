import loadable                   from '@loadable/component';
import React                from 'react';
import PropTypes            from 'prop-types';
import UserAction           from 'Actions/UserAction';
import std                  from 'Utilities/stdutils';
import Spinner              from 'Utilities/Spinner';

import { withStyles }       from '@material-ui/core/styles';
import { Button, Checkbox } from '@material-ui/core';
const RssDialog = loadable(() => import('Components/RssDialog/RssDialog'));

class AdminButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false
    , isSuccess: false
    , isNotValid: false
    };
  }

  componentDidMount() {
    this.spn = Spinner.of('app');
    UserAction.select(this.props.admin, []);
  }

  componentWillUnmount() {
    this.spn.stop();
  }

  handleChangeCheckbox(event) {
    const checked = event.target.checked;
    this.setState({ checked });
    const { admin, users } = this.props;
    const ids = checked ? users.map(user => user._id) : [];
    std.logInfo(AdminButtons.displayName, 'handleChangeCheckbox', ids);
    UserAction.select(admin, ids);
  }

  handleSendmail() {
    const { admin, selectedUserId } = this.props;
    if(window.confirm('Are you sure?')) {
      this.spn.start();
      std.logInfo(AdminButtons.displayName, 'handleSendmail', selectedUserId);
      UserAction.sendmail(admin, selectedUserId)
        .then(() => this.setState({ isSuccess: true }))
        .then(() => this.spn.stop())
        .catch(err => {
          std.logError(AdminButtons.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
          this.spn.stop();
        });
    }
  }

  handleApproval() {
    const { admin, selectedUserId } = this.props;
    if(window.confirm('Are you sure?')) {
      this.spn.start();
      std.logInfo(AdminButtons.displayName, 'handleApproval', selectedUserId);
      UserAction.createApproval(admin, selectedUserId)
        .then(() => this.setState({ isSuccess: true }))
        .then(() => this.spn.stop())
        .catch(err => {
          std.logError(AdminButtons.displayName, err.name, err.message);
          this.setState({ isNotValid: true })
          this.spn.stop();
        });
    }
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  render() {
    const { classes } = this.props;
    const { checked, isNotValid, isSuccess } = this.state;
    return <div className={classes.userButtons}>
      <Checkbox checked={checked} className={classes.checkbox} onChange={this.handleChangeCheckbox.bind(this)} tabIndex={-1} 
        disableRipple />
      <div className={classes.buttons}>
        <Button variant="contained" className={classes.button} onClick={this.handleSendmail.bind(this)}>メール配信</Button>
        <Button variant="contained" className={classes.button} onClick={this.handleApproval.bind(this)}>開始承認</Button>
        <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
          内容に不備があります。もう一度確認してください。
        </RssDialog>
        <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
          要求を受け付けました。
        </RssDialog>
      </div>
    </div>;
  }
}
AdminButtons.displayName = 'AdminButtons';
AdminButtons.defaultProps = {};
AdminButtons.propTypes = {
  classes: PropTypes.object.isRequired
, admin: PropTypes.string.isRequired
, users: PropTypes.array.isRequired
, selectedUserId: PropTypes.array.isRequired
};

const titleHeight   = 62;
const checkboxWidth = 38;
const styles = theme => ({
  userButtons:  { display: 'flex', flexDirection: 'row'
                , alignItems: 'stretch', justifyContent: 'flex-start' 
                , height: titleHeight, minHeight: titleHeight
                , boxSizing: 'border-box'
                , padding: '5px' }
, checkbox:     { flex: 0, minWidth: checkboxWidth }
, buttons:      { flex: 0, display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, margin: theme.spacing.unit
                , wordBreak: 'keep-all' }
});
export default withStyles(styles)(AdminButtons);
