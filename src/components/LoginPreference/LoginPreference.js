import React            from 'react';
import PropTypes        from 'prop-types';
import * as R           from 'ramda';
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import { Typography, TextField, MenuItem }
                        from '@material-ui/core';
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

  handleClose(name) {
    this.setState({ [name]: false });
  }

  handleChangeSelect(name, event) {
    std.logInfo(LoginPreference.displayName, 'handleChangeSelect', name);
    const { profile } = this.state;
    if(name === 'plan') {
      this.setState({ 
        profile:  R.merge(profile, { [name]: event.target.value  })
      , [name]:   event.target.value
      });
    }
  }

  handleCloseDialog(name, event) {
    this.props.onClose(name, event);
  }

  handleSubmitDialog(name) {
    std.logInfo(LoginPreference.displayName, 'handleSubmitDialog', name);
    const { user } = this.props;
    const { profile } = this.state;
    if(name === 'isPreference') {
      if(this.isValidate() && this.isChanged()) {
        LoginAction.updateProfile(user, null, profile)
          .then(() => this.setState({ isSuccess: true }))
          .catch(err => {
            std.logError(LoginPreference.displayName, err.name, err.message);
            this.setState({ isNotValid: true });
          });
      } else {
        this.setState({ isNotValid: true });
      }
    }
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
    return <MenuItem key={idx} value={obj.id}>{obj.name}（上限数：{obj.number}）</MenuItem>;
  }

  render() {
    //std.logInfo(LoginPreference.displayName, 'Props', this.props);
    //std.logInfo(LoginPreference.displayName, 'State', this.state);
    const { classes, name, user, preference, open } = this.props;
    const { isNotValid, isSuccess, plan } = this.state;
    const renderMenu = preference.menu ? preference.menu.map((obj, idx) => this.renderMenu(obj, idx)) : [];
    return <LoginFormDialog isSubmit open={open} title={'契約内容変更'} onClose={this.handleCloseDialog.bind(this, 'isPreference')}
          onSubmit={this.handleSubmitDialog.bind(this, 'isPreference')}>
        <Typography variant="h6" noWrap className={classes.title}>{name}（{user}）</Typography>
        <TextField select autoFocus margin="dense" value={plan} onChange={this.handleChangeSelect.bind(this, 'plan')}
          label="契約プラン" fullWidth>
          {renderMenu}
        </TextField>
        <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleClose.bind(this, 'isNotValid')}>
          内容に不備があります。もう一度確認してください。
        </RssDialog>
        <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleClose.bind(this, 'isSuccess')}>
          要求を受け付けました。
        </RssDialog>
      </LoginFormDialog>;
  }
}
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
  classes: PropTypes.object.isRequired
, onClose: PropTypes.func.isRequired
, name: PropTypes.string.isRequired
, user: PropTypes.string.isRequired
, plan: PropTypes.string.isRequired
, profile: PropTypes.object.isRequired
, preference: PropTypes.object.isRequired
, open: PropTypes.bool.isRequired
};

const styles = {};
export default withStyles(styles)(LoginPreference);
