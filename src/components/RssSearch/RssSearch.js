import React              from 'react';
import PropTypes          from 'prop-types';
import * as R             from 'ramda';
import NoteAction         from 'Actions/NoteAction';
import std                from 'Utilities/stdutils';
import Spinner            from 'Utilities/Spinner';

import { withStyles }     from '@material-ui/core/styles';
import { Select, Input, Button, Typography, InputLabel, FormControl, MenuItem } from '@material-ui/core';
import RssButton          from 'Components/RssButton/RssButton';
import RssDialog          from 'Components/RssDialog/RssDialog';
import RssAddDialog       from 'Components/RssAddDialog/RssAddDialog';
import RssUploadDialog    from 'Components/RssUploadDialog/RssUploadDialog';
import RssDownloadDialog  from 'Components/RssDownloadDialog/RssDownloadDialog';

class RssSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url:          ''
    , perPage:      props.noteNumber
    , isSuccess:    false
    , isNotValid:   false
    , isAddNote:    false
    , isLimit:      false
    , isUpload:     false
    , isDownload:   false
    };
  }

  componentDidMount() {
    this.spn = Spinner.of('app');
  }

  componentWillUnmount() {
    this.spn.stop();
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(RssSearch.displayName, 'Props', nextProps);
    const { notePage } = nextProps;
    this.setState({ perPage: notePage.perPage });
  }

  handleDetailSubmit(title, categoryIds) {
    const { user } = this.props;
    const request = this.getCategory(this.state.url);
    if(request) {
      this.spn.start();
      std.logInfo(RssSearch.displayName, 'Request', this.state.url);
      NoteAction.create(user, { url: request.url, category: request.category, title, categoryIds })
        .then(() => this.setState({ isSuccess: true, url: '' }))
        .then(() => this.spn.stop())
        .catch(err => {
          std.logError(RssSearch.displayName, err.name, err.message);
          this.setState({ isNotValid: true, url: '' });
          this.spn.stop();
        });
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleURLSubmit() {
    const { noteNumber, profile, preference } = this.props;
    const menu = R.find(obj => obj.id === profile.plan)(preference.menu)
    std.logInfo(RssSearch.displayName, 'handleURLSubmit', menu);
    if(menu && menu.number >= noteNumber + 1) {
      this.setState({ isAddNote: true });
    } else {
      this.setState({ isLimit: true });
    }
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
    this.spn.start();
    std.logInfo(RssSearch.displayName, 'handleChangeSelect', perPage);
    NoteAction.pagenation(user, { maxNumber, number, perPage })
      .then(() => NoteAction.fetchNotes(user, category, (number - 1) * perPage, perPage))
      .then(() => this.setState({ perPage }))
      .then(() => this.spn.stop())
      .catch(err => {
        std.logError(RssSearch.displayName, err.name, err.message);
        this.setState({ isNotValid:  true });
        this.spn.stop();
      });
  }

  handleOpenDialog(name) {
    this.setState({ [name]: true });
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
    const { classes, noteNumber, itemsNumber, user, category, categorys, title, file } = this.props;
    const { isUpload, isDownload, isLimit, isAddNote, isSuccess, isNotValid, url, perPage } = this.state;
    const color = this.getColor(category);
    const _categorys = category => categorys.filter(obj => category === obj.category)
      .sort((a, b) => parseInt(a.subcategoryId, 16) < parseInt(b.subcategoryId, 16)
        ? 1 : parseInt(a.subcategoryId, 16) > parseInt(b.subcategoryId, 16)
          ? -1 : 0 );
    const categoryList = category => categorys ? _categorys(category) : null;
    const newSubCategory = std.formatDate(new Date(), 'YYYY-MM-DD hh:mm');
    const downloadFormat = '0001';
    return <div className={classes.noteSearchs}>
      <div className={classes.results}>
        <Typography variant="body2" align="center"
          className={classes.title}>全 {noteNumber}件中 {perPage > noteNumber ? noteNumber : perPage}件表示</Typography>
        <Typography variant="body2" align="center" 
          className={classes.title}>絞込結果 {itemsNumber}件</Typography>
      </div>
      <FormControl className={classes.inputSelect}>
        <InputLabel htmlFor="results">表示件数</InputLabel>
        <Select value={perPage} onChange={this.handleChangeSelect.bind(this, 'perPage')}>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={300}>300</MenuItem>
          <MenuItem value={1000}>1000</MenuItem>
        </Select>
      </FormControl>
      <FormControl className={classes.inputText}>
        <InputLabel htmlFor="url">URL</InputLabel>
        <Input id="url" value={url} onChange={this.handleChangeText.bind(this, 'url')}/>
      </FormControl>
      <div className={classes.buttons}>
        <Button variant="contained" className={classes.button} onClick={this.handleURLSubmit.bind(this)}>
          {this.props.changed ? '*' : ''}URL登録
        </Button>
        <div className={classes.space} />
        <RssButton color={color} onClick={this.handleOpenDialog.bind(this, 'isDownload')} classes={classes.button}>
          ダウンロード
        </RssButton>
        <RssButton color={color} onClick={this.handleOpenDialog.bind(this, 'isUpload')} classes={classes.button}>
          アップロード
        </RssButton>
        <RssAddDialog title={title} open={isAddNote} user={user} category={category} categorys={categoryList(category)}
          onClose={this.handleCloseDialog.bind(this, 'isAddNote')} onSubmit={this.handleDetailSubmit.bind(this)} />
        <RssUploadDialog open={isUpload} title={'カテゴリ名'} user={user} category={category} 
          name={newSubCategory} perPage={perPage} onClose={this.handleCloseDialog.bind(this, 'isUpload')} />
        <RssDownloadDialog open={isDownload} title={'フォーマット'} user={user} category={category} 
          name={downloadFormat} file={file} onClose={this.handleCloseDialog.bind(this, 'isDownload')}/>
        <RssDialog open={isSuccess} title={'送信完了'} onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
          要求を受け付けました。
        </RssDialog>
        <RssDialog open={isNotValid} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
          内容に不備があります。もう一度確認してください。
        </RssDialog>
        <RssDialog open={isLimit} title={'送信エラー'} onClose={this.handleCloseDialog.bind(this, 'isLimit')}>
          登録数上限に達しました。アップグレードをご検討ください。
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
, itemsNumber: PropTypes.number.isRequired
, notePage: PropTypes.object.isRequired
, user: PropTypes.string.isRequired
, category: PropTypes.string.isRequired
, file: PropTypes.object
, categorys: PropTypes.array.isRequired
, title: PropTypes.string.isRequired
, changed: PropTypes.bool
, profile: PropTypes.object.isRequired
, preference: PropTypes.object.isRequired
};

const titleHeight = 62;
const minWidth = 125;
const buttonWidth = 88;
const styles = theme => ({
  noteSearchs:  { display: 'flex', flexDirection: 'row', alignItems: 'stretch', height: titleHeight, minHeight: titleHeight
                , boxSizing: 'border-box', padding: '5px', overflow: 'hidden' }
, inputSelect:  { margin: theme.spacing.unit / 3 + 1, minWidth }
, inputText:    { flex: 2, minWidth: minWidth * 2 }
, buttons:      { flex: 0, display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, width: buttonWidth, margin: theme.spacing.unit /2, textAlign: 'center', wordBreak: 'keep-all', padding: 4 }
, uplabel:      { flex: 1, width: buttonWidth + theme.spacing.unit }
, upbutton:     { width: buttonWidth, height: buttonWidth /2, margin: theme.spacing.unit /2, textAlign: 'center'
                , wordBreak: 'keep-all', padding: 4 }
, results:      { flex: 1, minWidth, display: 'flex', flexDirection: 'column', justifyContent: 'center' }
, title:        { flex: 1, wordBreak: 'keep-all' }
, space:        { flex: 0, margin: theme.spacing.unit }
, input:        { display: 'none' }
});
export default withStyles(styles)(RssSearch);
