import React              from 'react';
import PropTypes          from 'prop-types';
//import std                from 'Utilities/stdutils';

import { withStyles }     from '@material-ui/core/styles';
import { Input, FormControl, InputLabel }  from '@material-ui/core';
import RssButton          from 'Components/RssButton/RssButton';

class EditButtons extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      changed: props.changed
    , attached: props.attached
    , value: props.value
    };
  }

  componentWillReceiveProps(nextProps) {
    const { changed, attached, value } = nextProps;
    this.setState({ changed, attached, value });
  }

  handleSave() {
    this.props.onSave();
  }

  handleDelete() {
    this.props.onDelete();
  }

  handleDraft() {
    this.props.onDraft();
  }

  handleChangeInput(event) {
    this.props.onChange(event.target.value);
  }

  handleChangeFile(event) {
    const file = event.target.files[0];
    this.props.onUpload(file);
  }

  render() {
    //std.logInfo(EditButtons.displayName, 'Props', this.props);
    const { classes } = this.props;
    const { changed, attached, value } = this.state;
    const primary = 'skyblue';
    const secondary = 'orange';
    return <div className={classes.edit}>
      <FormControl className={classes.inputText}>
        <InputLabel htmlFor="name-simple">タイトル</InputLabel>
        <Input id="name-simple" value={value} onChange={this.handleChangeInput.bind(this)}/>
      </FormControl>
      <div className={classes.buttons}>
        <RssButton color={primary} onClick={this.handleDraft.bind(this)} className={classes.button}>下書き</RssButton>
        <RssButton color={primary} onClick={this.handleSave.bind(this)} className={classes.button}>
          {changed ? '*' : ''}変更する
        </RssButton>
        <input type="file" id="file" accept="application/zip" onChange={this.handleChangeFile.bind(this)} className={classes.input}/>
        <label htmlFor="file">
          <RssButton color={primary} component="span" className={classes.button}>{attached ? '*' : ''}添付する</RssButton>
        </label>
        <RssButton color={secondary} onClick={this.handleDelete.bind(this)} className={classes.button}>削除</RssButton>
      </div>
    </div>;
  }
}
EditButtons.displayName = 'EditButtons';
EditButtons.defaultProps = {};
EditButtons.propTypes = {
  classes: PropTypes.object.isRequired
, changed: PropTypes.bool
, attached: PropTypes.bool.isRequired
, onSave: PropTypes.func.isRequired
, onDelete: PropTypes.func.isRequired
, onDraft: PropTypes.func.isRequired
, onChange: PropTypes.func.isRequired
, onUpload: PropTypes.func.isRequired
, value: PropTypes.string.isRequired
};

const columnHeight = 62;
const styles = theme => ({
  edit:       { display: 'flex', flexDirection: 'row'
              , alignItems: 'stretch'
              , height: columnHeight, minHeight: columnHeight
              , boxSizing: 'border-box'
              , padding: '5px', borderBottom: '1px solid #CCC' }
, inputText:  { flex: 1 }
, buttons:    { display: 'flex', flexDirection: 'row'
              , padding: theme.spacing.unit }
, button:     { flex: 1, margin: theme.spacing.unit
              , wordBreak: 'keep-all' }
, input:      { display: 'none' }
});
export default withStyles(styles)(EditButtons);
