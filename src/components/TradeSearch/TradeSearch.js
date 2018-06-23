import React            from 'react';
import PropTypes        from 'prop-types';
import TradeAction      from 'Actions/TradeAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { Select, Input, Button, Typography }
                        from 'material-ui';
import { InputLabel }   from 'material-ui/Input';
import { FormControl }  from 'material-ui/Form';
import { MenuItem }     from 'material-ui/Menu';
import RssButton        from 'Components/RssButton/RssButton';
import RssDialog        from 'Components/RssDialog/RssDialog';

class TradeSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage:   props.itemNumber
    , isSuccess:  false
    , isNotValid: false
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(TradeSearch.displayName, 'Props', nextProps);
    const { itemPage } = nextProps;
    this.setState({ perPage: itemPage.perPage });
  }

  downloadFile(file) {
    std.logInfo(TradeSearch.displayName, 'downloadFile', file);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.target = '_blank';
    a.download = 'download.csv';
    a.click();
  }

  handleDownload() {
    const { user, items } = this.props;
    if(!items) return this.setState({ isNotValid: true })
    std.logInfo(TradeSearch.displayName, 'handleDownload', items);
    TradeAction.download(user, items)
      .then(() => {
        if(this.props.file) this.downloadFile(this.props.file);
        this.setState({ isSuccess: true });
      })
      .catch(err => this.setState({ isNotValid: true }));
  }

  handleChangeSelect(name, event) {
    const { user, itemNumber } = this.props;
    const value = event.target.value;
    std.logInfo(TradeSearch.displayName, 'handleChangeSelet', value);
    switch(name) {
      case 'page':
        this.setState({ perPage: value });
        TradeAction.pagenation(user, {
          maxNumber: Math.ceil(itemNumber / value)
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
    //std.logInfo(TradeSearch.displayName, 'State', this.state);
    const { classes, itemNumber } = this.props;
    const { isSuccess, isNotValid, perPage, filename } = this.state;
    return <div className={classes.noteSearchs}>
      <div className={classes.results}>
        <Typography className={classes.title}>
          全{itemNumber}件中{
            perPage > itemNumber ? itemNumber : perPage
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
      <div className={classes.inputText} />
      <div className={classes.buttons}>
        <div className={classes.button} />
        <div className={classes.space} />
        <RssButton color={'yellow'} 
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
TradeSearch.displayName = 'TradeSearch';
TradeSearch.defaultProps = {};
TradeSearch.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(TradeSearch);
