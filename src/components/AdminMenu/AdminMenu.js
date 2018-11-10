import * as R           from 'ramda';
import React            from 'react';
import PropTypes        from 'prop-types'
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';
import Spinner          from 'Utilities/Spinner';

import { withStyles }   from '@material-ui/core/styles';
import { IconButton, Menu, TextField, Typography, MenuItem } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import RssDialog        from 'Components/RssDialog/RssDialog';
import LoginFormDialog  from 'Components/LoginFormDialog/LoginFormDialog';

class AdminMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl:           null
    , isPreference:       false
    , isProfile:          false
    , isSuccess:          false
    , isNotValid:         false
    , password:           ''
    , confirm_password:   ''
    , preference:         props.preference
    , profile:            props.profile
    };
    this.spn = Spinner.of('app');
  }

  componentDidMount() {
    std.logInfo(AdminMenu.displayName, 'fetch', 'Preference');
    std.logInfo(AdminMenu.displayName, 'fetch', 'Profile');
    Promise.all([
      LoginAction.fetchPreference()
    , LoginAction.fetchProfile(this.props.admin)
    ]);
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(AdminMenu.displayName, 'Props', this.props);
    const { profile, preference } = nextProps;
    this.setState({ preference, profile });
  }

  handleChangeProfile(name, event) {
    std.logInfo(AdminMenu.displayName, 'handleChangeProfile', name);
    const { profile } = this.state;
    switch(name) {
      case 'password':
      case 'confirm_password':
        {
          this.setState({ [name]: event.target.value });
          break;
        }
      default:
        {
          this.setState({ profile: R.merge(profile, { [name]: event.target.value }) });
          break;
        }
    }
  }

  handleChangePreference(name, event) {
    std.logInfo(AdminMenu.displayName, 'handleChangePreference', name);
    const { preference } = this.state;
    switch(name) {
      case 'url1':
      case 'url2':
      case 'url3':
      case 'url4':
        {
          const advertisement = R.merge(preference.advertisement, { [name]: event.target.value });
          this.setState({ preference: R.merge(preference, { advertisement }) });
        }
        break;
      case 'from':
        {
          this.setState({ preference: R.merge(preference, { [name]: event.target.value }) });
          break;
        }
      default:
        {
          const number = Number(event.target.value);
          const menu = preference.menu.map(item => item.name === name ? R.merge(item, { name, number }) : item );
          this.setState({ preference: R.merge(preference, { menu }) } );
        }
        break;
    }
  }

  handleMenu(event) {
    std.logInfo(AdminMenu.displayName, 'handleMenu', event.currentTarget);
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose(name) {
    std.logInfo(AdminMenu.displayName, 'handleClose', name);
    this.setState({ anchorEl: null });
  }

  handleInitialize(name) {
    const { admin } = this.props;
    this.spn.start();
    std.logInfo(AdminMenu.displayName, 'handleInitialize', name);
    LoginAction.createPreference(admin)
      .then(() => this.setState({ isSuccess: true }))
      .then(() => this.spn.stop())
      .catch(err => {
        std.logError(AdminMenu.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        this.spn.stop();
      });
  }
  
  handleOpenDialog(name) {
    std.logInfo(AdminMenu.displayName, 'handleOpenDialog', name);
    this.setState({ [name]: true });
  }

  handleCloseDialog(name) {
    std.logInfo(AdminMenu.displayName, 'handleCloseDialog', name);
    this.setState({ [name]: false });
  }

  handleSubmitDialog(name) {
    const { profile, preference, password } = this.state;
    const { admin } = this.props;
    switch(name) {
      case 'isProfile':
        {
          if(this.isValidateProfile() && this.isChanged()) {
            this.spn.start();
            std.logInfo(AdminMenu.displayName, 'handleSubmitDialog', name);
            LoginAction.updateProfile(admin, password, profile)
              .then(() => this.setState({ isSuccess: true }))
              .then(() => this.spn.stop())
              .catch(err => {
                std.logError(AdminMenu.displayName, err.name, err.message);
                this.setState({ isNotValid: true });
                this.spn.stop();
              });
          } else {
            this.setState({ isNotValid: true });
          }
          break;
        }
      case 'isPreference':
        {
          if(this.isValidatePreference() && this.isChanged()) {
            this.spn.start();
            std.logInfo(AdminMenu.displayName, 'handleSubmitDialog', name);
            LoginAction.updatePreference(admin, preference)
              .then(() => this.setState({ isSuccess: true }))
              .then(() => this.spn.stop())
              .catch(err => {
                std.logError(AdminMenu.displayName, err.name, err.message);
                this.setState({ isNotValid: true })
                this.spn.stop();
              });
          } else {
            this.setState({ isNotValid: true });
          }
          break;
        }
    }
  }

  isValidateProfile() {
    const { profile, password, confirm_password } = this.state;
    const { name, kana, email, phone } = profile;
    return (password === confirm_password && password !== '' && name !== '' && kana !== '' && std.regexEmail(email)
      && std.regexNumber(phone));
  }

  isValidatePreference() {
    const { preference } = this.state;
    const { from, advertisement, menu } = preference;
    const { url1, url2, url3, url4 } = advertisement;
    const isNumber = menu.every(item => std.regexNumber(item.number));
    return (std.regexEmail(from) && url1 !== '' && url2 !== '' && url3 !== '' && url4 !== '' && isNumber);
  }

  isChanged() {
    const { password, confirm_password } = this.state;
    const { name, kana, email, phone } = this.state.profile;
    const { from, advertisement, menu} = this.state.preference;
    const { url1, url2, url3, url4 } = advertisement;
    const { num1, num2, num3, num4 } = menu;
    const { preference } = this.props;
    const { profile } = this.props;
    return (password === confirm_password || profile.name !== name || profile.kana !== kana || profile.email !== email
      || profile.phone !== phone || preference.from !== from || preference.advertisement.url1 !== url1
      || preference.advertisement.url2 !== url2 || preference.advertisement.url3 !== url3 || preference.advertisement.url4 !== url4
      || preference.menu.num1 !== num1 || preference.menu.num2 !== num2 || preference.menu.num3 !== num3
      || preference.menu.num4 !== num4);
  }

  renderMenu(item, idx) {
    const title = `${item.name}登録数上限`;
    return <TextField margin="dense" value={Number(item.number)} key={idx} onChange={this.handleChangePreference.bind(this, item.name)}
      label={title} type="number" fullWidth />;
  }

  render() {
    //std.logInfo(AdminMenu.displayName, 'State', this.state);
    const { auth, classes } = this.props;
    const { isNotValid, isSuccess, anchorEl, isProfile, isPreference, password, confirm_password, preference, profile } = this.state;
    const { from, menu, advertisement } = preference;
    const { name, kana, email, phone, user } = profile;
    const { url1, url2, url3, url4 } = advertisement;
    const renderMenu = menu ? menu.map((obj, idx) => this.renderMenu(obj, idx)) : []; 
    const open = Boolean(anchorEl);
    return auth && (<div>
      <IconButton aria-owns={open ? 'menu-appbar' : null} aria-haspopup="true" onClick={this.handleMenu.bind(this)} color="inherit" >
        <AccountCircle />
      </IconButton>
      <Menu id="menu-appbar" anchorEl={anchorEl} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
        transformOrigin={{ vertical: 'top', horizontal: 'right'}} open={open} onClose={this.handleClose.bind(this)}>
        <MenuItem onClick={this.handleOpenDialog.bind(this, 'isProfile')}>プロファイル</MenuItem>
        <MenuItem onClick={this.handleOpenDialog.bind(this, 'isPreference')}>設定内容変更</MenuItem>
        <MenuItem onClick={this.handleInitialize.bind(this)}>初期化処理</MenuItem>
        <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
          内容に不備があります。もう一度確認してください。
        </RssDialog>
        <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
          要求を受け付けました。
        </RssDialog>
        <LoginFormDialog isSubmit open={isProfile} title={'プロファイル'} onClose={this.handleCloseDialog.bind(this, 'isProfile')}
          onSubmit={this.handleSubmitDialog.bind(this, 'isProfile')}>
          <Typography variant="h6" noWrap className={classes.title}>{name}（{user}）</Typography>
          <TextField autoFocus margin="dense" value={name} onChange={this.handleChangeProfile.bind(this, 'name')}
            label="氏名" type="text" fullWidth />
          <TextField margin="dense" value={kana} onChange={this.handleChangeProfile.bind(this, 'kana')}
            label="氏名（カナ）" type="text" fullWidth />
          <TextField margin="dense" value={email} onChange={this.handleChangeProfile.bind(this, 'email')}
            label="連絡先メールアドレス" type="email" fullWidth />
          <TextField margin="dense" value={phone} onChange={this.handleChangeProfile.bind(this, 'phone')}
            label="連絡先電話番号" type="text" fullWidth />
          <TextField margin="dense" value={password} onChange={this.handleChangeProfile.bind(this, 'password')}
            label="ユーザＰＷ" type="password" fullWidth />
          <TextField margin="dense" value={confirm_password} onChange={this.handleChangeProfile.bind(this,'confirm_password')}
            label="ユーザＰＷ（確認）" type="password" fullWidth/>
        </LoginFormDialog>
        <LoginFormDialog isSubmit open={isPreference} title={'設定内容変更'} onClose={this.handleCloseDialog.bind(this, 'isPreference')}
          onSubmit={this.handleSubmitDialog.bind(this, 'isPreference')}>
          <TextField autoFocus margin="dense" value={from} onChange={this.handleChangePreference.bind(this, 'from')}
            label="問合せ先メールアドレス" type="text" fullWidth />
          <TextField margin="dense" value={url1} onChange={this.handleChangePreference.bind(this, 'url1')}
            label="広告１URL" type="text" fullWidth />
          <TextField margin="dense" value={url2} onChange={this.handleChangePreference.bind(this, 'url2')}
            label="広告２URL" type="text" fullWidth />
          <TextField margin="dense" value={url3} onChange={this.handleChangePreference.bind(this, 'url3')}
            label="広告３URL" type="text" fullWidth />
          <TextField margin="dense" value={url4} onChange={this.handleChangePreference.bind(this, 'url4')}
            label="広告４URL" type="text" fullWidth />
          {renderMenu}
        </LoginFormDialog>
      </Menu>
    </div>);
  }
}
AdminMenu.displayName = 'AdminMenu';
AdminMenu.defaultProps = {};
AdminMenu.propTypes = {
  classes: PropTypes.object.isRequired
, preference: PropTypes.object.isRequired
, profile: PropTypes.object.isRequired
, admin: PropTypes.string.isRequired
, auth: PropTypes.bool.isRequired
};

const styles = theme => ({
  title: { margin: theme.spacing.unit * 1.75 }
});
export default withStyles(styles)(AdminMenu);
