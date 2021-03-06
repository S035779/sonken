import loadable         from '@loadable/component';
import React                    from 'react';
import PropTypes                from 'prop-types';
import MailAction               from 'Actions/MailAction';
import std                      from 'Utilities/stdutils';
import Spinner                  from 'Utilities/Spinner';

import { withStyles }           from '@material-ui/core/styles';
const EditBody    = loadable(() => import('Components/EditBody/EditBody'));
const EditButtons = loadable(() => import('Components/EditButtons/EditButtons'));
const RssDialog   = loadable(() => import('Components/RssDialog/RssDialog'));

class MailEdit extends React.Component {
  constructor(props) {
    super(props);
    const isFile = !!props.mail.file;
    this.state = {
      mail:        props.mail
    , isAttached: isFile
    , isSuccess:  false
    , isNotValid: false
    };
  }

  componentDidMount() {
    this.spn = Spinner.of('app');
  }

  componentWillUnmount() {
    this.spn.stop();
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(MailEdit.displayName, 'Props', nextProps);
    const { mail } = nextProps;
    this.setState({ mail, isAttached: mail ? !!mail.file : false });
  }

  handleChangeTitle(title) {
    //std.logInfo(MailEdit.displayName, 'handleChangeTitle', title);
    const { mail } = this.state;
    this.setState({ mail: Object.assign({}, mail, { title }) });
  }

  handleChangeBody(event) {
    const { mail } = this.state;
    const body = event.target.value;
    //std.logInfo(MailEdit.displayName, 'handleChangeBody', body);
    this.setState({ mail: Object.assign({}, mail, { body }) });
  }

  handleDraft() {
    const { admin } = this.props;
    const { _id } = this.state.mail;
    this.spn.start();
    std.logInfo(MailEdit.displayName, 'handleDraft', _id);
    MailAction.deleteSelect(admin, [_id])
      .then(() => this.setState({ isSuccess: true }))
      .then(() => this.spn.stop())
      .catch(err => {
        std.logError(MailEdit.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        this.spn.stop();
      });
  }

  handleSave() {
    const { admin } = this.props;
    const { _id, title, body } = this.state.mail;
    if(this.isValidate() && this.isChanged()) {
      this.spn.start();
      std.logInfo(MailEdit.displayName, 'handleSave', this.state.mail);
      MailAction.update(admin, _id, { title, body })
        .then(() => this.setState({ isSuccess: true }))
        .then(() => this.spn.stop())
        .catch(err => {
          std.logError(MailEdit.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
          this.spn.stop();
        });
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleDelete() {
    const { admin } = this.props;
    const { _id } = this.state.mail;
    if(window.confirm('Are you sure?')) {
      this.spn.start();
      std.logInfo(MailEdit.displayName, 'handleDelete', this.state.mail);
      MailAction.delete(admin, [_id])
        .then(() => this.spn.stop())
        .catch(err => {
          std.logError(MailEdit.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
          this.spn.stop();
        });
    }
  }

  handleChangeFile(file) {
    if(!file) return;
    const { admin } = this.props;
    const { _id, title, body } = this.state.mail;
    if(this.isValidate()) {
      this.spn.start();
      std.logInfo(MailEdit.displayName, 'handleChangeFile', file);
      MailAction.update(admin, _id, { title, body })
        .then(() => MailAction.upload(admin, _id, file))
        .then(() => this.setState({ isSuccess: true, isAttached: true }))
        .then(() => this.spn.stop())
        .catch(err => {
          std.logError(MailEdit.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
          this.spn.stop();
        });
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  isValidate() {
    const { title, body } = this.state.mail;
    return ( title !== '' && body !== '' );
  }

  isChanged() {
    if(!this.state.mail) return false;
    const { mail } = this.props;
    const { title, body } = this.state.mail;
    return mail.title !== title || mail.body !== body;
  }

  render() {
    //std.logInfo(MailEdit.displayName, 'State', this.state);
    const { classes } = this.props;
    const { mail, isAttached, isNotValid, isSuccess } = this.state;
    if(!mail || !mail._id) return null;
    const isChanged = this.isChanged();
    return <div className={classes.mailEdit}>
      <EditButtons value={mail.title} chenged={isChanged} attached={isAttached} onChange={this.handleChangeTitle.bind(this)}
        onUpload={this.handleChangeFile.bind(this)} onDraft={this.handleDraft.bind(this)} onSave={this.handleSave.bind(this)}
        onDelete={this.handleDelete.bind(this)} />
      <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
        内容に不備があります。もう一度確認してください。
      </RssDialog>
      <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
        要求を受け付けました。
      </RssDialog>
      <div className={classes.editBody}>
        <textarea className={classes.inputArea} id="note-body" value={mail.body} onChange={this.handleChangeBody.bind(this)}/>
      </div>
      <div className={classes.editView}>
        <EditBody body={mail.body} />
      </div>
    </div>;
  }
}
MailEdit.displayName= 'MailEdit';
MailEdit.defaultProps = { mail: null };
MailEdit.propTypes = {
  classes: PropTypes.object.isRequired
, mail: PropTypes.object.isRequired
, admin: PropTypes.string.isRequired
};

const barHeightSmDown   = 104;
const barHeightSmUp     = 112;
const rowHeight         = 62
const editHeightSmDown  = `calc(100vh - ${barHeightSmDown}px - ${rowHeight}px)`;
const editHeightSmUp    = `calc(100vh - ${barHeightSmUp  }px - ${rowHeight}px)`;
const styles = theme => ({
  mailEdit:   { display: 'flex', flexDirection: 'column', height: editHeightSmDown
              , [theme.breakpoints.up('sm')]: { height: editHeightSmUp }}
, editBody:   { borderBottom: '1px solid #CCC', borderLeft: '1px solid #CCC', borderRight: '1px solid #CCC' }
, inputArea:  { display: 'block', resize: 'none', height: '260px', width: '100%', boxSizing: 'border-box', border: 'none'
              , padding: '10px', fontSize: '16px', outline: 'none', maxHeight: editHeightSmDown
              , [theme.breakpoints.up('sm')]: { maxHeight: editHeightSmUp }}
, editView:   { flex: '1 1 auto', overflow: 'auto', position: 'relative', padding: '20px 10px 10px 10px', borderBottom: '1px solid #CCC'
              , borderLeft: '1px solid #CCC', borderRight: '1px solid #CCC'
              , '&:before':
                { content: '"Preview"', display: 'inline-block', position: 'absolute', top: 0, left: 0, backgroundColor: '#F5F5F5'
                , padding: '5px 10px', fontSize: '12px', borderRight: '1px solid #CCC', borderBottom: '1px solid #CCC' }}
});
export default withStyles(styles)(MailEdit);
