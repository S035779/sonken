import React          from 'react';
import PropTypes      from 'prop-types';
import std            from 'Utilities/stdutils';
import FaqAction      from 'Actions/FaqAction';

import { withStyles } from '@material-ui/core/styles';
import EditBody       from 'Components/EditBody/EditBody';
import EditButtons    from 'Components/EditButtons/EditButtons';
import RssDialog      from 'Components/RssDialog/RssDialog';

class FaqEdit extends React.Component {
  constructor(props) {
    super(props);
    const isFile = !!props.faq.file;
    this.state = {
      faq:        props.faq
    , isAttached: isFile
    , isSuccess:  false
    , isNotValid: false
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(FaqEdit.displayName, 'Props', nextProps);
    const { faq } = nextProps;
    this.setState({ faq, isAttached: faq ? !!faq.file : false });
  }

  handleChangeTitle(title) {
    //std.logInfo(FaqEdit.displayName, 'handleChangeTitle', title);
    const { faq } = this.state;
    this.setState({ faq: Object.assign({}, faq, { title }) });
  }

  handleChangeBody(event) {
    const { faq } = this.state;
    const body = event.target.value;
    //std.logInfo(FaqEdit.displayName, 'handleChangeBody', body);
    this.setState({ faq: Object.assign({}, faq, { body }) });
  }

  handleDraft() {
    const { admin } = this.props;
    const { _id } = this.state.faq;
    std.logInfo(FaqEdit.displayName, 'handleDraft', _id);
    FaqAction.deletePost(admin, [_id])
      .then(() => this.setState({ isSuccess: true }))
      .catch(err => {
        std.logError(FaqEdit.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
      });
  }

  handleSave() {
    std.logInfo(FaqEdit.displayName, 'handleSave', this.state.faq);
    const { admin } = this.props;
    const { _id, title, body } = this.state.faq;
    if(this.isValidate() && this.isChanged()) {
      FaqAction.update(admin, _id, { title, body })
        .then(() => this.setState({ isSuccess: true }))
        .catch(err => {
          std.logError(FaqEdit.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
        });
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleDelete() {
    std.logInfo(FaqEdit.displayName, 'handleDelete', this.state.faq);
    const { admin } = this.props;
    const { _id } = this.state.faq;
    if(window.confirm('Are you sure?')) {
      FaqAction.delete(admin, [_id])
        .catch(err => {
          std.logError(FaqEdit.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
        });
    }
  }

  handleChangeFile(file) {
    std.logInfo(FaqEdit.displayName, 'handleChangeFile', file);
    if(!file) return;
    const { admin } = this.props;
    const { _id, title, body } = this.state.faq;
    if(this.isValidate()) {
      FaqAction.update(admin, _id, { title, body })
        .then(() => FaqAction.upload(admin, _id, file))
        .then(() => this.setState({ isSuccess: true, isAttached: true }))
        .catch(err => {
          std.logError(FaqEdit.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
        });
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  isValidate() {
    const { title, body } = this.state.faq;
    return ( title !== '' && body !== '');
  }

  isChanged() {
    if(!this.state.faq) return false;
    const { faq } = this.props;
    const { title, body } = this.state.faq;
    return faq.title !== title || faq.body !== body;
  }

  render() {
    //std.logInfo(FaqEdit.displayName, 'State', this.state);
    const { classes } = this.props;
    const { faq, isAttached, isNotValid, isSuccess } = this.state;
    if(!faq || !faq._id) return null;
    const isChanged = this.isChanged();
    return <div className={classes.faqEdit}>
      <EditButtons value={faq.title}
        changed={isChanged} attached={isAttached}
        onChange={this.handleChangeTitle.bind(this)}
        onUpload={this.handleChangeFile.bind(this)}
        onDraft={this.handleDraft.bind(this)}
        onSave={this.handleSave.bind(this)}
        onDelete={this.handleDelete.bind(this)} />
      <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
        内容に不備があります。もう一度確認してください。
      </RssDialog>
      <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
        要求を受け付けました。
      </RssDialog>
      <div className={classes.editBody}>
        <textarea className={classes.inputArea} id="note-body" value={faq.body}
          onChange={this.handleChangeBody.bind(this)}/>
      </div>
      <div className={classes.editView}>
        <EditBody body={faq.body} />
      </div>
    </div>;
  }
}
FaqEdit.displayName= 'FaqEdit';
FaqEdit.defaultProps = { faq: null };
FaqEdit.propTypes = {
  classes: PropTypes.object.isRequired, faq: PropTypes.object.isRequired, admin: PropTypes.string.isRequired
};
const barHeightSmDown   = 104;
const barHeightSmUp     = 112;
const rowHeight         = 62
const editHeightSmDown  = `calc(100vh - ${barHeightSmDown}px - ${rowHeight}px)`;
const editHeightSmUp    = `calc(100vh - ${barHeightSmUp  }px - ${rowHeight}px)`;
const styles = theme => ({
  faqEdit:    { display: 'flex', flexDirection: 'column', height: editHeightSmDown
              , [theme.breakpoints.up('sm')]: { height: editHeightSmUp }}
, editBody:   { borderBottom: '1px solid #CCC', borderLeft: '1px solid #CCC', borderRight: '1px solid #CCC' }
, inputArea:  { display: 'block', resize: 'none', height: '260px', width: '100%',    boxSizing: 'border-box'
              , border: 'none',   padding: '10px', fontSize: '16px', outline: 'none', maxHeight: editHeightSmDown
              , [theme.breakpoints.up('sm')]: { maxHeight: editHeightSmUp }}
, editView:   { flex: '1 1 auto', overflow: 'auto', position: 'relative', padding: '20px 10px 10px 10px'
              , borderBottom: '1px solid #CCC', borderLeft: '1px solid #CCC', borderRight: '1px solid #CCC'
              , '&:before': { content: '"Preview"', display: 'inline-block', position: 'absolute', top: 0, left: 0
                , backgroundColor: '#F5F5F5', padding: '5px 10px', fontSize: '12px', borderRight: '1px solid #CCC'
                , borderBottom: '1px solid #CCC' }}
});
export default withStyles(styles)(FaqEdit);
