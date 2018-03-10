import React            from 'react';
import PropTypes        from 'prop-types';
import { withRouter }   from 'react-router-dom';
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { TextField, Typography, Dialog, Button }
                        from 'material-ui';
import {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  withMobileDialog
}                       from 'material-ui/Dialog';
import RssButton        from 'Components/RssButton/RssButton';

class LoginConfirm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: ''
    , phone: ''
    , newPassword: ''
    , openedCorrect: false
    , openedIncorrect: false
    };
  }

  handleClose(name) {
    std.logInfo(LoginConfirm.displayName, 'handleClose', name);
    switch(name) {
      case 'authenticate':
        this.setState({ openedCorrect: false });
        this.props.history.push('/login');
        break;
      case 'confirmation':
        this.setState({ openedIncorrect: false });
        break;
    }
  }

  handleSubmit() {
    std.logInfo(LoginConfirm.displayName, 'handleSubmit', this.state);
    const { email, phone } = this.state;
    const newPassword = std.makeRandPassword(16);
    LoginAction.confirmation(email, phone)
    .then(() => {
      if(this.props.user) {
        LoginAction.changePassword(this.props.user, newPassword);
        this.setState({ openedCorrect: true, newPassword });
      } else {
        this.setState({ openedIncorrect: true });
      }
    })
    .catch(err => this.setState({ openedIncorrect: true }));
  }

  handleChangeText(name, event) {
    this.setState({ [name]: event.target.value });
  }

  renderCorrect() {
    const { fullScreen, user } = this.props;
    const { openedCorrect, newPassword } = this.state;
    return <Dialog fullScreen={fullScreen}
      open={openedCorrect}
      onClose={this.handleClose.bind(this, 'authenticate')}
      area-labelledby="responsive-dialog-title">
      <DialogTitle id="responsive-dialog-title">
        ログインＩＤ・ＰＷは以下のとおりです。
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          ログインＩＤ：{user}
        </DialogContentText>
        <DialogContentText>
          ログインＰＷ：{newPassword}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={this.handleClose.bind(this, 'authenticate')}
          color="primary">
          ログイン画面に戻る
        </Button>
      </DialogActions>
    </Dialog>;
  }

  renderIncorrect() {
    const { fullScreen } = this.props;
    const { openedIncorrect } = this.state;
    return <Dialog fullScreen={fullScreen}
      open={openedIncorrect}
      onClose={this.handleClose.bind(this, 'confirmation')}
      area-labelledby="responsive-dialog-title">
      <DialogTitle id="responsive-dialog-title">
        合言葉が間違っています。再度ご確認ください。
      </DialogTitle>
      <DialogActions>
        <Button onClick={this.handleClose.bind(this, 'confirmation')}
          color="primary">
          ログインＩＤ・ＰＷ確認フォームに戻る
        </Button>
      </DialogActions>
      <DialogContent>
        <DialogContentText>
          お問い合わせ：info@example.com（営業時間９時〜１８時）
        </DialogContentText>
      </DialogContent>
    </Dialog>;
  }

  render() {
    std.logInfo(LoginConfirm.displayName, 'Props', this.props);
    std.logInfo(LoginConfirm.displayName, 'State', this.state);
    const { classes } = this.props;
    const { email, phone } = this.state;
    const inputText = { disableUnderline: true
      , classes: { root: classes.textRoot, input: classes.textInput } }
    const renderCorrect = this.renderCorrect();
    const renderIncorrect = this.renderIncorrect();
    return <div className={classes.loginForms}>
      <div className={classes.space} />
      <Typography variant="title" align="center"
        className={classes.title}>ログインＩＤ・ＰＷ確認フォーム
      </Typography>
      <div className={classes.space} />
      <div className={classes.form}>
        <Typography variant="body2" align="center"
          className={classes.text}>登録メールアドレス</Typography>
        <TextField
          value={email} InputProps={inputText}
          onChange={this.handleChangeText.bind(this, 'email')}
          className={classes.input} />
        <div className={classes.space} /> 
      </div>
      <div className={classes.form}>
        <Typography variant="body2" align="center"
          className={classes.text}>登録電話番号下四桁</Typography>
        <TextField
          value={phone} InputProps={inputText}
          onChange={this.handleChangeText.bind(this, 'phone')}
          className={classes.input} />
        <div className={classes.space} />
      </div>
      <div className={classes.space} />
      <div className={classes.buttons}>
        <div className={classes.space} />
        <RssButton color={'skyblue'}
          onClick={this.handleSubmit.bind(this)}
          classes={classes.button}>送信</RssButton>
        {renderCorrect}
        {renderIncorrect}
        <div className={classes.space} />
      </div>
      <div className={classes.space} />
    </div>;
  }
};

const rowHeight = 62;
const styles = theme => ({
  loginForms: { display: 'flex', flexDirection: 'column'
              , justifyContent: 'center', height: '100%'}
, space:      { flex: 1 }
, title:      { padding: theme.spacing.unit * 2, height: rowHeight }
, form:       { padding: theme.spacing.unit
              , display: 'flex', flexDirection: 'row'
              , justifyContent: 'center', alignItems: 'center'
              , height: rowHeight }
, buttons:    { padding: theme.spacing.unit
              , display: 'flex', flexDirection: 'row'
              , justifyContent: 'center', alignItems: 'center'
              , height: rowHeight }
, button:     { flex: 1, height: '100%' }
, notice:     { padding: theme.spacing.unit
              , display: 'flex', flexDirection: 'column'
              , justifyContent: 'center', alignItems: 'center'
              , height: rowHeight }
, text:       { flex: 1 }
, notes:      { flex: 1 }
, input:      { flex: 1 }
, textRoot:   { padding: 0
              , 'label + &': { marginTop: theme.spacing.unit * 3 } }
, textInput:  { borderRadius: 4
              , backgroundColor: theme.palette.common.white
              , border: '1px solid #ced4da', fontSize: 16
              , padding: '10px 12px', width: 'calc(100% - 24px)'
              , transition:
                  theme.transitions.create(['border-color', 'box-shadow'])
              , '&:focus': {
                  borderColor: '#80bdff'
                , boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)' } }
});
LoginConfirm.displayName = 'LoginConfirm';
LoginConfirm.defaultProps = {};
LoginConfirm.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(LoginConfirm));