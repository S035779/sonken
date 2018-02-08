import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';
import { Select, Input, Button } from 'material-ui';
import { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import { MenuItem } from 'material-ui/Menu';

class NoteSearch extends React.Component {
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
      <FormControl className={classes.inputSelect}>
        <InputLabel htmlFor="results">Results</InputLabel>
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
      <div className={classes.noteSearch}>
        <div className={classes.buttons}>
        <Button raised size="medium" color="primary"
          className={classes.button}
          onClick={this.handleSubmit.bind(this)}>
          {this.props.changed ? '*' : ''}Submit</Button>
        <Button raised size="medium"
          className={classes.button}
          onClick={this.handleUpload.bind(this)}>
          Upload</Button>
        <Button raised size="medium"
          className={classes.button}
          onClick={this.handleDownload.bind(this)}>
          Download</Button>
        </div>
      </div>
    </div>;
  }
};

const titleHeight = 62;
const styles = theme => ({
  noteSearchs:{ display: 'flex', flexDirection: 'row'
              , alignItems: 'stretch'
              , height: titleHeight, minHeight: titleHeight
              , boxSizing: 'border-box'
              , padding: '5px', borderBottom: '1px solid #CCC' }
, inputSelect:{ margin: theme.spacing.unit /3 
              , minWidth: 120
              , flex: '0 0 auto' }
, inputText:  { flex: '1 1 auto' }
, noteSearch: { flex: '0 0 auto' }
, buttons:    { display: 'flex', flexDirection: 'row' }
, button:     { flex: 1, margin: theme.spacing.unit }
});

NoteSearch.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(NoteSearch);
