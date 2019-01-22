import loadable         from '@loadable/component';
import React            from 'react';
import PropTypes        from 'prop-types';
import * as R           from 'ramda';
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';
import Spinner          from 'Utilities/Spinner';

import { withStyles }   from '@material-ui/core/styles';
import { Typography, TextField, MenuItem } from '@material-ui/core';
const RssDialog       = loadable(() => import('Components/RssDialog/RssDialog'));
const LoginFormDialog = loadable(() => import('Components/LoginFormDialog/LoginFormDialog'));

class LoginPreference extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSuccess: false
    , isNotValid: false
    , profile: props.profile
    , plan: props.plan
    , deleteWord: props.deleteWord || ''
    , itemWord: props.itemWord || ''
    , paymentWord: props.paymentWord || ''
    , deliverWord: props.deliverWord || ''
    , noteWord: props.noteWord || ''
    };
  }

  componentDidMount() {
    this.spn = Spinner.of('app');
  }

  componentWillUnmount() {
    this.spn.stop();
  }

  componentDidUpdate(prevProps) {
    const prevProfile = prevProps.profile;
    const nextProfile = this.props.profile;
    if(this.isChanged(prevProfile, nextProfile)) {
      std.logInfo(LoginPreference.displayName, 'componentDidUpdate', name);
      this.setState({
        profile:      nextProfile
      , plan:         nextProfile.plan
      , deleteWord:   nextProfile.deleteWord
      , itemWord:     nextProfile.itemWord
      , paymentWord:  nextProfile.paymentWord
      , deliverWord:  nextProfile.deliverWord
      , noteWord:     nextProfile.noteWord
      });
    }
  }

  handleChangeField(name, event) {
    std.logInfo(LoginPreference.displayName, 'handleChangeField', name);
    const profile =  R.merge(this.state.profile, { [name]: event.target.value  });
    this.setState({ profile, [name]:   event.target.value });
  }

  handleSubmitDialog(name) {
    const { user } = this.props;
    const prevProfile = this.props.profile;
    const nextProfile = this.state.profile;
    if(name === 'isPreference') {
      if(this.isValidate(nextProfile) && this.isChanged(prevProfile, nextProfile)) {
        this.spn.start();
        //std.logInfo(LoginPreference.displayName, 'handleSubmitDialog', name);
        LoginAction.updateProfile(user, null, nextProfile)
          .then(() => this.setState({ isSuccess: true }))
          .then(() => this.spn.stop())
          .catch(err => {
            std.logError(LoginPreference.displayName, err.name, err.message);
            this.setState({ isNotValid: true });
            this.spn.stop();
          });
      } else {
        this.setState({ isNotValid: true });
      }
    }
  }

  handleCloseDialog(name, event) {
    this.props.onClose(name, event);
  }

  handleClose(name) {
    this.setState({ [name]: false });
  }

  isValidate(nextProfile) {
    const { plan } = nextProfile;
    return (plan !== '');
  }

  isChanged(prevProfile, nextProfile) {
    const { plan, deleteWord, itemWord, paymentWord, deliverWord, noteWord } = nextProfile;
    return (
       plan        !== prevProfile.plan
    || deleteWord  !== prevProfile.deleteWord
    || itemWord    !== prevProfile.itemWord
    || paymentWord !== prevProfile.paymentWord
    || deliverWord !== prevProfile.deliverWord
    || noteWord    !== prevProfile.noteWord
    );
  }

  renderMenu(obj, idx) {
    return <MenuItem key={idx} value={obj.id}>{obj.name}（上限数：{obj.number}）</MenuItem>;
  }

  render() {
    //std.logInfo(LoginPreference.displayName, 'Props', this.props);
    //std.logInfo(LoginPreference.displayName, 'State', this.state);
    const { classes, name, user, preference, open } = this.props;
    const { isNotValid, isSuccess, plan, deleteWord, itemWord, paymentWord, deliverWord, noteWord } = this.state;
    const renderMenu = preference.menu ? preference.menu.map((obj, idx) => this.renderMenu(obj, idx)) : [];
    return <LoginFormDialog
          isSubmit
          open={open}
          title={'ユーザ設定'} 
          onClose={this.handleCloseDialog.bind(this, 'isPreference')}
          onSubmit={this.handleSubmitDialog.bind(this, 'isPreference')}>
        <Typography variant="h6" noWrap className={classes.title}>{name}（{user}）</Typography>
        <TextField 
          label="契約プラン" 
          select 
          autoFocus 
          margin="dense" 
          value={plan} 
          onChange={this.handleChangeField.bind(this, 'plan')}
          fullWidth>{renderMenu}</TextField>
        <Typography variant="h6" noWrap className={classes.title}>アマゾンASIN取得</Typography>
        <TextField
          label="除外ワード"
          multiline
          rows="4"
          value={deleteWord}
          className={classes.textField}
          margin="normal"
          variant="outlined"
          onChange={this.handleChangeField.bind(this, 'deleteWord')}
          fullWidth />
        <Typography variant="h6" noWrap className={classes.title}>商品詳細テンプレート</Typography>
        <TextField
          label="商品詳細"
          multiline
          value={itemWord}
          className={classes.textField}
          margin="normal"
          variant="outlined"
          onChange={this.handleChangeField.bind(this, 'itemWord')}
          fullWidth />
        <TextField
          label="支払詳細"
          multiline
          value={paymentWord}
          className={classes.textField}
          margin="normal"
          variant="outlined"
          onChange={this.handleChangeField.bind(this, 'paymentWord')}
          fullWidth />
        <TextField
          label="発送詳細"
          multiline
          value={deliverWord}
          className={classes.textField}
          margin="normal"
          variant="outlined"
          onChange={this.handleChangeField.bind(this, 'deliverWord')}
          fullWidth />
        <TextField
          label="注意事項"
          multiline
          value={noteWord}
          className={classes.textField}
          margin="normal"
          variant="outlined"
          onChange={this.handleChangeField.bind(this, 'noteWord')}
          fullWidth />
        <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleClose.bind(this, 'isNotValid')}>
          内容に不備があります。もう一度確認してください。
        </RssDialog>
        <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleClose.bind(this, 'isSuccess')}>
          要求を受け付けました。
        </RssDialog>
      </LoginFormDialog>;
  }
}
LoginPreference.displayName = 'LoginPreference';
LoginPreference.defaultProps = {
  name: ''
, user: ''
, plan: ''
, profile: null
, preference: null
, open: false
};
LoginPreference.propTypes = {
  classes: PropTypes.object.isRequired
, onClose: PropTypes.func.isRequired
, name: PropTypes.string.isRequired
, user: PropTypes.string.isRequired
, plan: PropTypes.string.isRequired
, deleteWord: PropTypes.string
, itemWord: PropTypes.string
, paymentWord: PropTypes.string
, deliverWord: PropTypes.string
, noteWord: PropTypes.string
, profile: PropTypes.object.isRequired
, preference: PropTypes.object.isRequired
, open: PropTypes.bool.isRequired
};
const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  }
});
export default withStyles(styles)(LoginPreference);
