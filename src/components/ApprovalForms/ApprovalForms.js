import * as R           from 'ramda';
import React            from 'react';
import PropTypes        from 'prop-types';
import UserAction       from 'Actions/UserAction';
import std              from 'Utilities/stdutils';
import Spinner          from 'Utilities/Spinner';

import { withStyles }   from '@material-ui/core/styles';
import { Typography }   from '@material-ui/core';
import RssDialog        from 'Components/RssDialog/RssDialog';
import RssButton        from 'Components/RssButton/RssButton';

class ApprovalForms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user:               props.user
    , isSuccess:          false
    , isNotValid:         false
    };
    this.spn = Spinner.of('app');
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(ApprovalForms.displayName, 'Props', nextProps);
    this.setState({ user: nextProps.user });
  }

  handleChangeInput(name, event) {
    const { user } = this.state;
    this.setState({ user: R.merge(user, { [name]: event.target.value }) });
  }

  handleApproval() {
    const { admin } = this.props;
    const { user } = this.state;
    this.spn.start();
    std.logInfo(ApprovalForms.displayName, 'handleApproval', user.user);
    UserAction.createApproval(admin, [user._id])
      .then(() => this.setState({ isSuccess: true }))
      .then(() => this.spn.stop())
      .catch(err => {
        std.logError(ApprovalForms.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        this.spn.stop();
      });
  }

  handleNotApproval() {
    const { admin } = this.props;
    const { user } = this.state;
    this.spn.start();
    std.logInfo(ApprovalForms.displayName, 'handleNotApproval', user.user);
    UserAction.deleteApproval(admin, [user._id])
      .then(() => this.setState({ isSuccess: true }))
      .then(() => this.spn.stop())
      .catch(err => {
        std.logError(ApprovalForms.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        this.spn.stop();
      });
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  render() {
    //std.logInfo(ApprovalForms.displayName, 'State', this.state);
    const { classes } = this.props;
    const { isNotValid, isSuccess } = this.state;
    const { user, name, kana, email, phone, plan } = this.state.user;
    const { menu } = this.props.preference;
    const primary = 'skyblue';
    const secondary = 'orange';
    const title = `${name} (${user})`;
    const planName = menu ? menu.find(obj => obj.id === plan).name : 'N/A';
    return <div className={classes.forms}>
      <div className={classes.edit}>
        <Typography variant="h6" noWrap className={classes.title}>{title}</Typography>
        <div className={classes.buttons}>
          <RssButton color={primary} onClick={this.handleApproval.bind(this)} classes={classes.button}>承認する</RssButton>
          <RssButton color={secondary} onClick={this.handleNotApproval.bind(this)} classes={classes.button}>非承認</RssButton>
          <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
            内容に不備があります。もう一度確認してください。
          </RssDialog>
          <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
            要求を受け付けました。
          </RssDialog>
        </div>
      </div>
      <div className={classes.edit}>
        <Typography variant="subtitle1" noWrap className={classes.title}>氏名</Typography>
        <Typography variant="subtitle1" noWrap className={classes.title}>{name}</Typography>
      </div>
      <div className={classes.edit}>
        <Typography variant="subtitle1" noWrap className={classes.title}>氏名（カナ）</Typography>
        <Typography variant="subtitle1" noWrap className={classes.title}>{kana}</Typography>
      </div>
      <div className={classes.edit}>
        <Typography variant="subtitle1" noWrap className={classes.title}>連絡先メールアドレス</Typography>
        <Typography variant="subtitle1" noWrap className={classes.title}>{email}</Typography>
      </div>
      <div className={classes.edit}>
        <Typography variant="subtitle1" noWrap className={classes.title}>連絡先電話番号</Typography>
        <Typography variant="subtitle1" noWrap className={classes.title}>{phone}</Typography>
      </div>
      <div className={classes.edit}>
        <Typography variant="subtitle1" noWrap className={classes.title}>申し込みプラン</Typography>
        <Typography variant="subtitle1" noWrap className={classes.title}>{planName}</Typography>
      </div>
    </div>;
  }
}
ApprovalForms.displayName = 'ApprovalForms';
ApprovalForms.defaultProps = { user: null };
ApprovalForms.propTypes = {
  classes: PropTypes.object.isRequired
, user: PropTypes.object.isRequired
, admin: PropTypes.string.isRequired
, preference: PropTypes.object.isRequired
};

const columnHeight = 62;
const styles = theme => ({
  forms:        { display: 'flex', flexDirection: 'column' }
, title:        { flex: 1, margin: theme.spacing.unit * 1.75 }
, edit:         { display: 'flex', flexDirection: 'row'
                , alignItems: 'stretch'
                , height: columnHeight, minHeight: columnHeight
                , boxSizing: 'border-box'
                , padding: '5px' }
, buttons:      { display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, margin: theme.spacing.unit
                , wordBreak: 'keep-all' }
});
export default withStyles(styles)(ApprovalForms);
