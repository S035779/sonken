import React            from 'react';
import PropTypes        from 'prop-types';
import { Redirect, withRouter }
                        from 'react-router-dom';
import MailAction       from 'Actions/MailAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { TextField, Typography, Checkbox }
                        from 'material-ui';
import { FormControlLabel }
                        from 'material-ui/Form';
import { MenuItem }     from 'material-ui/Menu';
import RssButton        from 'Components/RssButton/RssButton';
import RssDialog        from 'Components/RssDialog/RssDialog';

class Inquiry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToReferer: false
    , username: ''
    , email: ''
    , plan: ''
    , title: ''
    , body: ''
    , isNotValid: false
    };
  }

  handleChangeText(name, event) {
    this.setState({ [name] : event.target.value });
  }

  handleChangeCheckbox(name, event) {
    this.setState({ [name]: event.target.checked });
  }

  handleInquiry() {
    const { username, email, plan }
      = this.state;
    if(this.isValidate()) {
      MailAction.sendmail(username, { email, plan, title, body })
        .then(() => this.setState({ redirectToReferer: true }))
        .catch(err => this.setState({ isNotValid: true }));
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleCloseDialog() {
    this.setState({ isNotValid: false });
  }

  isValidate() {
    const { username, email, plan, title, body } = this.state;
    return (username !== '' && std.regexEmail(email) && plan !==''
      && title !== '' && body !== '');
  }

  render() {
    std.logInfo(Inquiry.displayName, 'Props', this.props);
    std.logInfo(Inquiry.displayName, 'State', this.state);
    const { classes, location } = this.props;
    const { redirectToReferer
      , username, email, plan, title, body, isNotValid } = this.state;
    const inputText = { disableUnderline: true
      , classes: { root: classes.textRoot, input: classes.textInput } }
    const inputSelect = { MenuProps: { className: classes.menu } };
    const from = location.state || { pathname: '/marchant' };
    if(redirectToReferer) return <Redirect to={from} />
    return <div className={classes.inquiryFrame}>
      <div className={classes.drawArea}>
      <div className={classes._space}/>
      <div className={classes.container}>
      <div className={classes.inquiryForms}>
        <div className={classes.space} />
        <Typography variant="title" align="center"
          className={classes.title}>お問い合わせ</Typography>
        <div className={classes.space} />
        <div className={classes.form}>
          <Typography variant="body2" align="center"
            className={classes.text}>連絡先メールアドレス</Typography>
          <TextField
            value={email} InputProps={inputText}
            onChange={this.handleChangeText.bind(this, 'email')}
            className={classes.input} />
        </div>
        <div className={classes.form}>
          <Typography variant="body2" align="center"
            className={classes.text}>ログインＩＤ</Typography>
          <TextField
            value={username} InputProps={inputText}
            onChange={this.handleChangeText.bind(this, 'username')}
            className={classes.input} />
        </div>
        <div className={classes.form}>
          <Typography variant="body2" align="center"
            className={classes.text}>申し込みプラン</Typography>
          <TextField select
            value={plan} InputProps={inputText} SelectProps={inputSelect}
            onChange={this.handleChangeText.bind(this, 'plan')}
            className={classes.input}>
            <MenuItem value={'plan_A'}>Plan A</MenuItem>
            <MenuItem value={'plan_B'}>Plan B</MenuItem>
            <MenuItem value={'plan_C'}>Plan C</MenuItem>
          </TextField>
        </div>
        <div className={classes.form}>
          <Typography variant="body2" align="center"
            className={classes.text}>タイトル</Typography>
          <TextField
            value={title} InputProps={inputText}
            onChange={this.handleChangeText.bind(this, 'title')}
            className={classes.input} />
        </div>
        <div className={classes._form}>
          <Typography variant="body2" align="center"
            className={classes.text}>問合せ内容</Typography>
          <TextField multiline rows="10"
            value={body} InputProps={inputText}
            onChange={this.handleChangeText.bind(this, 'body')}
            className={classes.input} />
        </div>
        <div className={classes.space} />
        <div className={classes.buttons}>
          <div className={classes.space} />
          <RssButton color={'skyblue'}
            onClick={this.handleInquiry.bind(this)}
            classes={classes.button}>送信</RssButton>
          <RssDialog open={isNotValid} title={'送信エラー'}
            onClose={this.handleCloseDialog.bind(this)}>
          内容に不備があります。もう一度確認してください。
          </RssDialog>
          <div className={classes.space} />
        </div>
        <div className={classes.notice}>
          <Typography variant="caption" align="center"
            className={classes.notes}>
          お問い合わせ：info@example.com（営業時間９時〜１８時）
          </Typography>
        </div>
      </div>
      </div>
      <div className={classes._space}/>
      </div>
    </div>;
  }
};

const inquiryWidth = 640;
const inquiryHeight = 800;
const rowHeight = 62;
const styles = theme => ({
  inquiryFrame: { display: 'flex', flexDirection: 'column'
                , justifyContent: 'center', alignItems: 'center'
                , height: '100vh' }
, drawArea:     { height: '100%', overFlow: 'scroll' }
, container:    { width: inquiryWidth, height: inquiryHeight
                , border: '1px solid #CCC', borderRadius: 4
                , paddingLeft: theme.spacing.unit * 4
                , paddingRight: theme.spacing.unit *4 }
, inquiryForms: { display: 'flex', flexDirection: 'column'
                , justifyContent: 'center', height: '100%'}
, _space:       { minHeight: '5%' }
, space:        { flex: 1, minHeight: '5%' }
, title:        { padding: theme.spacing.unit * 2, height: rowHeight }
, _form:        { padding: theme.spacing.unit
                , display: 'flex', flexDirection: 'row'
                , justifyContent: 'center', alignItems: 'center'
                , height: rowHeight*4 }
, form:         { padding: theme.spacing.unit
                , display: 'flex', flexDirection: 'row'
                , justifyContent: 'center', alignItems: 'center'
                , height: rowHeight }
, menu:         { width: 200 }
, term:         { display: 'flex', flexDirection: 'row'
                , justifyContent: 'center', alignItems: 'center'
                , height: rowHeight * 2 }
, buttons:      { padding: theme.spacing.unit
                , display: 'flex', flexDirection: 'row'
                , justifyContent: 'center', alignItems: 'center'
                , height: rowHeight }
, button:       { flex: 1, height: '100%' }
, notice:       { padding: theme.spacing.unit
                , display: 'flex', flexDirection: 'column'
                , justifyContent: 'center', alignItems: 'center'
                , height: rowHeight }
, text:         { flex: 1, textAlign: 'left' }
, notes:        { flex: 1 }
, input:        { flex: 2 }
, textRoot:     { padding: 0
                , 'label + &': { marginTop: theme.spacing.unit * 3 } }
, textInput:    { borderRadius: 4
                , backgroundColor: theme.palette.common.white
                , border: '1px solid #ced4da', fontSize: 16
                , padding: '10px 12px', width: 'calc(100% - 24px)'
                , transition:
                  theme.transitions.create(['border-color', 'box-shadow'])
                , '&:focus': {
                  borderColor: '#80bdff',
                  boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)' } }
});
Inquiry.displayName = 'Inquiry';
Inquiry.defaultProps = {};
Inquiry.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Inquiry);
