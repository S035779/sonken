import React            from 'react';
import PropTypes        from 'prop-types'
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import { Typography, TextField }
                        from '@material-ui/core';
import RssDialog        from 'Components/RssDialog/RssDialog';
import LoginFormDialog  from 'Components/LoginFormDialog/LoginFormDialog';

class LoginProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSuccess:        false
    , isNotValid:       false
    , profile:          props.profile
    , name:             props.name
    , user:             props.user
    , kana:             props.kana
    , email:            props.email
    , phone:            props.phone
    , password:         ''
    , confirm_password: ''
    };
  }

  handleClose(name) {
    this.setState({ [name]: false });
  }

  handleChangeText(name, event) {
    std.logInfo(LoginProfile.displayName, 'handleChangeText', name);
    const { profile } = this.state;
    switch(name) {
      case 'password':
      case 'confirm_password':
        this.setState({ [name]: event.target.value });
        break;
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

  handleSubmitDialog(name) {
    std.logInfo(LoginProfile.displayName, 'handleSubmitDialog', name);
    const { profile, password } = this.state;
    const { user } = this.props;
    switch(name) {
      case 'isProfile':
        if(this.isValidate() && this.isChanged()) {
          LoginAction.updateProfile(user, password, profile)
            .then(() => this.setState({ isSuccess: true }))
            .catch(err => {
              std.logError(LoginProfile.displayName, err.name, err.message);
              this.setState({ isNotValid: true });
            });
        } else {
          this.setState({ isNotValid: true });
        }
        break;
    }
    this.setState({ [name]: false });
  }

  isValidate() {
    const { name, kana, email, phone, password, confirm_password }
      = this.state;
    return (password === confirm_password
      && password !== '' && name !== '' && kana !== ''
      && std.regexEmail(email) && std.regexNumber(phone)
    );
  }

  isChanged() {
    const { name, kana, email, phone, plan, password, confirm_password }
      = this.state;
    const { profile } = this.props;
    return (password === confirm_password
      || profile.name !== name
      || profile.kana !== kana
      || profile.email !== email
      || profile.phone !== phone
      || profile.plan !== plan
    );
  }

  render() {
    //std.logInfo(LoginProfile.displayName, 'Props', this.props);
    //std.logInfo(LoginProfile.displayName, 'State', this.state);
    const { classes, open } = this.props;
    const {
      isNotValid, isSuccess
    , name, user, kana, email, phone, password, confirm_password
    } = this.state;
    return <LoginFormDialog isSubmit open={open} title={'プロファイル'}
        onClose={this.handleCloseDialog.bind(this, 'isProfile')}
        onSubmit={this.handleSubmitDialog.bind(this, 'isProfile')}>
        <Typography variant="title" noWrap
          className={classes.title}>{name}（{user}）</Typography>
        <TextField autoFocus margin="dense"
          value={name}
          onChange={this.handleChangeText.bind(this, 'name')}
          label="氏名" type="text" fullWidth />
        <TextField margin="dense"
          value={kana}
          onChange={this.handleChangeText.bind(this, 'kana')}
          label="氏名（カナ）" type="text" fullWidth />
        <TextField margin="dense"
          value={email}
          onChange={this.handleChangeText.bind(this, 'email')}
          label="連絡先メールアドレス" type="email" fullWidth />
        <TextField margin="dense"
          value={phone}
          onChange={this.handleChangeText.bind(this, 'phone')}
          label="連絡先電話番号" type="text" fullWidth />
        <TextField margin="dense"
          value={password}
          onChange={this.handleChangeText.bind(this, 'password')}
          label="ユーザＰＷ" type="password" fullWidth />
        <TextField margin="dense"
          value={confirm_password}
          onChange={
            this.handleChangeText.bind(this, 'confirm_password')}
          label="ユーザＰＷ（確認）" type="password" fullWidth />
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
}
LoginProfile.displayName = 'LoginProfile';
LoginProfile.defaultProps = {
  name: ''
, user: ''
, kana: ''
, email: ''
, phone: ''
, profile: null
, open: false
};
LoginProfile.propTypes = {
  classes: PropTypes.object.isRequired
, onClose: PropTypes.func.isRequired
, name: PropTypes.string.isRequired
, user: PropTypes.string.isRequired
, kana: PropTypes.string.isRequired
, email: PropTypes.string.isRequired
, phone: PropTypes.string.isRequired
, profile: PropTypes.object.isRequired
, open: PropTypes.bool.isRequired
};

const styles = {};
export default withStyles(styles)(LoginProfile);

