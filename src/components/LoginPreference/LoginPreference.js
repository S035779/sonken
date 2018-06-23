import React            from 'react';
import PropTypes        from 'prop-types'
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { Typography, TextField, MenuItem }
                        from 'material-ui';
import { DialogContentText }
                        from 'material-ui/Dialog';
import RssDialog        from 'Components/RssDialog/RssDialog';
import LoginFormDialog  from 'Components/LoginFormDialog/LoginFormDialog';

class LoginPreference extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSuccess:  false
    , isNotValid: false
    , profile:    props.profile
    , plan:       props.plan
    };
  }

  handleClose(name, event) {
    this.setState({ [name]: false });
  }

  handleChangeSelect(name, event) {
    std.logInfo(LoginPreference.displayName, 'handleChangeSelect', name);
    const { profile } = this.state;
    switch(name) {
      default:
        this.setState({
          profile: Object.assign({}
          , profile, { [name]: event.target.value  })
        , [name]: event.target.value 
        });
        break;
    }
  }

  handleCloseDialog(name, event) {
    this.props.onClose(name, event);
  }

  handleSubmitDialog(name, event) {
    std.logInfo(LoginPreference.displayName, 'handleSubmitDialog', name);
    const { user } = this.props;
    const { profile, password } = this.state;
    switch(name) {
      case 'isPreference':
        if(this.isValidate() && this.isChanged()) {
          LoginAction.updateProfile(user, null, profile)
            .then(() => this.setState({ isSuccess: true }))
            .catch(err => this.setState({ isNotValid: true }));
        } else {
          this.setState({ isNotValid: true });
        }
        break;
    }
    this.setState({ [name]: false });
  }

  isValidate() {
    const { plan } = this.state;
    return (plan !== '');
  }

  isChanged() {
    const { plan } = this.state;
    const { profile } = this.props;
    return (profile.plan !== plan);
  }

  renderMenu(obj, idx) {
    return <MenuItem key={idx} value={obj.name}>
      {obj.name}（上限数：{obj.number}）
    </MenuItem>;
  }

  render() {
    //std.logInfo(LoginPreference.displayName, 'Props', this.props);
    //std.logInfo(LoginPreference.displayName, 'State', this.state);
    const { classes, name, user, preference, open } = this.props;
    const { isNotValid, isSuccess, plan } = this.state;
    const renderMenu = preference.menu ? preference.menu
      .map((obj, idx) => this.renderMenu(obj, idx)) : [];
    return <LoginFormDialog isSubmit open={open} title={'契約内容変更'}
        onClose={this.handleCloseDialog.bind(this, 'isPreference')}
        onSubmit={this.handleSubmitDialog.bind(this, 'isPreference')}>
        <Typography variant="title" noWrap
          className={classes.title}>{name}（{user}）</Typography>
        <TextField select autoFocus margin="dense"
          value={plan}
          onChange={this.handleChangeSelect.bind(this, 'plan')}
          label="契約プラン" fullWidth>
          {renderMenu}
        </TextField>
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
});
LoginPreference.displayName = 'LoginPreference';
LoginPreference.defaultProps = {
  name: ''
, user: ''
, plan: ''
, profile: null
, preference: null
, open: false
};
LoginPreference.propTypes = {
  classes:            PropTypes.object.isRequired
, onClose:            PropTypes.func.isRequired
, name:               PropTypes.string.isRequired
, user:               PropTypes.string.isRequired
, plan:               PropTypes.string.isRequired
, profile:            PropTypes.object.isRequired
, preference:         PropTypes.object.isRequired
, open:               PropTypes.bool.isRequired
};
export default withStyles(styles)(LoginPreference);
