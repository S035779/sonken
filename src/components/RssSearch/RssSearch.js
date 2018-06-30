import React            from 'react';
import PropTypes        from 'prop-types';
import NoteAction       from 'Actions/NoteAction';
import std              from 'Utilities/stdutils';
import Spinner          from 'Utilities/Spinner';

import { withStyles }   from 'material-ui/styles';
import { Select, Input, Button, Typography }
                        from 'material-ui';
import { InputLabel }   from 'material-ui/Input';
import { FormControl }  from 'material-ui/Form';
import { MenuItem }     from 'material-ui/Menu';
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
    //std.logInfo(RssSearch.displayName, 'Props', nextProps);
    const { notePage } = nextProps;
    this.setState({ perPage: notePage.perPage });
  }

  downloadFile(blob) {
    std.logInfo(RssSearch.displayName, 'downloadFile', blob);
    const a = document.createElement('a');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const fileReader = new FileReader();
    fileReader.onload = function() {
      a.href = URL.createObjectURL(
        new Blob([bom, this.result], { type: 'text/csv' }) );
      a.target = '_blank';
      a.download = 'download.csv';
      a.click();
    }
    fileReader.readAsArrayBuffer(blob);
  }

  handleSubmit(title, categoryIds) {
    std.logInfo(RssSearch.displayName, 'handleSubmit', title);
    const { url } = this.state;
    const { user } = this.props;
    const category = url ? this.getCategory(url) : null;
    if(category) {
      const spn = Spinner.of('app');
      spn.start();
      NoteAction.create(user, { url, category, title, categoryIds })
        .then(()    => this.setState({ isSuccess:   true, url: '' }))
        .then(()    => spn.stop())
        .catch(err  => {
          std.logError(RssSearch.displayName, err.name, err.message);
          this.setState({ isNotValid:  true, url: '' });
          spn.stop();
        })
      ;
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleClickButton() {
    this.setState({ isAddNote: true });
  }

  getCategory(url) {
    const parser = new URL(url);
    const api = parser.pathname.split('/')[1];
    const query = parser.searchParams;
    switch(api) {
      case 'search':
        return 'marchant';
      case 'seller':
        return 'sellers';
      case 'rss':
        return query.has('p')
          ? 'marchant'
          : query.has('sid')
            ? 'sellers'
            : null;
    }
  }

  handleDownload(event) {
    const { user, category } = this.props;
    std.logInfo(RssSearch.displayName, 'handleDownload', user);
    const spn = Spinner.of('app');
    spn.start();
    NoteAction.download(user, category)
      .then(()    => this.setState({ isSuccess:   true }) )
      .then(()    => this.downloadFile(this.props.file)   )
      .then(()    => spn.stop()                           )
      .catch(err  => {
        std.logError(RssSearch.displayName, err.name, err.message);
        this.setState({ isNotValid:  true });
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
      .then(()    => this.setState({ isSuccess:   true }) )
      .then(()    => spn.stop()                           )
      .catch(err  => {
        std.logError(RssSearch.displayName, err.name, err.message);
        this.setState({ isNotValid:  true });
        spn.stop();
      })
    ;
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
    const { classes, noteNumber, user, category, categorys } = this.props;
    const { isAddNote, isSuccess, isNotValid, url, perPage, filename }
      = this.state;
    const color = category === 'marchant' ? 'skyblue' : 'orange';
    const _categorys
      = category => categorys
        .filter(obj => category === obj.category)
        .sort((a, b) => 
          parseInt(a.subcategoryId, 16) < parseInt(b.subcategoryId, 16)
            ? 1   :
          parseInt(a.subcategoryId, 16) > parseInt(b.subcategoryId, 16)
            ? -1  : 0
        );
    const categoryList
      = category => categorys ? _categorys(category) : null;
    return <div className={classes.noteSearchs}>
      <div className={classes.results}>
        <Typography className={classes.title}>
          全{noteNumber}件中 {perPage > noteNumber ? noteNumber : perPage}件表示
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
          onClick={this.handleClickButton.bind(this)}>
          {this.props.changed ? '*' : ''}URL登録</Button>
        <RssAddDialog 
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
        <input type="file" id="file" accept=".csv,.opml,text/csv, text/opml"
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
RssSearch.displayName = 'RssSearch';
RssSearch.defaultProps = {};
RssSearch.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssSearch);
