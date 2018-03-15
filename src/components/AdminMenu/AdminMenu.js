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
    , profile_admin:      props.profile_admin
    , profile_user:       props.profile_user
    };
  }

  componentDidMount() {
    const { admin } = this.props;
    LoginAction.fetchProfileAdmin(admin);
    LoginAction.fetchProfileUser(admin);
  }

  componentWillReceiveProps(nextProps) {
    std.logInfo(AdminMenu.displayName, 'Props', this.props);
    const { profile_user, profile_admin } = nextProps;
    this.setState({ profile_admin, profile_user });
  }

  handleChangeUser(name, event) {
    std.logInfo(AdminMenu.displayName, 'handleChangeUser', name);
    const { profile_user } = this.state;
    switch(name) {
      case 'password': case 'confirm_password':
        this.setState({ [name]: event.target.value });
        break;
      default:
        this.setState({ profile_user:
          Object.assign({}, profile_user, { [name]: event.target.value })
        });
        break;
    }
  }

  handleChangeAdmin(name, event) {
    std.logInfo(AdminMenu.displayName, 'handleChangeAdmin', name);
    const { profile_admin } = this.state;
    switch(name) {
      case 'num1': case 'num2': case 'num3': case 'num4':
        const menu = Object.assign({}
          , profile_admin.menu, { [name]: event.target.value });
        this.setState({ profile_admin:
          Object.assign({}, profile_admin, { menu })
        });
        break;
      case 'url1': case 'url2': case 'url3': case 'url4':
        const advertisement = Object.assign({}
          , profile_admin.advertisement, { [name]: event.target.value });
        this.setState({ profile_admin:
          Object.assign({}, profile_admin, { advertisement })
        });
        break;
      default:
        this.setState({ profile_admin:
          Object.assign({}, profile_admin, { [name]: event.target.value })
        });
        break;
    }
  }

  handleMenu(event) {
    std.logInfo(AdminMenu.displayName, 'handleMenu', event.currentTarget);
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose(name, event) {
    std.logInfo(AdminMenu.displayName, 'handleClose', name);
    this.setState({ anchorEl: null});
  }

  handleInitialize(name, event) {
    std.logInfo(AdminMenu.displayName, 'handleinitialize', name);
    const { admin } = this.props;
    LoginAction.createAdmin(admin)
      .then(() => this.setState({ isSuccess: true }))
      .catch(err => this.setState({ isNotValid: true }));
  }
  
  handleOpenDialog(name, event) {
    std.logInfo(AdminMenu.displayName, 'handleOpenDialog', name);
    this.setState({ [name]: true });
  }

  handleCloseDialog(name, event) {
    std.logInfo(AdminMenu.displayName, 'handleCloseDialog', name);
    this.setState({ [name]: false });
  }

  handleSubmitDialog(name, event) {
    std.logInfo(AdminMenu.displayName, 'handleSubmitDialog', name);
    const { profile_user, profile_admin, password } = this.state;
    const { admin } = this.props;
    switch(name) {
      case 'isProfile':
        if(this.isValidateUser() && this.isChanged()) {
          LoginAction.updateUser(admin, password, profile_user)
            .then(() => this.setState({ isSuccess: true }))
            .catch(err => this.setState({ isNotValid: true }));
        } else {
          this.setState({ isNotValid: true });
        }
        break;
      case 'isPreference':
        if(this.isValidateAdmin() && this.isChanged()) {
          LoginAction.updateAdmin(admin, profile_admin)
            .then(() => this.setState({ isSuccess: true }))
            .catch(err => this.setState({ isNotValid: true }));
        } else {
          this.setState({ isNotValid: true });
        }
        break;
      default:
        this.setState({ [name]: false });
        break;
    }
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  isValidateUser() {
    const { profile_user, password, confirm_password }
      = this.state;
    const { name, kana, email, phone } = profile_user;
    return (password === confirm_password
      && password !== '' && name !== '' && kana !== ''
      && std.regexEmail(email) && std.regexNumber(phone)
    );
  }

  isValidateAdmin() {
    const { profile_admin }
      = this.state;
    const { from, agreement, advertisement, menu } = profile_admin;
    const { url1, url2, url3, url4 } = advertisement;
    const { num1, num2, num3, num4 } = menu;
    return (std.regexEmail(from)  && agreement !== ''
      && url1 !== '' && url2 !== '' && url3 !== '' && url4 !== ''
      && std.regexNumber(num1) && std.regexNumber(num2)
      && std.regexNumber(num3) && std.regexNumber(num4)
    );
  }

  isChanged() {
    const { password, confirm_password } = this.state;
    const { name, kana, email, phone } = this.state.profile_user;
    const { from, agreement, advertisement, menu }
      = this.state.profile_admin;
    const { url1, url2, url3, url4 } = advertisement;
    const { num1, num2, num3, num4 } = menu;
    const { profile_admin } = this.props;
    const { profile_user } = this.props;
    return (password === confirm_password
      || profile_user.name !== name
      || profile_user.kana !== kana
      || profile_user.email !== email
      || profile_user.phone !== phone
      || profile_admin.from !== from
      || profile_admin.agreement !== agreement
      || profile_admin.advertisement.url1 !== url1
      || profile_admin.advertisement.url2 !== url2
      || profile_admin.advertisement.url3 !== url3
      || profile_admin.advertisement.url4 !== url4
      || profile_admin.menu.num1 !== num1
      || profile_admin.menu.num2 !== num2
      || profile_admin.menu.num3 !== num3
      || profile_admin.menu.num4 !== num4
    );
  }

  render() {
    std.logInfo(AdminMenu.displayName, 'State', this.state);
    const { auth, classes } = this.props;
    const { isNotValid, isSuccess, anchorEl, isProfile, isPreference
      , password, confirm_password, profile_admin, profile_user }
      = this.state;
    const { from, agreement, menu, advertisement } = profile_admin;
    const { name, kana, email, phone, user } = profile_user;
    const { num1, num2, num3, num4 } = menu;
    const { url1, url2, url3, url4 } = advertisement;
    const open = Boolean(anchorEl);
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
        設定内容変更
        </MenuItem>
        <MenuItem
          onClick={this.handleInitialize.bind(this)}>
        初期化処理
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
            onChange={this.handleChangeUser.bind(this, 'name')}
            label="氏名" type="text" fullWidth />
          <TextField margin="dense"
            value={kana}
            onChange={this.handleChangeUser.bind(this, 'kana')}
            label="氏名（カナ）" type="text" fullWidth />
          <TextField margin="dense"
            value={email}
            onChange={this.handleChangeUser.bind(this, 'email')}
            label="連絡先メールアドレス" type="email" fullWidth />
          <TextField margin="dense"
            value={phone}
            onChange={this.handleChangeUser.bind(this, 'phone')}
            label="連絡先電話番号" type="text" fullWidth />
          <TextField margin="dense"
            value={password}
            onChange={this.handleChangeUser.bind(this, 'password')}
            label="ユーザＰＷ" type="password" fullWidth />
          <TextField margin="dense"
            value={confirm_password}
            onChange={this.handleChangeUser.bind(this,'confirm_password')}
            label="ユーザＰＷ（確認）" type="password" fullWidth/>
        </LoginFormDialog>>
        <LoginFormDialog open={isPreference} title={'設定内容変更'}
          onClose={this.handleCloseDialog.bind(this, 'isPreference')}
          onSubmit={this.handleSubmitDialog.bind(this, 'isPreference')}>
          <TextField autoFocus margin="dense" id="from" value={from}
            onChange={this.handleChangeAdmin.bind(this, 'from')}
            label="問合せ先メールアドレス" type="from" fullWidth />
          <TextField margin="dense"
            value={agreement}
            onChange={this.handleChangeAdmin.bind(this, 'agreement')}
            label="利用規約URL" type="text" fullWidth />
          <TextField margin="dense"
            value={url1}
            onChange={this.handleChangeAdmin.bind(this, 'url1')}
            label="広告１URL" type="text" fullWidth />
          <TextField margin="dense"
            value={url2}
            onChange={this.handleChangeAdmin.bind(this, 'url2')}
            label="広告２URL" type="text" fullWidth />
          <TextField margin="dense"
            value={url3}
            onChange={this.handleChangeAdmin.bind(this, 'url3')}
            label="広告３URL" type="text" fullWidth />
          <TextField margin="dense"
            value={url4}
            onChange={this.handleChangeAdmin.bind(this, 'url4')}
            label="広告４URL" type="text" fullWidth />
          <TextField margin="dense"
            value={num1}
            onChange={this.handleChangeAdmin.bind(this, 'num1')}
            label="メニュー１登録上限数" type="number" fullWidth />
          <TextField margin="dense"
            value={num2}
            onChange={this.handleChangeAdmin.bind(this, 'num2')}
            label="メニュー２登録上限数" type="number" fullWidth />
          <TextField margin="dense"
            value={num3}
            onChange={this.handleChangeAdmin.bind(this, 'num3')}
            label="メニュー３登録上限数" type="number" fullWidth />
          <TextField margin="dense"
            value={num4}
            onChange={this.handleChangeAdmin.bind(this, 'num4')}
            label="メニュー４登録上限数" type="number" fullWidth />
        </LoginFormDialog>>
      </Menu>
    </div>);
  }
};
const styles = theme => ({
  title: { margin: theme.spacing.unit * 1.75 }
});
AdminMenu.displayName = 'AdminMenu';
AdminMenu.defaultProps = {};
AdminMenu.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(AdminMenu);
