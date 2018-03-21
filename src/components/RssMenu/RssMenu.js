import React            from 'react';
import PropTypes        from 'prop-types'
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { IconButton, Menu, TextField, Typography }
                        from 'material-ui';
import { MenuItem }     from 'material-ui/Menu';
import { DialogContentText }
                        from 'material-ui/Dialog';
import { AccountCircle }
                        from 'material-ui-icons';
import RssDialog        from 'Components/RssDialog/RssDialog';
import LoginFormDialog  from 'Components/LoginFormDialog/LoginFormDialog';

class RssMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl:         null
    , isPreference:     false
    , isProfile:        false
    , isSuccess:        false
    , isNotValid:       false
    , password:         ''
    , confirm_password: ''
    , profile:          props.profile
    };
  }

  componentDidMount() {
    std.logInfo(RssMenu.displayName, 'Props', this.props);
    LoginAction.fetchProfile(this.props.user);
    LoginAction.fetchPreference(this.props.user);
  }

  componentWillReceiveProps(nextProps) {
    std.logInfo(RssMenu.displayName, 'Props', this.props);
    const { profile } = nextProps;
    this.setState({ profile });
  }

  handleChangeProfile(name, event) {
    std.logInfo(RssMenu.displayName, 'handleChangeProfile', name);
    const { profile } = this.state;
    switch(name) {
      case 'password': case 'confirm_password':
        this.setState({ [name]: event.target.value });
        break;
      default:
        this.setState({ profile: Object.assign({}, profile
        , { [name]: event.target.value  }) });
        break;
    }
  }

  handleMenu(event) {
    std.logInfo(RssMenu.displayName, 'handleMenu', event.currentTarget);
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose(name, event) {
    std.logInfo(RssMenu.displayName, 'handleClose', name);
    this.setState({ anchorEl: null});
  }

  handleOpenDialog(name, event) {
    std.logInfo(RssMenu.displayName, 'handleOpenDialog', name);
    this.setState({ [name]: true });
  }

  handleCloseDialog(name, event) {
    std.logInfo(RssMenu.displayName, 'handleCloseDialog', name);
    this.setState({ [name]: false });
  }

  handleSubmitDialog(name, event) {
    std.logInfo(RssMenu.displayName, 'handleSubmitDialog', name);
    const { profile, password } = this.state;
    const { user } = this.props;
    switch(name) {
      case 'isProfile':
        if(this.isValidateProfile() && this.isChanged()) {
          LoginAction.updateProfile(user, password, profile)
            .then(() => this.setState({ isSuccess: true }))
            .catch(err => this.setState({ isNotValid: true }));
        } else {
          this.setState({ isNotValid: true });
        }
        break;
      case 'isPreference':
        if(this.isValidatePreference() && this.isChanged()) {
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

  handleCloseDialog(name) {
    std.logInfo(RssMenu.displayName, 'handleCloseDialog', name);
    this.setState({ [name]: false });
  }

  isValidateProfile() {
    const { profile, password, confirm_password } = this.state;
    const { name, kana, email, phone } = profile;
    return (password === confirm_password
      && password !== '' && name !== '' && kana !== ''
      && std.regexEmail(email) && std.regexNumber(phone)
    );
  }

  isValidatePreference() {
    const { profile } = this.state;
    const { plan } = profile;
    return (
      plan !== ''
    );
  }

  isChanged() {
    const { password, confirm_password } = this.state;
    const { name, kana, email, phone, plan } = this.state.profile;
    const { profile } = this.props;
    return (password === confirm_password
      || profile.name !== name
      || profile.kana !== kana
      || profile.email !== email
      || profile.phone !== phone
      || profile.plan !== plan
    );
  }

  renderItems(item, idx) {
    return <MenuItem key={idx} value={item.name}>
      {item.name}（上限数：{item.number}）
    </MenuItem>;
  }

  render() {
    //std.logInfo(RssMenu.displayName, 'State', this.state);
    const { preference, auth, classes } = this.props;
    const { isNotValid, isSuccess, anchorEl, isProfile, isPreference
      , password, confirm_password, profile } = this.state;
    const { name, kana, email, phone, user, plan } = profile;
    const open = Boolean(anchorEl);
    const renderItems = preference.menu ? preference.menu
      .map((item, idx) => this.renderItems(item, idx)) : [];
    return auth && (<div>
      <IconButton
        aria-owns={open ? 'menu-appbar' : null}
        aria-haspopup="true"
        onClick={this.handleMenu.bind(this)}
        color="inherit" ><AccountCircle /></IconButton>
      <Menu id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right'}}
        open={open}
        onClose={this.handleClose.bind(this)}>
        <MenuItem
          onClick={this.handleOpenDialog.bind(this, 'isProfile')}>
        プロファイル
        </MenuItem>
        <MenuItem
          onClick={this.handleOpenDialog.bind(this, 'isPreference')}>
        契約内容変更
        </MenuItem>
        <RssDialog open={isNotValid} title={'送信エラー'}
          onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
        内容に不備があります。もう一度確認してください。
        </RssDialog>
        <RssDialog open={isSuccess} title={'送信完了'}
          onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
        要求を受け付けました。
        </RssDialog>
        <LoginFormDialog open={isProfile} title={'プロファイル'}
          onClose={this.handleCloseDialog.bind(this, 'isProfile')}
          onSubmit={this.handleSubmitDialog.bind(this, 'isProfile')}>
          <Typography variant="title" noWrap
            className={classes.title}>{name}（{user}）</Typography>
          <TextField autoFocus margin="dense"
            value={name}
            onChange={this.handleChangeProfile.bind(this, 'name')}
            label="氏名" type="text" fullWidth />
          <TextField margin="dense"
            value={kana}
            onChange={this.handleChangeProfile.bind(this, 'kana')}
            label="氏名（カナ）" type="text" fullWidth />
          <TextField margin="dense"
            value={email}
            onChange={this.handleChangeProfile.bind(this, 'email')}
            label="連絡先メールアドレス" type="email" fullWidth />
          <TextField margin="dense"
            value={phone}
            onChange={this.handleChangeProfile.bind(this, 'phone')}
            label="連絡先電話番号" type="text" fullWidth />
          <TextField margin="dense"
            value={password}
            onChange={this.handleChangeProfile.bind(this, 'password')}
            label="ユーザＰＷ" type="password" fullWidth />
          <TextField margin="dense"
            value={confirm_password}
            onChange={
              this.handleChangeProfile.bind(this, 'confirm_password')}
            label="ユーザＰＷ（確認）" type="password" fullWidth />
        </LoginFormDialog>
        <LoginFormDialog open={isPreference} title={'契約内容変更'}
          onClose={this.handleCloseDialog.bind(this, 'isPreference')}
          onSubmit={this.handleSubmitDialog.bind(this, 'isPreference')}>
          <Typography variant="title" noWrap
            className={classes.title}>{name}（{user}）</Typography>
          <TextField select autoFocus margin="dense"
            value={plan}
            onChange={this.handleChangeProfile.bind(this, 'plan')}
            label="契約プラン" fullWidth>
            {renderItems}
          </TextField>
        </LoginFormDialog>>
      </Menu>
    </div>);
  }
};
const styles = theme => ({
  title: { margin: theme.spacing.unit * 1.75 }
});
RssMenu.displayName = 'RssMenu';
RssMenu.defaultProps = {};
RssMenu.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(RssMenu);
