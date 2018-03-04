import React            from 'react';
import PropTypes        from 'prop-types';
import { Redirect }     from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { Container }    from 'flux/utils';
import LoginAction       from 'Actions/LoginAction';
import {
  getStores, getState
}                       from 'Stores';

import { withStyles }   from 'material-ui/styles';
import {
  TextField, Typography
}                       from 'material-ui';
import RssButton        from 'Components/RssButton/RssButton';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToRefferer: false
    , username: 'MyUserName'
    , password: 'Test123$'
    };
  }

  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState('loginStore');
  }

  static prefetch(user) {
    console.info('prefetch', user);
    return LoginAction.presetUser(user);
  }

  handleLogin() {
    const { username, password } = this.state;
    LoginAction.authenticate(username, password)
      .then(() => LoginAction.presetUser(username))
      .then(() => {
        if(this.state.isAuthenticated)
          this.setState({ redirectToRefferer: true });
      });
  }

  renderMessage(from) {
    const { classes } = this.props;
    return 
  }

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  }

  render() {
    this.logInfo('render', this.state);
    const { classes, location } = this.props;
    const { redirectToRefferer, username, password } = this.state;
    const inputText = { disableUnderline: true
      , classes: { root: classes.textRoot, input: classes.textInput } }
    const from = location.state || { pathname: '/' };
    const message = this.renderMessage(from.pathname);
    if(redirectToRefferer) return <Redirect to={from} />;
    return <div className={classes.root}>
      <div className={classes.container}>
        <div className={classes.forms}>
          <Typography variant="headline" align="center"
            className={classes.title}>ヤフオク！RSSリーダー</Typography>
          <div className={classes.form}>
            <Typography variant="subheading" align="center"
              className={classes.text}>ログインＩＤ</Typography>
            <TextField type="text"
              value={username} InputProps={inputText} />
          </div>
          <div className={classes.form}>
            <Typography variant="subheading" align="center"
              className={classes.text}>ログインＰＷ</Typography>
            <TextField type="password"
              value={password} InputProps={inputText} />
          </div>
          <div className={classes.buttons}>
            <RssButton color={'skyblue'}
              onClick={this.handleLogin.bind(this)}
              classes={classes.button}>ログイン</RssButton>
          </div>
          <div className={classes.notice}>
            <Typography variant="body1" align="center"
              className={classes.text}>
            ・ログインＩＤ・ＰＷを忘れた場合はこちら
            </Typography>
          </div>
          <div className={classes.notice}>
            <Typography variant="subheading" align="center"
              className={classes.text}>
            新規ご利用の方：利用申し込み
            </Typography>
            <Typography variant="subheading" align="center"
              className={classes.text}>
            （＿＿について：＿）
            </Typography>
          </div>
        </div>
      </div>
    </div>;
  }
};

const loginWidth  = 640;
const loginHeight = 640;
const rowHeight = 62;
const styles = theme => ({
  root:       { display: 'flex', justifyContent: 'center'
              , alignItems: 'center', height: '100vh' }
, container:  { width: loginWidth, height: loginHeight
              , border: '1px solid #CCC', borderRadius: 4 }
, forms:      { display: 'flex', flexDirection: 'column'
              , justifyContent: 'center'
              , height: '100%'}
, title:      { padding: theme.spacing.unit *2
              , marginBottom: theme.spacing.unit *2
              , height: rowHeight }
, form:       { padding: 5, display: 'flex', flexDirection: 'row'
              , justifyContent: 'center', alignItems: 'center'
              , height: rowHeight, marginTop: theme.spacing.unit *2 }
, buttons:    { padding: theme.spacing.unit
              , display: 'flex', flexDirection: 'row'
              , justifyContent: 'center', alignItems: 'center'
              , height: rowHeight, marginTop: theme.spacing.unit *4 }
, button:     { width: '40%', height: '100%' }
, notice:     { padding: 5, display: 'flex', flexDirection: 'column'
              , justifyContent: 'center', alignItems: 'center'
              , height: rowHeight }
, text:       { padding: 5 }
, textRoot: { padding: 0
          , 'label + &': { marginTop: theme.spacing.unit * 3 } }
, textInput: { borderRadius: 4
          , backgroundColor: theme.palette.common.white
          , border: '1px solid #ced4da', fontSize: 16
          , padding: '10px 12px', width: 'calc(100% - 24px)'
          , transition:
            theme.transitions.create(['border-color', 'box-shadow'])
          , '&:focus': {
              borderColor: '#80bdff',
              boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)' } }
});
Login.displayName = 'Login';
Login.defaultProps = {};
Login.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Login));
