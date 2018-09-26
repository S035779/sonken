import React            from 'react';
import PropTypes        from 'prop-types';
import BidsAction       from 'Actions/BidsAction';
import NoteAction       from 'Actions/NoteAction';
import std              from 'Utilities/stdutils';
import Spinner          from 'Utilities/Spinner';

import { withStyles }   from '@material-ui/core/styles';
import { Select, Typography, FormControl, InputLabel, MenuItem } from '@material-ui/core';
import RssButton        from 'Components/RssButton/RssButton';
import RssDialog        from 'Components/RssDialog/RssDialog';

class BidsSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage:   props.itemNumber
    , isSuccess:  false
    , isNotValid: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const { itemPage } = nextProps;
    this.setState({ perPage: itemPage.perPage });
  }

  downloadFile(blob) {
    //std.logInfo(BidsSearch.displayName, 'downloadFile', blob);
    const anchor = document.createElement("a");
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

  handleDownload() {
    const { user, itemFilter } = this.props;
    const spn = Spinner.of('app');
    spn.start();
    std.logInfo(BidsSearch.displayName, 'handleDownload', user);
    BidsAction.download(user, itemFilter)
      .then(() => this.downloadFile(this.props.file))
      .then(() => this.setState({ isSuccess: true }))
      .then(() => spn.stop())
      .catch(err => {
        std.logError(BidsSearch.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        spn.stop();
      });
  }

  handleChangeSelect(name, event) {
    const { user, itemNumber } = this.props;
    const perPage = event.target.value;
    const maxNumber = Math.ceil(itemNumber / perPage);
    const number = 1;
    const spn = Spinner.of('app');
    spn.start();
    std.logInfo(BidsSearch.displayName, 'handleChangeSelet', perPage);
    BidsAction.pagenation(user, { maxNumber, number, perPage })
      .then(() => NoteAction.fetchBided(user, (number - 1) * perPage, perPage))
      .then(() => this.setState({ perPage }))
      .then(() => spn.stop())
      .catch(err => {
        std.logError(BidsSearch.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        spn.stop();
      });
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  render() {
    //std.logInfo(BidsSearch.displayName, 'State', this.state);
    const { classes, itemNumber } = this.props;
    const { isSuccess, isNotValid, perPage } = this.state;
    return <div className={classes.noteSearchs}>
      <div className={classes.results}>
        <Typography className={classes.title}>
          全{itemNumber}件中 {perPage > itemNumber ? itemNumber : perPage}件表示
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
      <div className={classes.inputText} />
      <div className={classes.buttons}>
        <div className={classes.button} />
        <div className={classes.space} />
        <RssButton color={'green'}
          onClick={this.handleDownload.bind(this)}
          classes={classes.button}>ダウンロード</RssButton>
        <RssDialog open={isSuccess} title={'送信完了'}
          onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
        要求を受け付けました。
        </RssDialog>
        <RssDialog open={isNotValid} title={'送信エラー'}
          onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
        内容に不備があります。もう一度確認してください。
        </RssDialog>
        <div className={classes.button} />
      </div>
    </div>;
  }
}
BidsSearch.displayName = 'BidsSearch';
BidsSearch.defaultProps = {};
BidsSearch.propTypes = {
  classes: PropTypes.object.isRequired
, items: PropTypes.array.isRequired
, itemFilter: PropTypes.object.isRequired
, user: PropTypes.string.isRequired
, file: PropTypes.object
, itemNumber: PropTypes.number.isRequired
, itemPage: PropTypes.object.isRequired
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
              , wordBreak: 'keep-all', padding: 4 }
, results:    { flex: 1, minWidth
              , display: 'flex'
              , justifyContent: 'center', alignItems: 'flex-end' }
, title:      { wordBreak: 'keep-all' }
, space:      { flex: 0, margin: theme.spacing.unit }
});
export default withStyles(styles)(BidsSearch);
