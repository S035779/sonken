import React          from 'react';
import PropTypes      from 'prop-types';
import std            from 'Utilities/stdutils';
import FaqAction      from 'Actions/FaqAction';

import { withStyles } from 'material-ui/styles';
import EditBody       from 'Components/EditBody/EditBody';
import EditButtons    from 'Components/EditButtons/EditButtons';
import RssDialog      from 'Components/RssDialog/RssDialog';

class FaqEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      faq:        props.faq
    , isSuccess:  false
    , isNotValid: false
    };
  }

  componentWillReceiveProps(nextProps) {
    std.logInfo(FaqEdit.displayName, 'Props', nextProps);
    this.setState({ faq: nextProps.faq });
  }

  handleChangeTitle(title) {
    std.logInfo(FaqEdit.displayName, 'handleChangeTitle', title);
    const { faq } = this.state;
    this.setState({ faq: Object.assign({}, faq, { title }) });
  }

  handleChangeBody(event) {
    const { faq } = this.state;
    const body = event.target.value;
    std.logInfo(FaqEdit.displayName, 'handleChangeBody', body);
    this.setState({ faq: Object.assign({}, faq, { body }) });
  }

  handleDraft() {
    const { admin } = this.props;
    const { _id } = this.state.faq;
    std.logInfo(FaqEdit.displayName, 'handleDraft', _id);
    FaqAction.deletePost(admin, [_id])
      .then(() => this.setState({ isSuccess: true }))
      .catch(err => this.setState({ isNotValid: true }));
  }

  handleSave() {
    std.logInfo(FaqEdit.displayName, 'handleSave', this.state.faq);
    const { admin } = this.props;
    const { _id, title, body } = this.state.faq;
    if(this.isValidate() && this.isChanged()) {
      FaqAction.update(admin, _id, { title, body })
        .then(() => this.setState({ isSuccess: true }))
        .catch(err => this.setState({ isNotValid: true }));
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
        .catch(err => this.setState({ isNotValid: true }));
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
    const { title, body } = this.state.faq;
    const { faq } = this.props;
    return faq.title !== titie || faq.body !== body;
  }

  render() {
    std.logInfo(FaqEdit.displayName, 'Props', this.props);
    const { classes, admin, faq } = this.props
    const { title: nextTitle, body: nextBody } = this.state.faq;
    if(!faq || !faq._id) return null;
    const isChanged = faq.title !== nextTitle || faq.body !== nextBody;
    return <div className={classes.faqEdit}>
      <EditButtons changed={isChanged} value={nextTitle}
        onChange={this.handleChangeTitle.bind(this)}
        onDraft={this.handleDraft.bind(this)}
        onSave={this.handleSave.bind(this)}
        onDelete={this.handleDelete.bind(this)} />
      <RssDialog open={isNotValid}></RssDialog>
      <RssDialog open={isSuccess}></RssDialog>
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
  faqEdit:    { display: 'flex', flexDirection: 'column'
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
FaqEdit.displayName= 'FaqEdit';
FaqEdit.defaultProps = { faq: null };
FaqEdit.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(FaqEdit);
