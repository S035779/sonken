import React            from 'react';
import PropTypes        from 'prop-types';
import NoteAction       from 'Actions/NoteAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { Select, Input, Button, Typography }
                        from 'material-ui';
import { InputLabel }   from 'material-ui/Input';
import { FormControl }  from 'material-ui/Form';
import { MenuItem }     from 'material-ui/Menu';
import RssButton        from 'Components/RssButton/RssButton';
import RssDialog        from 'Components/RssDialog/RssDialog';

class RssSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url:      ''
    , perPage:    props.noteNumber
    , isSuccess:  false
    , isNotValid: false
    };
  }

  componentWillReceiveProps(nextProps) {
    std.logInfo(RssSearch.displayName, 'Props', nextProps);
    const { notePage, file } = nextProps;
    this.setState({ perPage: notePage.perPage });
    if(file) this.downloadFile(file);
  }

  downloadFile(file) {
    std.logInfo(RssSearch.displayName, 'downloadFile', file);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.target = '_blank';
    a.download = 'download.csv';
    a.click();
  }

  handleSubmit(event) {
    const { url } = this.state;
    const { user, category } = this.props;
    std.logInfo(RssSearch.displayName, 'handleSubmit', url);
    NoteAction.create(user, { url, category });
    this.setState({ url: '' });
  }

  handleDownload(event) {
    const { user, note } = this.props;
    std.logInfo(RssSearch.displayName, 'handleDownload', note.id);
    NoteAction.download(user, note.id)
      .then(() => this.setState({ isSuccess: true }))
      .catch(err => this.setState({ isNotValid: true }));
  }

  handleChangeFile(event) {
    const { user } = this.props;
    const file = event.target.files.item(0);
    std.logInfo(RssSearch.displayName, 'handleChangeFile', file);
    NoteAction.upload(user, file)
      .then(() => this.setState({ isSuccess: true }))
      .catch(err => this.setState({ isNotValid: true }));
  }

  handleChangeText(name, event) {
    const value = event.target.value;
    std.logInfo(RssSearch.displayName, 'handleChangeText', value);
    this.setState({ [name]: value });
  }

  handleChangeSelect(name, event) {
    const { user, noteNumber } = this.props;
    const value = event.target.value;
    std.logInfo(RssSearch.displayName, 'handleChangeSelect', value);
    switch(name) {
      case 'perPage':
        this.setState({ perPage: value });
        NoteAction.pagenation(user, {
          maxNumber: Math.ceil(noteNumber / value)
        , number: 1
        , perPage: value
        });
        break;
    }
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  render() {
    const { classes, noteNumber, category } = this.props;
    const { isSuccess, isNotValid, url, perPage, filename } = this.state;
    const color = category === 'marchant' ? 'skyblue' : 'orange';
    return <div className={classes.noteSearchs}>
      <div className={classes.results}>
        <Typography className={classes.title}>
          全{noteNumber}件中{
            perPage > noteNumber ? noteNumber : perPage
          }件表示
        </Typography>
      </div>
      <FormControl className={classes.inputSelect}>
        <InputLabel htmlFor="results">表示件数</InputLabel>
        <Select value={perPage}
          onChange={this.handleChangeSelect.bind(this, 'perPage')}>
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
        <input type="file" id="file" accept="text/plain"
          onChange={this.handleChangeFile.bind(this)}
          className={classes.input}/>
        <label htmlFor="file">
        <RssButton color={color} component="span"
          classes={classes.button}>CSV アップロード</RssButton>
        </label>
        <RssDialog open={isSuccess} title={'送信完了'}
          onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
        要求を受け付けました。
        </RssDialog>
        <RssDialog open={isNotValid} title={'送信エラー'}
          onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
        内容に不備があります。もう一度確認してください。
        </RssDialog>
      </div>
    </div>;
  }
};

const titleHeight = 62;
const minWidth = 125;
const buttonWidth = 88;
const styles = theme => ({
  noteSearchs:{ display: 'flex', flexDirection: 'row'
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
              , textAlign: 'center'
              , wordBreak: 'keep-all', padding: 4 }
, results:    { flex: 1, minWidth
              , display: 'flex'
              , justifyContent: 'center', alignItems: 'flex-end' }
, title:      { wordBreak: 'keep-all' }
, space:      { flex: 0, margin: theme.spacing.unit }
, input:      { display: 'none' }
});
RssSearch.displayName = 'RssSearch';
RssSearch.defaultProps = {};
RssSearch.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssSearch);
