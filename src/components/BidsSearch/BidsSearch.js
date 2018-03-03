import React            from 'react';
import PropTypes        from 'prop-types';
import BidsAction       from 'Actions/BidsAction';

import { withStyles }   from 'material-ui/styles';
import {
  Select, Input, Button, Typography
}                       from 'material-ui';
import { InputLabel }   from 'material-ui/Input';
import { FormControl }  from 'material-ui/Form';
import { MenuItem }     from 'material-ui/Menu';
import RssButton        from 'Components/RssButton/RssButton';

class BidsSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filename:  ''
    , perPage:   props.itemNumber
    };
  }

  componentWillReceiveProps(nextProps) {
    this.logInfo('componentWillReceiveProps', nextProps);
    const { itemPage } = nextProps;
    this.setState({ perPage: itemPage.perPage });
  }

  handleDownload() {
    const { filename } = this.state;
    const { user } = this.props;
    this.logInfo('handleDownload', filename);
    BidsAction.download(user, filename);
  }

  handleChangeSelect(name, event) {
    const { user, itemNumber } = this.props;
    const value = event.target.value;
    this.logInfo('handleChangeSelet', value);
    switch(name) {
      case 'page':
        BidsAction.pagenation(user, {
          maxNumber: Math.ceil(itemNumber / value)
          , number: 1, perPage: value
        });
        this.setState({ perPage: value });
        break;
    }
  }

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  }

  render() {
    const { classes, itemNumber } = this.props;
    const { perPage, filename } = this.state;
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
        <RssButton color={'green'}
          onClick={this.handleDownload.bind(this)}
          classes={classes.button}>CSV ダウンロード</RssButton>
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
BidsSearch.displayName = 'BidsSearch';
BidsSearch.defaultProps = {};
BidsSearch.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(BidsSearch);
