import loadable       from '@loadable/component';
import React                    from 'react';
import PropTypes                from 'prop-types';
import { Redirect, withRouter } from 'react-router-dom';
import LoginAction              from 'Actions/LoginAction';
import std                      from 'Utilities/stdutils';
import Spinner                  from 'Utilities/Spinner';

import { withStyles }           from '@material-ui/core/styles';
import { TextField, Typography, Divider }
                                from '@material-ui/core';
const RssButton = loadable(() => import('Components/RssButton/RssButton'));
const RssDialog = loadable(() => import('Components/RssDialog/RssDialog'));

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
    this.spn = Spinner.of('app');
    std.logInfo(InquiryEdit.displayName, 'fetch', 'Preference');
    this.spn.start();
    LoginAction.fetchPreference()
      .then(() => this.spn.stop());
  }

  componentWillUnmount() {
    this.spn.stop();
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
      this.spn.start();
      LoginAction.inquiry(user, { title, body })
        .then(() => this.setState({ isSuccess: true , redirectToReferer: true }))
        .then(() => this.spn.stop())
        .catch(err => {
          std.logError(InquiryEdit.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
          this.spn.stop();
        });
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
    //std.logInfo(InquiryEdit.displayName, 'Props', this.props);
    const { classes, preference } = this.props;
    const { redirectToReferer, title, body, isNotValid } = this.state;
    const inputText = { disableUnderline: true, classes: { root: classes.textRoot, input: classes.textInput } }
    return redirectToReferer
      ? ( <Redirect to={{ pathname: '/marchant' }} /> )
      : ( <div className={classes.container}>
        <div className={classes.inquiryForms}>
          <div className={classes.space} />
          <Typography variant="h4" align="center" className={classes.title}>Inquiry</Typography>
          <Typography variant="h5" align="center" className={classes.title}>Please list the contents of your inquiries below.</Typography>
          <Divider light className={classes.divider}/>
          <div className={classes.space} />
          <div className={classes.forms}>
            <div className={classes.form}>
              <TextField value={title} InputProps={inputText} placeholder="Title" onChange={this.handleChangeText.bind(this, 'title')}
                className={classes.input} />
            </div>
            <div className={classes.textArea}>
              <TextField multiline rows="10" value={body} InputProps={inputText} placeholder="Message"
                onChange={this.handleChangeText.bind(this, 'body')} className={classes.input} />
            </div>
            <div className={classes.buttons}>
              <RssButton color="white" onClick={this.handleInquiry.bind(this)} classes={classes.button}>Send Inquiry</RssButton>
              <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this)}>
                内容に不備があります。もう一度確認してください。
              </RssDialog>
            </div>
            <div className={classes.notice}>
              <Typography variant="caption" align="center" className={classes.notes}>
                お問い合わせ：{preference.from}（営業時間９時〜１８時）
              </Typography>
            </div>
          </div>
        </div>
      </div> );
  }
}
InquiryEdit.displayName = 'InquiryEdit';
InquiryEdit.defaultProps = {};
InquiryEdit.propTypes = {
  classes: PropTypes.object.isRequired
, user: PropTypes.string.isRequired
, preference: PropTypes.object.isRequired
};

const inquiryWidth = 640;
const rowHeight = 56;
const styles = theme => ({
  container:    { width: inquiryWidth, overflow: 'hidden' }
, inquiryForms: { display: 'flex', flexDirection: 'column'
                , justifyContent: 'center' }
, space:        { flex: 1, minHeight: theme.spacing.unit *2 }
, title:        { padding: theme.spacing.unit * 2, height: rowHeight
                , color: theme.palette.common.white }
, form:         { padding: theme.spacing.unit
                , display: 'flex', flexDirection: 'row'
                , justifyContent: 'center', alignItems: 'center'
                , height: rowHeight }
, textArea:     { padding: theme.spacing.unit
                , display: 'flex', flexDirection: 'row'
                , justifyContent: 'center', alignItems: 'center'
                , height: rowHeight*4 }
, buttons:      { padding: theme.spacing.unit
                , display: 'flex', flexDirection: 'row'
                , justifyContent: 'center', alignItems: 'center'
                , height: rowHeight }
, button:       { }
, divider:      { backgroundColor: theme.palette.common.white }
, input:        { flex: 1 }
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
, notice:       { padding: theme.spacing.unit
                , display: 'flex', flexDirection: 'column'
                , justifyContent: 'center', alignItems: 'center'
                , height: rowHeight }
, notes:        { flex: 1
                , color: theme.palette.common.white }
});
export default withStyles(styles)(withRouter(InquiryEdit));
