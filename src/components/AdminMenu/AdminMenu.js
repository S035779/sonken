import React              from 'react';
import PropTypes          from 'prop-types'
import LoginAction        from 'Actions/LoginAction';
import std                from 'Utilities/stdutils';

import { withStyles }     from 'material-ui/styles';
import { IconButton, Menu, TextField }
                          from 'material-ui';
import { MenuItem }       from 'material-ui/Menu';
import { DialogContentText }
                          from 'material-ui/Dialog';
import { AccountCircle }  from 'material-ui-icons';
import LoginFormDialog    from 'Components/LoginFormDialog/LoginFormDialog';

class AdminMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl:         null
    , isPreference:       false
    , isProfile:          false
    , password:         ''
    , confirm_password: ''
    , profile:          props.profile
    };
  }

  componentDidMount() {
    const { admin } = this.props;
    LoginAction.fetchProfileAdmin(admin);
  }

  componentWillReceiveProps(nextProps) {
    std.logInfo(AdminMenu.displayName, 'Props', this.props);
    const { profile } = nextProps;
    this.setState({ profile });
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
    LoginAction.createAdmin(admin);
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
    this.setState({ [name]: false });
  }

  render() {
    const { auth } = this.props;
    const { anchorEl, isProfile, isPreference, password, confirm_password
    , profile } = this.state;
    const { from, agreement, menu, advertisement } = profile.admin;
    const { name, kana, email, phone, username } = profile.user;
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
        <LoginFormDialog open={isProfile} title={'プロファイル'}
          onClose={this.handleCloseDialog.bind(this, 'isProfile')}
          onSubmit={this.handleSubmitDialog.bind(this, 'isProfile')}>
          <TextField autoFocus margin="dense"
            value={name}
            label="氏名" type="text" fullWidth />
          <TextField margin="dense"
            value={kana}
            label="氏名（カナ）" type="text" fullWidth />
          <TextField margin="dense"
            value={email}
            label="連絡先メールアドレス" type="email" fullWidth />
          <TextField margin="dense"
            value={phone}
            label="連絡先電話番号" type="text" fullWidth />
          <TextField margin="dense" 
            value={username}
            label="ユーザＩＤ" type="text" fullWidth />
          <TextField margin="dense"
            value={password}
            label="ユーザＰＷ" type="password" fullWidth />
          <TextField margin="dense"
            value={confirm_password}
            label="ユーザＰＷ（確認）" type="confirm_password" fullWidth />
        </LoginFormDialog>>
        <LoginFormDialog open={isPreference} title={'設定内容変更'}
          onClose={this.handleCloseDialog.bind(this, 'isPreference')}
          onSubmit={this.handleSubmitDialog.bind(this, 'isPreference')}>
          <TextField autoFocus margin="dense" id="from" value={from}
            label="問合せ先メールアドレス" type="from" fullWidth />
          <TextField margin="dense"
            value={agreement}
            label="利用規約URL" type="text" fullWidth />
          <TextField margin="dense"
            value={advertisement.url1}
            label="広告１URL" type="text" fullWidth />
          <TextField margin="dense"
            value={advertisement.url2}
            label="広告２URL" type="text" fullWidth />
          <TextField margin="dense"
            value={advertisement.url3}
            label="広告３URL" type="text" fullWidth />
          <TextField margin="dense"
            value={advertisement.url4}
            label="広告４URL" type="text" fullWidth />
          <TextField margin="dense"
            value={menu.num1}
            label="メニュー１登録上限数" type="text" fullWidth />
          <TextField margin="dense"
            value={menu.num2}
            label="メニュー２登録上限数" type="text" fullWidth />
          <TextField margin="dense"
            value={menu.num3}
            label="メニュー３登録上限数" type="text" fullWidth />
          <TextField margin="dense"
            value={menu.num4}
            label="メニュー４登録上限数" type="text" fullWidth />
        </LoginFormDialog>>
      </Menu>
    </div>);
  }
};
const styles = theme => ({});
AdminMenu.displayName = 'AdminMenu';
AdminMenu.defaultProps = {};
AdminMenu.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(AdminMenu);
