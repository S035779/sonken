import React            from 'react';
import PropTypes        from 'prop-types';
import { Redirect, withRouter, Link }
                        from 'react-router-dom';
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import { Typography, FormControlLabel } from '@material-ui/core';
import RssButton        from 'Components/RssButton/RssButton';
import RssDialog        from 'Components/RssDialog/RssDialog';
import RssInput         from 'Components/RssInput/RssInput';
import RssCheckbox      from 'Components/RssCheckbox/RssCheckbox';

class LoginMgmt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToManagement: false
    , username: ''
    , password: ''
    , checked: false
    , isNotValid: false
    };
  }

  handleLogin(event) {
    event.preventDefault();
    const { username, password, checked } = this.state;
    LoginAction.authenticate(username, password, true, checked)
      .then(() => this.props.isAuthenticated ? LoginAction.presetAdmin(username) : this.setState({ isNotValid: true }))
      .then(() => this.props.isAuthenticated ? this.setState({ redirectToManagement: true }) : null)
      .catch(err => {
        std.logError(LoginMgmt.displayName, err.name, err.message);
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
    //std.logInfo(LoginMgmt.displayName, 'State', this.state);
    //std.logInfo(LoginMgmt.displayName, 'Props', this.props);
    const { classes } = this.props;
    const { redirectToManagement, username, password, checked, isNotValid } = this.state;
    return redirectToManagement
      ? ( <Redirect to={{ pathname: '/admin/users' }} /> )
      : ( <div className={classes.container}>
        <form className={classes.loginForms} onSubmit={this.handleLogin.bind(this)}>
          <div className={classes.space}/>
          <Typography variant="h5" align="center" className={classes.title}>Login</Typography>
          <div className={classes.space}/>
          <div className={classes.form}>
            <RssInput type="text" label="USER ID" value={username} placeholder="Enter User ID"
              onChange={this.handleChangeText.bind(this, 'username')} className={classes.input}/>
          </div>
          <div className={classes.form}>
            <RssInput type="password" label="PASSWORD" value={password} placeholder="Password"
              onChange={this.handleChangeText.bind(this, 'password')} className={classes.input}/>
          </div>
          <div className={classes.form}>
            <FormControlLabel control={<RssCheckbox color="secondary" checked={checked}
                  onChange={this.handleChangeCheckbox.bind(this, 'checked')} />} label="ＩＤ・ＰＷを保存" />
          </div>
          <div className={classes.form}>
            <RssButton color="flatDefault" id="confirmation" classes={classes.confirm}
              component={Link} to="/login/confirmation">ログインＩＤ・ＰＷを忘れた場合は こちら</RssButton>
          </div>
          <div className={classes.buttons}>
            <div className={classes.space}/>
            <RssButton type="submit" color="warning" className={classes.button}>Login</RssButton>
            <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this)}>
              内容に不備があります。もう一度確認してください。
            </RssDialog>
            <div className={classes.space}/>
          </div>
          <div className={classes.space}/>
        </form>
      </div> );
  }
}
LoginMgmt.displayName = 'LoginMgmt';
LoginMgmt.defaultProps = {};
LoginMgmt.propTypes = { classes: PropTypes.object.isRequired, isAuthenticated: PropTypes.bool.isRequired };
const loginWidth  = 320;
const loginHeight = 480;
const rowHeight = 88;
const styles = theme => ({
  container:  { width: loginWidth, height: loginHeight, border: '1px solid #CCC', borderRadius: 8
              , backgroundColor: theme.palette.common.white, padding: theme.spacing.unit *3 }
, loginForms: { display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }
, space:      { flex: 1 }
, title:      { padding: theme.spacing.unit * 2, height: rowHeight }
, form:       { padding: theme.spacing.unit, display: 'flex', flexDirection: 'row'
              , justifyContent: 'center', alignItems: 'center', height: rowHeight }
, buttons:    { padding: theme.spacing.unit, display: 'flex', flexDirection: 'row'
              , justifyContent: 'center', alignItems: 'center', height: rowHeight }
, button:     { flex: 1 }
, input:      { flex: 1 }
, confirm:    { fontSize: 10 }
});
export default withStyles(styles)(withRouter(LoginMgmt));
