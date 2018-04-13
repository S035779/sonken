import React            from 'react';
import PropTypes        from 'prop-types';
import { Redirect, withRouter }
                        from 'react-router-dom';
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { TextField, Typography, Divider }
                        from 'material-ui';
import { FormControlLabel }
                        from 'material-ui/Form';
import { MenuItem }     from 'material-ui/Menu';
import { PersonAdd, Public, NetworkCheck } from 'material-ui-icons';
import RssButton        from 'Components/RssButton/RssButton';
import RssDialog        from 'Components/RssDialog/RssDialog';
import RssFullDialog    from 'Components/RssFullDialog/RssFullDialog';
import RssInput         from 'Components/RssInput/RssInput';
import RssCheckbox      from 'Components/RssCheckbox/RssCheckbox';
import agrPdf           from 'Assets/image/agreement.pdf';

const env = process.env.NODE_ENV || 'development';
const assets = process.env.ASSET_URL;
let image;
if(env === 'development') {
  image = assets;
} else
if(env === 'production' || env === 'staging') {
  image = assets + '/image';
}

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
    , openAgree:          false
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

  handleClickButton(request, event) {
    const { username, password, name, kana, email, phone, plan }
      = this.state;
    switch(request) {
      case 'registration':
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
        break;
      case 'agreement':
        this.setState({ openAgree: true });
        break;
    }
  }

  handleCloseDialog(name, event) {
    this.setState({ [name]: false });
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

  getRefferer(name) {
    const { menu } = this.props.preference;
    const plan = menu.find(_menu => _menu.name === name);
    return plan ? plan.link : null;
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
    const { username, password, confirm_password
      , name, kana, email, phone, plan, agreed
      , redirectToRefferer, isNotValid, openAgree } = this.state;
    const inputText = { disableUnderline: true
      , classes: { root: classes.textRoot, input: classes.textInput } }
    const renderItems = preference.menu ? preference.menu
      .map((item, idx) => this.renderItems(item, idx)) : [];
    if(redirectToRefferer) window.location = this.getRefferer(plan);
    return <div className={classes.container}>
      <div className={classes.loginForms}>
      <div className={classes.space} />
      <Typography variant="display1" align="center"
        className={classes.title}>RSS Reader !!</Typography>
      <Typography variant="headline" align="center"
        className={classes.title}>
      Register for free and experience the RSS reader today
      </Typography>
      <Divider light className={classes.divider}/>
      <div className={classes.space} />
      <div className={classes.column}>
      <div className={classes.description}>
        <div className={classes.media}>
          <PersonAdd className={classes.mediaLeft}/>
          <div className={classes.mediaBody}>
          <Typography variant="headline" align="left"
            gutterBottom paragraph
            className={classes.sentence}>Free Account</Typography>
          <Typography variant="subheading" align="left"
            gutterBottom paragraph
            className={classes.sentence}>
            Here you can write a feature description for your dashboard, 
            let the users know what is the value that you give them.
          </Typography>
          </div>
        </div>
        <div className={classes.media}>
          <NetworkCheck className={classes.mediaLeft}/>
          <div className={classes.mediaBody}>
          <Typography variant="headline" align="left"
            gutterBottom paragraph
            className={classes.sentence}>Awesome Performances</Typography>
          <Typography variant="subheading" align="left"
            gutterBottom paragraph
            className={classes.sentence}>
            Here you can write a feature description for your dashboard, 
            let the users know what is the value that you give them.
          </Typography>
          </div>
        </div>
        <div className={classes.media}>
          <Public className={classes.mediaLeft}/>
          <div className={classes.mediaBody}>
          <Typography variant="headline" align="left"
            gutterBottom paragraph
            className={classes.sentence}>Global Support</Typography>
          <Typography variant="subheading" align="left"
            gutterBottom paragraph
            className={classes.sentence}>
            Here you can write a feature description for your dashboard, 
            let the users know what is the value that you give them.
          </Typography>
          </div>
        </div>
      </div>
      <div className={classes.forms}>
        <div className={classes.form}>
          <TextField
            value={name} InputProps={inputText}
            placeholder="Your Name"
            onChange={this.handleChangeText.bind(this, 'name')}
            className={classes.input} />
        </div>
        <div className={classes.form}>
          <TextField
            value={kana} InputProps={inputText}
            placeholder="Your Name (kana)"
            onChange={this.handleChangeText.bind(this, 'kana')}
            className={classes.input} />
        </div>
        <div className={classes.form}>
          <TextField
            value={email} InputProps={inputText}
            placeholder="Enter E-mail address"
            onChange={this.handleChangeText.bind(this, 'email')}
            className={classes.input} />
        </div>
        <div className={classes.form}>
          <TextField
            value={phone} InputProps={inputText}
            placeholder="Phone number"
            onChange={this.handleChangeText.bind(this, 'phone')}
            className={classes.input} />
        </div>
        <div className={classes.form}>
          <TextField
            value={username} InputProps={inputText}
            placeholder="Request user ID"
            onChange={this.handleChangeText.bind(this, 'username')}
            className={classes.input} />
        </div>
        <div className={classes.form}>
          <TextField type="password"
            value={password} InputProps={inputText}
            placeholder="Password"
            onChange={this.handleChangeText.bind(this, 'password')}
            className={classes.input} />
        </div>
        <div className={classes.form}>
          <TextField type="password"
            value={confirm_password} InputProps={inputText}
            placeholder="Password confirmation"
            onChange={this.handleChangeText.bind(this, 'confirm_password')}
            className={classes.input} />
        </div>
        <div className={classes.form}>
          <TextField select
            value={plan} InputProps={inputText}
            placeholder="Select Plan menu"
            onChange={this.handleChangeText.bind(this, 'plan')}
            className={classes.input}>
            {renderItems}
          </TextField>
        </div>
        <div className={classes.form}>
          <FormControlLabel control={<RssCheckbox color="secondary"
              checked={agreed}
              onChange={this.handleChangeCheckbox.bind(this, 'agreed')} />
            }
            label="規約に同意する" />
          <RssButton color="flatWhite"
            onClick={this.handleClickButton.bind(this, 'agreement')}
          >利用規約を表示</RssButton>
        </div>
        <div className={classes.buttons}>
          <RssButton color="white"
            onClick={this.handleClickButton.bind(this, 'registration')}
            classes={classes.button}>Create Account</RssButton>
          <RssDialog open={isNotValid} title={'送信エラー'}
            onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
            内容に不備があります。もう一度確認してください。
          </RssDialog>
          <RssFullDialog open={openAgree} title={'Agreement'}
            onClose={this.handleCloseDialog.bind(this, 'openAgree')}>
            <iframe src={image + agrPdf} className={classes.pdf}/>
          </RssFullDialog>
        </div>
      </div>
      </div>
      <div className={classes.space} />
      </div>
    </div>;
  }
};

