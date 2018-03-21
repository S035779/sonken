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

class InquiryEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToReferer:  false
    , title:              ''
    , body:               ''
    , isSuccess:          false
    , isNotValid:         false
    };
  }

  componentDidMount() {
    std.logInfo(InquiryEdit.displayName, 'fetch', 'Preference');
    LoginAction.fetchPreference();
  }

  handleChangeText(name, event) {
    this.setState({ [name] : event.target.value });
  }

  handleChangeCheckbox(name, event) {
    this.setState({ [name]: event.target.checked });
  }

  handleInquiry() {
    const { title, body } = this.state;
    const { user } = this.props;
    if(this.isValidate()) {
      LoginAction.inquiry(user, { title, body })
        .then(() =>
          this.setState({ isSuccess: true , redirectToReferer: true }))
        .catch(err => this.setState({ isNotValid: true }));
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleCloseDialog() {
    this.setState({ isNotValid: false });
  }

  isValidate() {
    const { title, body } = this.state;
    return  title !== '' && body !== '';
  }

  render() {
    //std.logInfo(InquiryEdit.displayName, 'State', this.state);
    std.logInfo(InquiryEdit.displayName, 'Props', this.props);
    const { classes, location, isAuthenticated, preference } = this.props;
    const { redirectToReferer, title, body, isNotValid } = this.state;
    const inputText = { disableUnderline: true
      , classes: { root: classes.textRoot, input: classes.textInput } }
    const inputSelect = { MenuProps: { className: classes.menu } };
    const from = location.state || { pathname: '/marchant' };
    if(!isAuthenticated) {
      return <Redirect to={{
        pathname: '/login/authenticate', state: { from: location } }} />;
    }
    if(redirectToReferer) return <Redirect to={from} />
    return <div className={classes.inquiryForms}>
      <div className={classes.space} />
      <Typography variant="title" align="center"
        className={classes.title}>お問い合わせ</Typography>
      <div className={classes.space} />
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
        お問い合わせ：{preference.from}（営業時間９時〜１８時）
        </Typography>
      </div>
    </div>;
  }
};

const rowHeight = 62;
const styles = theme => ({
  inquiryForms: { display: 'flex', flexDirection: 'column'
                , justifyContent: 'center', height: '100%'}
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
InquiryEdit.displayName = 'InquiryEdit';
InquiryEdit.defaultProps = {};
InquiryEdit.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(InquiryEdit));
