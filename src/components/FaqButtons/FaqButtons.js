import React          from 'react';
import PropTypes      from 'prop-types';
import FaqAction      from 'Actions/FaqAction';
import std            from 'Utilities/stdutils';

import { withStyles } from '@material-ui/core/styles';
import { Button, Checkbox }
                      from '@material-ui/core';
import RssDialog      from 'Components/RssDialog/RssDialog';

class FaqButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false
    , isSuccess:          false
    , isNotValid:         false
    };
  }

  componentDidMount() {
    FaqAction.select(this.props.admin, []);
  }

  handleChangeCheckbox(event) {
    const checked = event.target.checked;
    this.setState({ checked });

    const { admin, faqs } = this.props;
    const ids = checked ? faqs.map(faq => faq._id) : [];
    std.logInfo(FaqButtons.displayName, 'handleChangeCheckbox', ids);
    FaqAction.select(admin, ids);
  }

  handleNew() {
    const { admin, selectedFaqId } = this.props;
    std.logInfo(FaqButtons.displayName
      , 'handleNew', selectedFaqId);
    FaqAction.create(admin, selectedFaqId)
      .then(() => this.setState({ isSuccess: true }))
      .catch(err => this.setState({ isNotValid: true }));
    this.setState({ checked: false });
  }

  handlePost() {
    const { admin, selectedFaqId } = this.props;
    std.logInfo(FaqButtons.displayName
      , 'handlePosted', selectedFaqId);
    if(window.confirm('Are you sure?')) {
      FaqAction.createPost(admin, selectedFaqId)
        .then(() => this.setState({ isSuccess: true }))
        .catch(err => this.setState({ isNotValid: true }));
      this.setState({ checked: false });
    }
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  render() {
    const { classes } = this.props;
    const { checked, isNotValid, isSuccess } = this.state;
    return <div className={classes.faqButtons}>
      <Checkbox checked={checked}
        className={classes.checkbox}
        onChange={this.handleChangeCheckbox.bind(this)}
        tabIndex={-1} disableRipple />
      <div className={classes.buttons}>
        <Button variant="raised"
          className={classes.button}
          onClick={this.handleNew.bind(this)}>新規作成</Button>
        <Button variant="raised"
          className={classes.button}
          onClick={this.handlePost.bind(this)}>FAQ掲載</Button>
        <RssDialog open={isNotValid} title={'送信エラー'}
          onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
        内容に不備があります。もう一度確認してください。
        </RssDialog>
        <RssDialog open={isSuccess} title={'送信完了'}
          onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
        要求を受け付けました。
        </RssDialog>
      </div>
    </div>;
  }
};

const titleHeight   = 62;
const checkboxWidth = 38;
const styles = theme => ({
  faqButtons:  { display: 'flex', flexDirection: 'row'
                , alignItems: 'stretch', justifyContent: 'flex-start' 
                , height: titleHeight, minHeight: titleHeight
                , boxSizing: 'border-box'
                , padding: '5px' }
, checkbox:     { flex: 0, minWidth: checkboxWidth }
, buttons:      { flex: 0, display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, margin: theme.spacing.unit
                , wordBreak: 'keep-all' }
});
FaqButtons.displayName = 'FaqButtons';
FaqButtons.defaultProps = {};
FaqButtons.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(FaqButtons);
