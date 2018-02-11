import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';
import { Select, Input, Button, Typography } from 'material-ui';
import { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import { MenuItem } from 'material-ui/Menu';

class RssSearch extends React.Component {
  handleSubmit() {
    this.props.onSubmit();
  }

  handleUpload() {
    this.props.onUpload();
  }

  handleDownload() {
    this.props.onDownload();
  }

  handleChangeText(event) {
    this.props.onChangeText(event.target.value);
  }

  handleChangeSelect(event) {
    this.props.onChangeSelect(event.target.value);
  }

  render() {
    const {classes, textValue, selectValue} = this.props;
    return <div className={classes.noteSearchs}>
      <div className={classes.results}>
        <Typography className={classes.title}>
          全{213}件中{20}件表示
        </Typography>
      </div>
      <FormControl className={classes.inputSelect}>
        <InputLabel htmlFor="results">表示件数</InputLabel>
        <Select value={20}
          onChange={this.handleChangeSelect}
          inputProps={{name: 'results', id: 'results'}}>
          <MenuItem value=""><em>None</em></MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={300}>300</MenuItem>
          <MenuItem value={1000}>ALL</MenuItem>
        </Select>
      </FormControl>
      <FormControl className={classes.inputText}>
        <InputLabel htmlFor="url">URL</InputLabel>
        <Input id="url" value={textValue}
          onChange={this.handleChangeText.bind(this)}/>
      </FormControl>
      <div className={classes.buttons}>
        <Button raised
          className={classes.button}
          onClick={this.handleSubmit.bind(this)}>
          {this.props.changed ? '*' : ''}URL登録</Button>
        <div className={classes.space} />
        <Button raised
          className={classes.button}
          onClick={this.handleUpload.bind(this)}>
          CSV アップロード</Button>
        <Button raised
          className={classes.button}
          onClick={this.handleDownload.bind(this)}>
          CSV ダウンロード</Button>
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
