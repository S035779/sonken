import React            from 'react';
import PropTypes        from 'prop-types';
import NoteAction       from 'Actions/NoteAction';
import std              from 'Utilities/stdutils';
import Spinner          from 'Utilities/Spinner';

import { withStyles }   from '@material-ui/core/styles';
import { Select, Input, Button, Typography, InputLabel, FormControl, MenuItem } from '@material-ui/core';
import RssButton        from 'Components/RssButton/RssButton';
import RssDialog        from 'Components/RssDialog/RssDialog';
import RssAddDialog     from 'Components/RssAddDialog/RssAddDialog';

class RssSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url:          ''
    , perPage:      props.noteNumber
    , isSuccess:    false
    , isNotValid:   false
    , isAddNote:    false
    };
  }

  componentWillReceiveProps(nextProps) {
    const { notePage } = nextProps;
    this.setState({ perPage: notePage.perPage });
  }

  downloadFile(blob) {
    std.logInfo(RssSearch.displayName, 'downloadFile', blob);
    const anchor = document.createElement('a');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const fileReader = new FileReader();
    fileReader.onload = function() {
      anchor.href = URL.createObjectURL(new Blob([bom, this.result], { type: 'text/csv' }));
      anchor.target = '_blank';
      anchor.download = 'download.csv';
      anchor.click();
    }
    fileReader.readAsArrayBuffer(blob);
  }

  handleSubmit(title, categoryIds) {
    const { user } = this.props;
    const request = this.getCategory(this.state.url);
    if(request) {
      const spn = Spinner.of('app');
      spn.start();
      std.logInfo(RssSearch.displayName, 'Request', this.state.url);
      NoteAction.create(user, { url: request.url, category: request.category, title, categoryIds })
        .then(() => this.setState({ isSuccess: true, url: '' }))
        .then(() => spn.stop())
        .catch(err => {
          std.logError(RssSearch.displayName, err.name, err.message);
          this.setState({ isNotValid: true, url: '' });
          spn.stop();
        });
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleClickButton() {
    this.setState({ isAddNote: true });
  }

  handleDownload() {
    const { user, category } = this.props;
    const spn = Spinner.of('app');
    spn.start();
    std.logInfo(RssSearch.displayName, 'handleDownload', user);
    NoteAction.download(user, category)
      .then(() => this.downloadFile(this.props.file))
      .then(() => this.setState({ isSuccess: true }))
      .then(() => spn.stop())
      .catch(err => {
        std.logError(RssSearch.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        spn.stop();
      })
    ;
  }

  handleChangeFile(event) {
    const { user, category } = this.props;
    const file = event.target.files.item(0);
    std.logInfo(RssSearch.displayName, 'handleChangeFile', file.type + ";" + file.name);
    const spn = Spinner.of('app');
    spn.start();
    NoteAction.upload(user, category, file)
      .then(() => this.setState({ isSuccess: true }))
      .then(() => spn.stop())
      .catch(err => {
        std.logError(RssSearch.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        spn.stop();
      })
    ;
  }

  handleChangeText(name, event) {
    const value = event.target.value;
    this.setState({ [name]: value });
  }

  handleChangeSelect(name, event) {
    const { user, category, noteNumber } = this.props;
    const perPage = event.target.value;
    const maxNumber = Math.ceil(noteNumber / perPage);
    const number = 1;
    const spn = Spinner.of('app');
    spn.start();
    std.logInfo(RssSearch.displayName, 'handleChangeSelect', perPage);
    NoteAction.pagenation(user, { maxNumber, number, perPage })
      .then(() => NoteAction.fetchNotes(user, category, (number - 1) * perPage, perPage))
      .then(() => this.setState({ perPage }))
      .then(() => spn.stop())
      .catch(err => {
        std.logError(RssSearch.displayName, err.name, err.message);
        this.setState({ isNotValid:  true });
        spn.stop();
      });
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  getCategory(url) {
    const { category } = this.props;
    const baseurl = 'https://auctions.yahoo.co.jp';
    let operation = '';
    let path = '';
    let query = '';
    try {
      const parser = new URL(url);
      query = parser.searchParams;
      path = parser.pathname;
      operation = path.split('/')[1];
    } catch (err) {
      std.logWarn(RssSearch.displayName, err.name, err.message);
      switch(category) {
        case 'closedmarchant':
          url = baseurl + '/closedsearch/closedsearch?' + std.urlencode({ p: url });
          break;
        case 'closedsellers':
          url = baseurl + '/jp/show/rating?' + std.urlencode({ userID: url, role: 'seller' });
          break;
        case 'sellers':
          url = baseurl + '/seller/' + url;
          break;
        default:
          url = baseurl + '/search/search?' + std.urlencode({ p: url });
          break;
      }
    }
    switch(operation) {
      case 'search':
        return ({ category: 'marchant', url });
      case 'seller':
        return ({ category: 'sellers', url });
      case 'closedsearch':
        return ({ category: 'closedmarchant', url });
      case 'jp':
        return path === '/jp/show/rating' && query.has('userID') 
          ? ({ category: 'closedsellers', url }) : null;
      case 'rss':
        return query.has('p') 
          ? ({ category: 'marchant', url }) : query.has('sid') 
            ? ({ category: 'sellers',  url }) : null;
      default:
        return ({ category, url });
    }
  }

  getColor(category) {
    switch(category) {
      case 'marchant':
        return 'skyblue';
      case 'sellers':
        return 'orange';
      case 'closedmarchant':
        return 'green';
      case 'closedsellers':
        return 'yellow';
    }
  }

  render() {
    //std.logInfo(RssSearch.displayName, 'Props', this.props);
    //std.logInfo(RssSearch.displayName, 'State', this.state);
    const { classes, noteNumber, user, category, categorys, title } = this.props;
    const { isAddNote, isSuccess, isNotValid, url, perPage } = this.state;
    const color = this.getColor(category);
    const _categorys = category => categorys.filter(obj => category === obj.category)
      .sort((a, b) => parseInt(a.subcategoryId, 16) < parseInt(b.subcategoryId, 16)
        ? 1 : parseInt(a.subcategoryId, 16) > parseInt(b.subcategoryId, 16)
          ? -1 : 0 );
    const categoryList = category => categorys ? _categorys(category) : null;
    return <div className={classes.noteSearchs}>
      <div className={classes.results}>
        <Typography className={classes.title}>
          全{noteNumber}件中 {perPage > noteNumber ? noteNumber : perPage}件表示
        </Typography>
      </div>
      <FormControl className={classes.inputSelect}>
        <InputLabel htmlFor="results">表示件数</InputLabel>
        <Select value={perPage} onChange={this.handleChangeSelect.bind(this, 'perPage')}>
          <MenuItem value={9999}><em>All</em></MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={300}>300</MenuItem>
        </Select>
      </FormControl>
      <FormControl className={classes.inputText}>
        <InputLabel htmlFor="url">URL</InputLabel>
        <Input id="url" value={url} onChange={this.handleChangeText.bind(this, 'url')}/>
      </FormControl>
      <div className={classes.buttons}>
        <Button variant="raised"
          className={classes.button}
          onClick={this.handleClickButton.bind(this)}>
          {this.props.changed ? '*' : ''}URL登録</Button>
        <RssAddDialog 
          title={title}
          open={isAddNote}
          user={user}
          category={category}
          categorys={categoryList(category)}
          onClose={this.handleCloseDialog.bind(this, 'isAddNote')}
          onSubmit={this.handleSubmit.bind(this)}
        />
        <div className={classes.space} />
        <RssButton color={color}
          onClick={this.handleDownload.bind(this)}
          classes={classes.button}>ダウンロード</RssButton>
        <input type="file" id="file" accept=".csv,.opml,text/csv,text/opml"
          onChange={this.handleChangeFile.bind(this)}
          className={classes.input}/>
        <label htmlFor="file" className={classes.uplabel}>
          <RssButton color={color} component="span"
            classes={classes.upbutton}>アップロード</RssButton>
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
}
RssSearch.displayName = 'RssSearch';
RssSearch.defaultProps = {};
RssSearch.propTypes = {
  classes: PropTypes.object.isRequired
, noteNumber: PropTypes.number.isRequired
, notePage: PropTypes.object.isRequired
, user: PropTypes.string.isRequired
, category: PropTypes.string.isRequired
, file: PropTypes.object
, categorys: PropTypes.array.isRequired
, title: PropTypes.string.isRequired
, changed: PropTypes.bool
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
              , overflow: 'hidden' }
, inputSelect:{ margin: theme.spacing.unit / 3 + 1, minWidth }
, inputText:  { flex: 2, minWidth: minWidth * 2 }
, buttons:    { flex: 0, display: 'flex', flexDirection: 'row' }
, button:     { flex: 1, width: buttonWidth
              , margin: theme.spacing.unit /2
              , textAlign: 'center'
              , wordBreak: 'keep-all', padding: 4 }
, uplabel:     { flex: 1, width: buttonWidth + theme.spacing.unit }
, upbutton:   { width: buttonWidth, height: buttonWidth /2
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
export default withStyles(styles)(RssSearch);
