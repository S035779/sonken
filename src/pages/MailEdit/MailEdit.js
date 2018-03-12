import React          from 'react';
import PropTypes      from 'prop-types';
import std            from 'Utilities/stdutils';
import MailAction      from 'Actions/MailAction';

import { withStyles } from 'material-ui/styles';
import EditBody       from 'Components/EditBody/EditBody';
import EditButtons    from 'Components/EditButtons/EditButtons';
import RssDialog      from 'Components/RssDialog/RssDialog';

class MailEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mail:        props.mail
    , isSuccess:  false
    , isNotValid: false
    };
  }

  componentWillReceiveProps(nextProps) {
    std.logInfo(MailEdit.displayName, 'Props', nextProps);
    this.setState({ mail: nextProps.mail });
  }

  handleChangeTitle(title) {
    std.logInfo(MailEdit.displayName, 'handleChangeTitle', title);
    const { mail } = this.state;
    this.setState({ mail: Object.assign({}, mail, { title }) });
  }

  handleChangeBody(event) {
    const { mail } = this.state;
    const body = event.target.value;
    std.logInfo(MailEdit.displayName, 'handleChangeBody', body);
    this.setState({ mail: Object.assign({}, mail, { body }) });
  }

  handleDraft() {
    const { admin } = this.props;
    const { _id } = this.state.mail;
    std.logInfo(MailEdit.displayName, 'handleDraft', _id);
    MailAction.deleteSelect(admin, [_id])
      .then(() => this.setState({ isSuccess: true }))
      .catch(err => this.setState({ isNotValid: true }));
  }

  handleSave() {
    std.logInfo(MailEdit.displayName, 'handleSave', this.state.mail);
    const { admin } = this.props;
    const { _id, title, body } = this.state.mail;
    if(this.isValidate() && this.isChanged()) {
      MailAction.update(admin, _id, { title, body })
        .then(() => this.setState({ isSuccess: true }))
        .catch(err => this.setState({ isNotValid: true }));
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleDelete() {
    std.logInfo(MailEdit.displayName, 'handleDelete', this.state.mail);
    const { admin } = this.props;
    const { _id } = this.state.mail;
    if(window.confirm('Are you sure?')) {
      MailAction.delete(admin, [_id])
        .catch(err => this.setState({ isNotValid: true }));
    }
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  isValidate() {
    const { title, body } = this.state.mail;
    return ( title !== '' && body !== '');
  }

  isChanged() {
    const { title, body } = this.state.mail;
    const { mail } = this.props;
    return mail.title !== title || mail.body !== body;
  }

  render() {
    std.logInfo(MailEdit.displayName, 'Props', this.props);
    const { classes, admin, mail } = this.props;
    const { isNotValid, isSuccess } = this.state;
    const { title: nextTitle, body: nextBody } = this.state.mail;
    if(!mail || !mail._id) return null;
    const isChanged = mail.title !== nextTitle || mail.body !== nextBody;
    return <div className={classes.mailEdit}>
      <EditButtons changed={isChanged} value={nextTitle}
        onChange={this.handleChangeTitle.bind(this)}
        onDraft={this.handleDraft.bind(this)}
        onSave={this.handleSave.bind(this)}
        onDelete={this.handleDelete.bind(this)} />
      <RssDialog open={isNotValid} title={'送信エラー'}
        onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
      内容に不備があります。もう一度確認してください。
      </RssDialog>
      <RssDialog open={isSuccess} title={'送信完了'}
        onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
      要求を受け付けました。
      </RssDialog>
      <div className={classes.editBody}>
        <textarea className={classes.inputArea}
          id="note-body" value={nextBody}
          onChange={this.handleChangeBody.bind(this)}/>
      </div>
      <div className={classes.editView}>
        <EditBody body={nextBody} />
      </div>
    </div>;
  }
};

const barHeightSmDown   = 104;
const barHeightSmUp     = 112;
const rowHeight         = 62
const editHeightSmDown  =
  `calc(100vh - ${barHeightSmDown}px - ${rowHeight}px)`;
const editHeightSmUp    =
  `calc(100vh - ${barHeightSmUp  }px - ${rowHeight}px)`;
const styles = theme => ({
  mailEdit:    { display: 'flex', flexDirection: 'column'
              , height: editHeightSmDown
              , [theme.breakpoints.up('sm')]: { height: editHeightSmUp }}
, editBody:   {
                borderBottom: '1px solid #CCC'
              , borderLeft: '1px solid #CCC'
              , borderRight: '1px solid #CCC'
              }
, inputArea:  { display: 'block', resize: 'none' 
              , height: '260px'
              , width: '100%',    boxSizing: 'border-box'
              , border: 'none',   padding: '10px'
              , fontSize: '16px', outline: 'none', resize: 'vertical'
              , maxHeight: editHeightSmDown
              , [theme.breakpoints.up('sm')]: {
                maxHeight: editHeightSmUp }}
, editView:   { flex: '1 1 auto', overflow: 'auto'
              , position: 'relative'
              , padding: '20px 10px 10px 10px'
              , borderBottom: '1px solid #CCC'
              , borderLeft: '1px solid #CCC'
              , borderRight: '1px solid #CCC'
              , '&:before': {
                content: '"Preview"', display: 'inline-block'
                , position: 'absolute', top: 0, left: 0
                , backgroundColor: '#F5F5F5'
                , padding: '5px 10px', fontSize: '12px'
                , borderRight: '1px solid #CCC'
                , borderBottom: '1px solid #CCC'
              }}
});
MailEdit.displayName= 'MailEdit';
MailEdit.defaultProps = { mail: null };
MailEdit.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(MailEdit);
