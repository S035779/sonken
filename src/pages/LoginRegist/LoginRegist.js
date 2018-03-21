import React            from 'react';
import PropTypes        from 'prop-types';
import { Redirect, withRouter }
                        from 'react-router-dom';
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { TextField, Typography, Checkbox }
                        from 'material-ui';
import { FormControlLabel }
                        from 'material-ui/Form';
import { MenuItem }     from 'material-ui/Menu';
import RssButton        from 'Components/RssButton/RssButton';
import RssDialog        from 'Components/RssDialog/RssDialog';

class LoginRegist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToRefferer: false
    , username:           ''
    , password:           ''
    , confirm_password:   ''
    , name:               ''
    , kana:               ''
    , email:              ''
    , phone:              ''
    , plan:               ''
    , agreed:             false
    , isNotValid:         false
    };
  }

  componentDidMount() {
    std.logInfo(LoginRegist.displayName, 'fetch', 'Preference');
    LoginAction.fetchPreference();
  }

  handleChangeText(name, event) {
    this.setState({ [name] : event.target.value });
  }

  handleChangeCheckbox(name, event) {
    this.setState({ [name]: event.target.checked });
  }

  handleRegist() {
    const { username, password, name, kana, email, phone, plan }
      = this.state;
    if(this.isValidate()) {
      LoginAction.registration(username, password
        , { name, kana, email, phone, plan })
        .then(() => LoginAction.presetUser(username))
        .then(() => {
          if(this.props.isAuthenticated)
            this.setState({ redirectToRefferer: true });
        })
        .catch(err => this.setState({ isNotValid: true }));
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleCloseDialog() {
    this.setState({ isNotValid: false });
  }

  isValidate() {
    const { username, password, confirm_password, name, kana, email, phone
      , plan, agreed } = this.state;
    return (
      password === confirm_password
      && username !== '' && name !=='' && kana !==''
      && std.regexEmail(email) && std.regexNumber(phone) && plan !==''
      && agreed
    );
  }

  renderItems(item, idx) {
    return <MenuItem value={item.name} key={idx}>
      {item.name}（上限数：{item.number}）
    </MenuItem>;
  }

  render() {
    //std.logInfo(LoginRegist.displayName, 'State', this.state);
    std.logInfo(LoginRegist.displayName, 'Props', this.props);
    const { classes, location, preference } = this.props;
    const {
      redirectToRefferer, username, password, confirm_password, name, kana
    , email, phone, plan, agreed, isNotValid
    } = this.state;
    const inputText = { disableUnderline: true
      , classes: { root: classes.textRoot, input: classes.textInput } }
    const inputSelect = { MenuProps: { className: classes.menu } };
    const to = { pathname: '/marchant' };
    const renderItems = preference.menu ? preference.menu
      .map((item, idx) => this.renderItems(item, idx)) : [];
    if(redirectToRefferer) return <Redirect to={to} />;
    return <div className={classes.loginForms}>
      <div className={classes.space} />
      <Typography variant="title" align="center"
        className={classes.title}>新規ご利用申し込み</Typography>
      <div className={classes.space} />
      <div className={classes.form}>
        <Typography variant="body2" align="center"
          className={classes.text}>氏名</Typography>
        <TextField
          value={name} InputProps={inputText}
          onChange={this.handleChangeText.bind(this, 'name')}
          className={classes.input} />
        <div className={classes.space} />
      </div>
      <div className={classes.form}>
        <Typography variant="body2" align="center"
          className={classes.text}>氏名（カナ）</Typography>
        <TextField
          value={kana} InputProps={inputText}
          onChange={this.handleChangeText.bind(this, 'kana')}
          className={classes.input} />
        <div className={classes.space} />
      </div>
      <div className={classes.form}>
        <Typography variant="body2" align="center"
          className={classes.text}>連絡先メールアドレス</Typography>
        <TextField
          value={email} InputProps={inputText}
          onChange={this.handleChangeText.bind(this, 'email')}
          className={classes.input} />
        <div className={classes.space} />
      </div>
      <div className={classes.form}>
        <Typography variant="body2" align="center"
          className={classes.text}>連絡先電話番号</Typography>
        <TextField
          value={phone} InputProps={inputText}
          onChange={this.handleChangeText.bind(this, 'phone')}
          className={classes.input} />
        <div className={classes.space} />
      </div>
      <div className={classes.form}>
        <Typography variant="body2" align="center"
          className={classes.text}>ログインＩＤ</Typography>
        <TextField
          value={username} InputProps={inputText}
          onChange={this.handleChangeText.bind(this, 'username')}
          className={classes.input} />
        <div className={classes.space} />
      </div>
      <div className={classes.form}>
        <Typography variant="body2" align="center"
          className={classes.text}>ログインＰＷ</Typography>
        <TextField type="password"
          value={password} InputProps={inputText}
          onChange={this.handleChangeText.bind(this, 'password')}
          className={classes.input} />
        <div className={classes.space} />
      </div>
      <div className={classes.form}>
        <Typography variant="body2" align="center"
          className={classes.text}>ログインＰＷ（再確認）</Typography>
        <TextField type="password"
          value={confirm_password} InputProps={inputText}
          onChange={this.handleChangeText.bind(this, 'confirm_password')}
          className={classes.input} />
        <div className={classes.space} />
      </div>
      <div className={classes.form}>
        <Typography variant="body2" align="center"
          className={classes.text}>申し込みプラン</Typography>
        <TextField select
          value={plan} InputProps={inputText} SelectProps={inputSelect}
          onChange={this.handleChangeText.bind(this, 'plan')}
          className={classes.input}>
          {renderItems}
        </TextField>
        <div className={classes.space} />
      </div>
      <div className={classes.form}>
        <Typography variant="body2" align="center"
          className={classes.text}>利用規約</Typography>
      </div>
      <div className={classes.term}>
        <div className={classes.agreement} />
      </div>
      <div className={classes.form}>
        <Checkbox color="primary"
          checked={agreed}
          onChange={this.handleChangeCheckbox.bind(this, 'agreed')} />
        <Typography variant="body2" align="center"
          className={classes.text}>利用規約に同意しました。</Typography>
      </div>
      <div className={classes.space} />
      <div className={classes.buttons}>
        <div className={classes.space} />
        <RssButton color={'skyblue'}
          onClick={this.handleRegist.bind(this)}
          classes={classes.button}>利用申し込み</RssButton>
        <RssDialog open={isNotValid} title={'送信エラー'}
          onClose={this.handleCloseDialog.bind(this)}>
        内容に不備があります。もう一度確認してください。
        </RssDialog>
        <div className={classes.space} />
      </div>
      <div className={classes.notice}>
        <Typography variant="caption" align="center"
          className={classes.notes}>
        決済画面に移動します。
        </Typography>
      </div>
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
, menu:       { width: 200 }
, term:       { display: 'flex', flexDirection: 'row'
              , justifyContent: 'center', alignItems: 'center'
              , height: rowHeight * 2 }
, agreement:  { padding: theme.spacing.unit
              , border: '1px solid #CCC', borderRadius: 4
              , height: '100%', width: '100%' }
, buttons:    { padding: theme.spacing.unit
              , display: 'flex', flexDirection: 'row'
              , justifyContent: 'center', alignItems: 'center'
              , height: rowHeight }
, button:     { flex: 1, height: '100%' }
, notice:     { padding: theme.spacing.unit
              , display: 'flex', flexDirection: 'column'
              , justifyContent: 'center', alignItems: 'center'
              , height: rowHeight }
, text:       { flex: 1, textAlign: 'left' }
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
                borderColor: '#80bdff',
                boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)' } }
});
LoginRegist.displayName = 'LoginRegist';
LoginRegist.defaultProps = {};
LoginRegist.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(LoginRegist));
