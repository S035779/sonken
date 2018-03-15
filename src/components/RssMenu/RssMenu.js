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

class RssMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl:         null
    , preference:       false
    , profile:          false
    , name:             ''
    , kana:             ''
    , email:            ''
    , phone:            ''
    , username:         ''
    , password:         ''
    , confirm_password: ''
    , plan:             ''
    };
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
    this.setState({ [name]: false });
  }

  render() {
    const { auth } = this.props;
    const { anchorEl, profile, preference, name, kana, email, phone
      , username, password, confirm_password, plan } = this.state;
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
        <MenuItem onClick={this.handleOpenDialog.bind(this, 'profile')}>
        プロファイル
        </MenuItem>
        <MenuItem onClick={this.handleOpenDialog.bind(this, 'preference')}>
        契約内容変更
        </MenuItem>
        <LoginFormDialog open={profile} title={'プロファイル'}
          onClose={this.handleCloseDialog.bind(this, 'profile')}
          onSubmit={this.handleSubmitDialog.bind(this, 'profile')}>
          <TextField autoFocus margin="dense" id="name" value={name}
            label="氏名" type="text" fullWidth />
          <TextField margin="dense" id="kana" value={kana}
            label="氏名（カナ）" type="text" fullWidth />
          <TextField margin="dense" id="email" value={email}
            label="連絡先メールアドレス" type="email" fullWidth />
          <TextField margin="dense" id="phone" value={phone}
            label="連絡先電話番号" type="text" fullWidth />
          <TextField margin="dense" id="username"
            value={username}
            label="ユーザＩＤ" type="text" fullWidth />
          <TextField margin="dense" id="password"
            value={password}
            label="ユーザＰＷ" type="password" fullWidth />
          <TextField margin="dense" id="confirm_password"
            value={confirm_password}
            label="ユーザＰＷ（確認）" type="confirm_password" fullWidth />
        </LoginFormDialog>>
        <LoginFormDialog open={preference} title={'契約内容変更'}
          onClose={this.handleCloseDialog.bind(this, 'preference')}
          onSubmit={this.handleSubmitDialog.bind(this, 'preference')}>
          <TextField select autoFocus margin="dense" id="plan" value={plan}
            label="契約プラン" fullWidth>
            <MenuItem value={'plan_A'}>Plan A</MenuItem>
            <MenuItem value={'plan_B'}>Plan B</MenuItem>
            <MenuItem value={'plan_C'}>Plan C</MenuItem>
          </TextField>
        </LoginFormDialog>>
      </Menu>
    </div>);
  }
};
const styles = theme => ({});
RssMenu.displayName = 'RssMenu';
RssMenu.defaultProps = {};
RssMenu.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(RssMenu);
