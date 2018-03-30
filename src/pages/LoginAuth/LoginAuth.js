import React            from 'react';
import PropTypes        from 'prop-types';
import { Redirect, withRouter, Link }
                        from 'react-router-dom';
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { TextField, Typography, Button, Checkbox, FormControlLabel }
                        from 'material-ui';
import RssButton        from 'Components/RssButton/RssButton';
import RssDialog        from 'Components/RssDialog/RssDialog';
import RssInput         from 'Components/RssInput/RssInput';
import RssCheckbox      from 'Components/RssCheckbox/RssCheckbox';

class LoginAuth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToRefferer: false
    , redirectToManagement: false
    , username: ''
    , password: ''
    , checked: false
    , isNotValid: false
    };
  }

  handleLogin() {
    const { username, password, checked } = this.state;
    LoginAction.authenticate(username, password, checked)
      .then(() => {
        if(this.props.isAuthenticated) {
          if(checked) return LoginAction.presetAdmin(username);
          else        return LoginAction.presetUser(username);
        } else {
          this.setState({ isNotValid: true });
          return null;
        }
      })
      .then(() => {
        if(this.props.isAuthenticated) {
          if(checked) this.setState({ redirectToManagement: true });
          else        this.setState({ redirectToRefferer: true });
        }
      })
      .catch(err => {
        this.setState({ isNotValid: true });
      });
  }

  handleChangeText(name, event) {
    this.setState({ [name]: event.target.value });
  }

  handleChangeCheckbox(name, event) {
    this.setState({ [name]: event.target.checked });
  }

  handleCloseDialog() {
    this.setState({ isNotValid: false });
  }

  render() {
    //std.logInfo(LoginAuth.displayName, 'State', this.state);
    std.logInfo(LoginAuth.displayName, 'Props', this.props);
    const { classes, location } = this.props;
    const { redirectToRefferer, redirectToManagement, username, password
      , checked, isNotValid } = this.state;
    const from = location.state || { pathname: '/marchant' };
    const admin = { pathname: '/admin/users' };
    if(redirectToRefferer) return <Redirect to={from} />;
    if(redirectToManagement) return <Redirect to={admin} />;

    return <div className={classes.container}>
     <div className={classes.loginForms}>
      <div className={classes.space}/>
      <Typography variant="headline" align="center"
        className={classes.title}>Login</Typography>
      <div className={classes.space}/>
      <div className={classes.form}>
        <RssInput label="USER ID" value={username}
          placeholder="Enter User ID"
          onChange={this.handleChangeText.bind(this, 'username')}
          className={classes.input}/>
      </div>
      <div className={classes.form}>
        <RssInput type="password" label="PASSWORD" value={password}
          placeholder="Password"
          onChange={this.handleChangeText.bind(this, 'password')}
          className={classes.input}/>
      </div>
      <div className={classes.form}>
        <FormControlLabel
          control={
            <RssCheckbox color="secondary"
              checked={checked}
              onChange={this.handleChangeCheckbox.bind(this, 'checked')}/>
          }
          label="管理者ログイン"
        />
      </div>
      <div className={classes.buttons}>
        <div className={classes.space}/>
        <RssButton color="warning"
          onClick={this.handleLogin.bind(this)}
          className={classes.button}>Login</RssButton>
        <RssDialog open={isNotValid} title={'送信エラー'}
          onClose={this.handleCloseDialog.bind(this)}>
          内容に不備があります。もう一度確認してください。
        </RssDialog>
        <div className={classes.space}/>
      </div>
      <div className={classes.space}/>
      </div>
    </div>;
  }
};

const loginWidth  = 320;
const loginHeight = 480;
const rowHeight = 88;
const styles = theme => ({
  container:  { width: loginWidth, height: loginHeight
              , border: '1px solid #CCC', borderRadius: 8
              , backgroundColor: theme.palette.common.white
              , padding: theme.spacing.unit *3 }
, loginForms: { display: 'flex', flexDirection: 'column'
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
, button:     { flex: 1 }
, input:      { flex: 1 }
});
LoginAuth.displayName = 'LoginAuth';
LoginAuth.defaultProps = {};
LoginAuth.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(LoginAuth));
