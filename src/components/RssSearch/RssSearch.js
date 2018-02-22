import React from 'react';
import PropTypes from 'prop-types';
import NoteAction from 'Actions/NoteAction';

import { withStyles } from 'material-ui/styles';
import { Select, Input, Button, Typography } from 'material-ui';
import { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import { MenuItem } from 'material-ui/Menu';

class RssSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url:      ''
    , filename: ''
    , maxNumber:  props.notePage.maxNumber
    , number:     props.notePage.number
    , perPage:    props.notePage.perPage
    };
  }

  componentWillReceiveProps(nextProps) {
    const { noteNumber, notePage } = nextProps;
    const maxNumber = Math.ceil(noteNumber / notePage.perPage);
    const newState = {
      maxNumber:  maxNumber
    , number:     1
    , perPage:    notePage.perPage
    };
    this.setState(Object.assign({}, this.state, newState));
  }

  componentDidUpdate() {
  }

  handleSubmit() {
    const { url } = this.state;
    const { category } = this.props;
    this.logInfo('handleSubmit', url);
    NoteAction.create({ url, category });
  }

  handleUpload() {
    const { filename } = this.state;
    this.logInfo('handleUpload', filename);
    NoteAction.upload(filename);
  }

  handleDownload() {
    const { filename } = this.state;
    this.logInfo('handleDownload', filename);
    NoteAction.download(filename);
  }

  handleChangeText(name, event) {
    this.logInfo('handleChangeText', name);
    switch(name) {
      case 'url':
        this.setState({ url: event.target.value });
        break;
      default:
        break;
    }
  }

  handleChangeSelect(name, event) {
    const { maxNumber, number } = this.state;
    this.logInfo('handleChangeSelect', event.target.value);
    let newState = {};
    switch(name) {
      case 'page':
        const perPage = event.target.value;
        NoteAction.pagenation({ maxNumber, number, perPage })
        newState = { perPage };
        break;
    }
    this.setState(newState);
  }

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  }

  render() {
    const { classes, noteNumber } = this.props;
    const { url, maxNumber, number, perPage, filename } = this.state;
    return <div className={classes.noteSearchs}>
      <div className={classes.results}>
        <Typography className={classes.title}>
          全{noteNumber}件中{
            noteNumber < perPage ? noteNumber : perPage
          }件表示
        </Typography>
      </div>
      <FormControl className={classes.inputSelect}>
        <InputLabel htmlFor="results">表示件数</InputLabel>
        <Select value={perPage}
          onChange={this.handleChangeSelect.bind(this, 'page')}>
          <MenuItem value={noteNumber}><em>All</em></MenuItem>
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
        <Button variant="raised"
          className={classes.button}
          onClick={this.handleDownload.bind(this)}>
          CSV ダウンロード</Button>
        <Button variant="raised"
          className={classes.button}
          onClick={this.handleUpload.bind(this)}>
          CSV アップロード</Button>
      </div>
    </div>;
  }
};

const titleHeight = 62;
const minWidth = 125;
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
, button:     { flex: 1, margin: theme.spacing.unit /2
              , wordBreak: 'keep-all', padding: 4 }
, results:    { flex: 1, minWidth
              , display: 'flex'
              , justifyContent: 'center', alignItems: 'flex-end' }
, title:      { wordBreak: 'keep-all' }
, space:      { flex: 0, margin: theme.spacing.unit }
});

RssSearch.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssSearch);
