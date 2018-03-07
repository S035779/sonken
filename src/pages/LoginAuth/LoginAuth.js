import React            from 'react';
import PropTypes        from 'prop-types';
import { Redirect, withRouter, Link }
                        from 'react-router-dom';
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { TextField, Typography, Button }
                        from 'material-ui';
import RssButton        from 'Components/RssButton/RssButton';

class LoginAuth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToRefferer: false
    , username: ''
    , password: ''
    };
  }

  handleLogin() {
    const { username, password } = this.state;
    LoginAction.authenticate(username, password)
      .then(() => LoginAction.presetUser(username))
      .then(() => {
        if(this.props.isAuthenticated)
          this.setState({ redirectToRefferer: true });
      });
  }

  handleChangeText(name, event) {
    this.setState({ [name]: event.target.value });
  }

  render() {
    std.logInfo('Props', this.props);
    std.logInfo('State', this.state);
    const { classes, location } = this.props;
    const { redirectToRefferer, username, password } = this.state;
    const inputText = { disableUnderline: true
      , classes: { root: classes.textRoot, input: classes.textInput } }
    const from = location.state || { pathname: '/marchant' };
    if(redirectToRefferer) return <Redirect to={from} />;
    return <div className={classes.loginForms}>
      <div className={classes.space}/>
      <Typography variant="headline" align="center"
        className={classes.title}>ヤフオク！RSSリーダー</Typography>
      <div className={classes.space}/>
      <div className={classes.form}>
        <Typography variant="body2" align="center"
          className={classes.text}>ログインＩＤ</Typography>
        <TextField
          value={username} InputProps={inputText}
          onChange={this.handleChangeText.bind(this, 'username')}
          className={classes.input}/>
        <div className={classes.space}/>
      </div>
      <div className={classes.form}>
        <Typography variant="body2" align="center"
          className={classes.text}>ログインＰＷ</Typography>
        <TextField type="password"
          value={password} InputProps={inputText}
          onChange={this.handleChangeText.bind(this, 'password')}
          className={classes.input}/>
        <div className={classes.space}/>
      </div>
      <div className={classes.space}/>
      <div className={classes.buttons}>
        <div className={classes.space}/>
        <RssButton color={'skyblue'}
          onClick={this.handleLogin.bind(this)}
          classes={classes.button}>ログイン</RssButton>
        <div className={classes.space}/>
      </div>
      <div className={classes.notice}>
        <Typography variant="caption" align="center"
          className={classes.notes}>
        ログインＩＤ・ＰＷを忘れた場合は
        <Button mini size="small" variant="flat" color="primary"
          component={Link} to="/login/confirmation">こちら</Button>
        </Typography>
      </div>
      <div className={classes.notice}>
        <Typography variant="body1" align="center"
          className={classes.notes}>
        新規ご利用の方：
        <Button mini size="small" variant="flat" color="primary"
          component={Link} to="/login/registration">利用申し込み</Button>
        </Typography>
        <Typography variant="body1" align="center"
          className={classes.notes}>
        （＿＿について：＿）
        </Typography>
      </div>
      <div className={classes.space}/>
    </div>;
  }
};

const rowHeight = 62;
const styles = theme => ({
  loginForms: { display: 'flex', flexDirection: 'column'
              , justifyContent: 'center', height: '100%' }
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
LoginAuth.displayName = 'LoginAuth';
LoginAuth.defaultProps = {};
LoginAuth.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(LoginAuth));
