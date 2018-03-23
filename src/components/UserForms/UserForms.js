import React            from 'react';
import PropTypes        from 'prop-types';
import { Redirect }     from 'react-router-dom';
import UserAction       from 'Actions/UserAction';
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { Input, Typography, Select, Checkbox }
                        from 'material-ui';
import { InputLabel }   from 'material-ui/Input';
import { FormControl, FormControlLabel }
                        from 'material-ui/Form';
import { MenuItem }     from 'material-ui/Menu';
import RssDialog        from 'Components/RssDialog/RssDialog';
import RssButton        from 'Components/RssButton/RssButton';

class UserForms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user:               props.user
    , filename:           ''
    , isSuccess:          false
    , isNotValid:         false
    , redirectToRss:      false
    };
  }

  componentWillReceiveProps(nextProps) {
    std.logInfo(UserForms.displayName, 'Props', nextProps);
    this.setState({ user: nextProps.user });
  }

  handleChangeInput(name, event) {
    const { user } = this.state;
    this.setState({
      user:   Object.assign({}, user, { [name]: event.target.value })
    });
  }

  handleChangeCheckbox(name, event) {
    const { user } = this.state;
    this.setState({
      user:   Object.assign({}, user, { [name]: event.target.checked })
    });
  }

  handleRSS() {
    const { user } = this.props;
    std.logInfo(UserForms.displayName, 'handleRSS', user.user);
    LoginAction.presetUser(user.user)
      .then(() => this.setState({ redirectToRss: true }));
  }

  handleSave() {
    const { admin } = this.props;
    const { user } = this.state;
    if(this.isValidate() && this.isChanged()) {
      UserAction.update(admin, user)
        .then(() => this.setState({ isSuccess: true }))
        .catch(err => this.setState({ isNotValid: true }));
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleDelete() {
    const { admin } = this.props;
    const { user } = this.state;
    if(window.confirm('Are you sure?')) {
      UserAction.delete(admin, [user._id])
        .catch(err => this.setState({ isNotValid: true }));
    }
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  isValidate() {
    const { name, kana, email, phone, plan } = this.state.user;
    return (name !== '' && kana !== ''
      && std.regexEmail(email) && std.regexNumber(phone) && plan !== ''
    );
  }

  isChanged() {
    const { name, kana, email, phone, plan, isAdmin } = this.state.user;
    const { user } = this.props;
    return (user.name !== name  || user.kana !== kana
      || user.email !== email  || user.phone !== phone
      || user.plan !== plan || user.isAdmin !== isAdmin);
  }

  renderMenu(obj, idx) {
    return <MenuItem key={idx} value={obj.name}>
      {obj.name}（上限数：{obj.number}）
    </MenuItem>;
  }

  render() {
    //std.logInfo(UserForms.displayName, 'State', this.state);
    const { classes, preference } = this.props;
    const { isNotValid, isSuccess, redirectToRss } = this.state;
    const { user, name, kana, email, phone, plan, isAdmin }
      = this.state.user;
    const primary = 'skyblue';
    const secondary = 'orange';
    const isChanged = this.isChanged();
    const title = `${name} (${user})`;
    const renderMenu = preference.menu
      ? preference.menu.map((obj, idx) => this.renderMenu(obj, idx)) : [];
    const rss = { pathname: '/marchant' };
    if(redirectToRss) return <Redirect to={rss} />;
    return <div className={classes.forms}>
      <div className={classes.edit}>
        <Typography variant="title" noWrap
          className={classes.title}>{title}</Typography>
        <div className={classes.buttons}>
          <RssButton color={primary}
            onClick={this.handleRSS.bind(this)}
            classes={classes.button}>
          ユーザRSS</RssButton>
          <RssButton color={primary}
            onClick={this.handleSave.bind(this)}
            classes={classes.button}>
          {isChanged ? '*' : ''}変更する</RssButton>
          <RssButton color={secondary}
            onClick={this.handleDelete.bind(this)}
            classes={classes.button}>
          削除</RssButton>
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
        <FormControlLabel className={classes.checkbox}
          control={<Checkbox
            checked={isAdmin}
            onChange={this.handleChangeCheckbox.bind(this, 'isAdmin')}
            value="admin"
            color="primary" />}
          label="管理者権限を付与する" />
      </div>
      <div className={classes.edit}>
        <FormControl className={classes.text}>
          <InputLabel htmlFor="name">氏名</InputLabel>
          <Input id="name" value={name}
            onChange={this.handleChangeInput.bind(this, 'name')}/>
        </FormControl>
      </div>
      <div className={classes.edit}>
        <FormControl className={classes.text}>
          <InputLabel htmlFor="kana">氏名（カナ）</InputLabel>
          <Input id="kana" value={kana}
            onChange={this.handleChangeInput.bind(this, 'kana')}/>
        </FormControl>
      </div>
      <div className={classes.edit}>
        <FormControl className={classes.text}>
          <InputLabel htmlFor="email">連絡先メールアドレス</InputLabel>
          <Input id="email" value={email}
            onChange={this.handleChangeInput.bind(this, 'email')}/>
        </FormControl>
      </div>
      <div className={classes.edit}>
        <FormControl className={classes.text}>
          <InputLabel htmlFor="phone">連絡先電話番号</InputLabel>
          <Input id="phone" value={phone}
            onChange={this.handleChangeInput.bind(this, 'phone')}/>
        </FormControl>
      </div>
      <div className={classes.edit}>
        <FormControl className={classes.text}>
          <InputLabel htmlFor="plan">申し込みプラン</InputLabel>
          <Select value={plan}
            onChange={this.handleChangeInput.bind(this, 'plan')}>
            {renderMenu}
          </Select>
        </FormControl>
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
, buttons:      { display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, margin: theme.spacing.unit
                , wordBreak: 'keep-all' }
, text:         { flex: 1, marginLeft: theme.spacing.unit * 1.75 }
, checkbox:     { flex: 1, marginLeft: theme.spacing.unit * 1.75 }
});
UserForms.displayName = 'UserForms';
UserForms.defaultProps = { user: null };
UserForms.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(UserForms);
