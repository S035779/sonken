import React            from 'react';
import PropTypes        from 'prop-types';
import UserAction       from 'Actions/UserAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import {
  Select, Input, Button, Typography
}                       from 'material-ui';
import { InputLabel }   from 'material-ui/Input';
import { FormControl }  from 'material-ui/Form';
import { MenuItem }     from 'material-ui/Menu';
import RssButton        from 'Components/RssButton/RssButton';

class AdminSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url:      ''
    , filename: ''
    , perPage:    props.userNumber
    };
  }

  componentWillReceiveProps(nextProps) {
    std.logInfo(AdminSearch.displayName, 'Props', nextProps);
    const { userPage } = nextProps;
    this.setState({ perPage: userPage.perPage });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { url } = this.state;
    const { admin, category } = this.props;
    std.logInfo(AdminSearch.displayName, 'handleSubmit', url);
    UserAction.create(admin, { url, category });
    this.setState({ url: '' });
  }

  handleUpload(e) {
    e.preventDefault();
    const { filename } = this.state;
    const { admin } = this.props;
    std.logInfo(AdminSearch.displayName, 'handleUpload', filename);
    UserAction.upload(admin, filename);
    this.setState({ filename: '' });
  }

  handleDownload(e) {
    e.preventDefault();
    const { filename } = this.state;
    const { admin } = this.props;
    std.logInfo(AdminSearch.displayName, 'handleDownload', filename);
    UserAction.download(admin, filename);
    this.setState({ filename: '' });
  }

  handleChangeText(name, event) {
    const value = event.target.value;
    std.logInfo(AdminSearch.displayName, 'handleChangeText', value);
    switch(name) {
      case 'url':
        this.setState({ url: value });
        break;
    }
  }

  handleChangeSelect(name, event) {
    const { admin, userNumber } = this.props;
    const value = event.target.value;
    std.logInfo(AdminSearch.displayName, 'handleChangeSelect', value);
    switch(name) {
      case 'page':
        UserAction.pagenation(admin, {
          maxNumber: Math.ceil(userNumber / value)
          , number: 1, perPage: value
        });
        this.setState({ perPage: value });
        break;
    }
  }

  render() {
    const { classes, userNumber, category } = this.props;
    const { url, perPage, filename } = this.state;
    const color = category === 'users' ? 'skyblue' : 'orange';
    return <div className={classes.userSearchs}>
      <div className={classes.results}>
        <Typography className={classes.title}>
          全{userNumber}件中{
            perPage > userNumber ? userNumber : perPage
          }件表示
        </Typography>
      </div>
      <FormControl className={classes.inputSelect}>
        <InputLabel htmlFor="results">表示件数</InputLabel>
        <Select value={perPage}
          onChange={this.handleChangeSelect.bind(this, 'page')}>
          <MenuItem value={9999}><em>All</em></MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={300}>300</MenuItem>
        </Select>
      </FormControl>
      <FormControl className={classes.inputText}>
        <InputLabel htmlFor="url">URL</InputLabel>
        <Input id="url" value={url}
          onChange={this.handleChangeText.bind(this, 'url')}/>
      </FormControl>
      <div className={classes.buttons}>
        <Button variant="raised"
          className={classes.button}
          onClick={this.handleSubmit.bind(this)}>
          {this.props.changed ? '*' : ''}URL登録</Button>
        <div className={classes.space} />
        <RssButton color={color}
          onClick={this.handleDownload.bind(this)}
          classes={classes.button}>CSV ダウンロード</RssButton>
        <RssButton color={color}
          onClick={this.handleUpload.bind(this)}
          classes={classes.button}>CSV アップロード</RssButton>
      </div>
    </div>;
  }
};

const titleHeight = 62;
const minWidth = 125;
const buttonWidth = 88;
const styles = theme => ({
  userSearchs:{ display: 'flex', flexDirection: 'row'
              , alignItems: 'stretch'
              , height: titleHeight, minHeight: titleHeight
              , boxSizing: 'border-box'
              , padding: '5px'
              , overflow: 'scroll' }
, inputSelect:{ margin: theme.spacing.unit / 3 + 1, minWidth }
, inputText:  { flex: 2, minWidth: minWidth * 2 }
, buttons:    { flex: 0, display: 'flex', flexDirection: 'row' }
, button:     { flex: 1, width: buttonWidth
              , margin: theme.spacing.unit /2
              , wordBreak: 'keep-all', padding: 4 }
, results:    { flex: 1, minWidth
              , display: 'flex'
              , justifyContent: 'center', alignItems: 'flex-end' }
, title:      { wordBreak: 'keep-all' }
, space:      { flex: 0, margin: theme.spacing.unit }
});
AdminSearch.displayName = 'AdminSearch';
AdminSearch.defaultProps = {};
AdminSearch.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(AdminSearch);