const loginWidth = 640;
const rowHeight = 56;
const styles = theme => ({
  container:  { width: loginWidth, overflow: 'scroll'  }
, loginForms: { display: 'flex', flexDirection: 'column'
              , justifyContent: 'center' }
, space:      { flex: 1, minHeight: theme.spacing.unit *2 }
, title:      { padding: theme.spacing.unit * 2, height: rowHeight
              , color: theme.palette.common.white }
, form:       { padding: theme.spacing.unit
              , display: 'flex', flexDirection: 'row'
              , justifyContent: 'center', alignItems: 'center'
              , height: rowHeight }
, buttons:    { padding: theme.spacing.unit
              , display: 'flex', flexDirection: 'row'
              , justifyContent: 'center', alignItems: 'center'
              , height: rowHeight }
, button:     { }
, divider:    { backgroundColor: theme.palette.common.white }
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
                  borderColor: theme.palette.primary.main
                , boxShadow: '0 0 0 0.2rem '
                    + std.toRGBa(theme.palette.primary.main, 0.25)
              }}
, column:     { display: 'flex', flexDirection: 'row' }
, description:{ flex: 1 }
, forms:      { flex: 1 }
, sentence:   { color: theme.palette.common.white }
, media:      { display: 'flex', alignItems: 'flex-start' }
, mediaLeft:  { display: 'table-cell', verticalAlign: 'top'
              , fontSize: 32, color: theme.palette.common.white}
, mediaBody:  { display: 'table-cell', verticalAlign: 'top', flex: 1
              , marginLeft: theme.spacing.unit *2 }
, pdf:        { width: '100%', border: 0, height: '100%' }
});
LoginRegist.displayName = 'LoginRegist';
LoginRegist.defaultProps = {};
LoginRegist.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(LoginRegist));
