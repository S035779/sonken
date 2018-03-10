import React            from 'react';
import PropTypes        from 'prop-types';
import UserAction       from 'Actions/UserAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { Input, Typography, Select }
                        from 'material-ui';
import { InputLabel }   from 'material-ui/Input';
import { FormControl }  from 'material-ui/Form';
import { MenuItem }     from 'material-ui/Menu';
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
  }

  componentWillReceiveProps(nextProps) {
    std.logInfo(ApprovalForms.displayName, 'Props', nextProps);
    this.setState({ user: nextProps.user });
  }

  handleChangeInput(name, event) {
    const { user } = this.state;
    this.setState({
      user:   Object.assign({}, user, { [name]: event.target.value })
    });
  }

  handleApproval() {
    const { admin } = this.props;
    const { user } = this.state;
    UserAction.createApproval(admin, [user._id])
      .then(() => this.setState({ isSuccess: true }))
      .catch(err => this.setState({ isNotValid: true }));
  }

  handleNotApproval() {
    const { admin } = this.props;
    const { user } = this.state;
    UserAction.deleteApproval(admin, [user._id])
      .then(() => this.setState({ isSuccess: true }))
      .catch(err => this.setState({ isNotValid: true }));
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  render() {
    std.logInfo(ApprovalForms.displayName, 'State', this.state);
    const { classes } = this.props;
    const { isNotValid, isSuccess } = this.state;
    const { user, name, kana, email, phone, plan } = this.state.user;
    const primary = 'skyblue';
    const secondary = 'orange';
    const title = `${name} (${user})`;
    return <div className={classes.forms}>
      <div className={classes.edit}>
        <Typography variant="title" noWrap className={classes.title}>
        {title}
        </Typography>
        <div className={classes.buttons}>
          <RssButton color={primary}
            onClick={this.handleApproval.bind(this)}
            classes={classes.button}>
          承認する</RssButton>
          <RssButton color={secondary}
            onClick={this.handleNotApproval.bind(this)}
            classes={classes.button}>
          非承認</RssButton>
          <RssDialog open={isNotValid} title={'送信エラー'}
            onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
          内容に不備があります。もう一度確認してください。
          </RssDialog>
          <RssDialog open={isSuccess} title={'送信完了'}
            onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
          要求を受け付けました。
          </RssDialog>
        </div>
      </div>
      <div className={classes.edit}>
        <Typography variant="subheading" noWrap className={classes.title}>
        氏名
        </Typography>
        <Typography variant="subheading" noWrap className={classes.title}>
        {name}
        </Typography>
      </div>
      <div className={classes.edit}>
        <Typography variant="subheading" noWrap className={classes.title}>
        氏名（カナ）
        </Typography>
        <Typography variant="subheading" noWrap className={classes.title}>
        {kana}
        </Typography>
      </div>
      <div className={classes.edit}>
        <Typography variant="subheading" noWrap className={classes.title}>
        連絡先メールアドレス
        </Typography>
        <Typography variant="subheading" noWrap className={classes.title}>
        {email}
        </Typography>
      </div>
      <div className={classes.edit}>
        <Typography variant="subheading" noWrap className={classes.title}>
        連絡先電話番号
        </Typography>
        <Typography variant="subheading" noWrap className={classes.title}>
        {phone}
        </Typography>
      </div>
      <div className={classes.edit}>
        <Typography variant="subheading" noWrap className={classes.title}>
        申し込みプラン
        </Typography>
        <Typography variant="subheading" noWrap className={classes.title}>
        {plan}
        </Typography>
      </div>
    </div>;
  }
};

const barHeightSmDown   = 104;
const barHeightSmUp     = 112;
const searchHeight      = 62;
const filterHeight      = 62 * 9;
const listHeightSmDown  =
  `calc(100vh - ${barHeightSmDown}px - ${filterHeight}px - ${searchHeight}px)`;
const listHeightSmUp    =
  `calc(100vh - ${barHeightSmUp}px - ${filterHeight}px - ${searchHeight}px)`;
const listWidth = 400;
const columnHeight = 62;
const editWidth = `calc(100% - ${listWidth}px)`;
const styles = theme => ({
  forms:        { display: 'flex', flexDirection: 'column' }
, title:        { flex: 1, margin: theme.spacing.unit * 1.75 }
, edit:         { display: 'flex', flexDirection: 'row'
                , alignItems: 'stretch'
                , height: columnHeight, minHeight: columnHeight
                , boxSizing: 'border-box'
                , padding: '5px' }
, buttons:      { display: 0, display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, margin: theme.spacing.unit
                , wordBreak: 'keep-all' }
});
ApprovalForms.displayName = 'ApprovalForms';
ApprovalForms.defaultProps = { user: null };
ApprovalForms.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(ApprovalForms);
