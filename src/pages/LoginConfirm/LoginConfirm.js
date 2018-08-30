import React            from 'react';
import PropTypes        from 'prop-types';
import { withRouter }   from 'react-router-dom';
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import { Typography, Dialog, Button, DialogActions, DialogContent, DialogContentText, DialogTitle }
                        from '@material-ui/core';
import RssButton        from 'Components/RssButton/RssButton';
import RssInput         from 'Components/RssInput/RssInput';

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

  comopnentDidMount() {
    std.logInfo(LoginConfirm.displayName, 'fetch', 'Preference');
    LoginAction.fetchPreference();
  }

  handleClose(name) {
    std.logInfo(LoginConfirm.displayName, 'handleClose', name);
    const { history } = this.props;
    switch(name) {
      case 'authenticate':
        this.setState({ openedCorrect: false });
        history.push('/login/authenticate');
        break;
      case 'confirmation':
        this.setState({ openedIncorrect: false });
        history.push('/login/authenticate');
        break;
    }
  }

  handleSubmit() {
    std.logInfo(LoginConfirm.displayName, 'handleSubmit', this.state);
    const { email, phone } = this.state;
    const newPassword = std.rndPassword(16);
    LoginAction.confirmation(email, phone)
    .then(() => {
      if(this.props.user) {
        LoginAction.changePassword(this.props.user, newPassword);
        this.setState({ openedCorrect: true, newPassword });
      } else {
        this.setState({ openedIncorrect: true });
      }
    })
    .catch(err => {
      std.logError(LoginConfirm.displayName, err.name, err.message);
      this.setState({ openedIncorrect: true });
    });
  }

  handleChangeText(name, event) {
    this.setState({ [name]: event.target.value });
  }

  renderCorrect() {
    const { user } = this.props;
    const { openedCorrect, newPassword } = this.state;
    return <Dialog open={openedCorrect}
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
    const { preference } = this.props;
    const { openedIncorrect } = this.state;
    return <Dialog open={openedIncorrect}
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
          お問い合わせ：{preference.from}（営業時間９時〜１８時）
        </DialogContentText>
      </DialogContent>
    </Dialog>;
  }

  render() {
    //std.logInfo(LoginConfirm.displayName, 'State', this.state);
    //std.logInfo(LoginConfirm.displayName, 'Props', this.props);
    const { classes } = this.props;
    const { email, phone } = this.state;
    const renderCorrect = this.renderCorrect();
    const renderIncorrect = this.renderIncorrect();
    return <div className={classes.container}>
      <div className={classes.loginForms}>
      <div className={classes.space} />
      <Typography variant="title" align="center"
        className={classes.title}>Unlock</Typography>
      <div className={classes.form}>
        <RssInput label="E-MAIL ADDRESS" value={email}
          placeholder="Enter E-mail address"
          onChange={this.handleChangeText.bind(this, 'email')}
          className={classes.input} />
      </div>
      <div className={classes.form}>
        <RssInput type="password" label="PHONE NUMBER" value={phone}
          placeholder="Phone number (Lower 4 digits)"
          onChange={this.handleChangeText.bind(this, 'phone')}
          className={classes.input} />
      </div>
      <div className={classes.form} />
      <div className={classes.buttons}>
        <div className={classes.space} />
        <RssButton color="secondary"
          onClick={this.handleSubmit.bind(this)}
          classes={classes.button}>Unlock</RssButton>
        {renderCorrect}
        {renderIncorrect}
        <div className={classes.space} />
      </div>
      <div className={classes.space} />
      </div>
    </div>;
  }
}
LoginConfirm.displayName = 'LoginConfirm';
LoginConfirm.defaultProps = {};
LoginConfirm.propTypes = {
  classes: PropTypes.object.isRequired
, history: PropTypes.object.isRequired
, user: PropTypes.string.isRequired
, preference: PropTypes.object.isRequired
};

const loginWidth = 320;
const loginHeight = 480;
const rowHeight = 88;
const styles = theme => ({
  container:  { width: loginWidth, height: loginHeight
              , border: '1px solid $CCC', borderRadius: 8
              , backgroundColor: theme.palette.common.white
              , padding: theme.spacing.unit *3 } 
, loginForms: { display: 'flex', flexDirection: 'column'
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
, button:     { flex: 1 }
, input:      { flex: 1 }
});
export default withStyles(styles)(withRouter(LoginConfirm));
