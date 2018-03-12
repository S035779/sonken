import React              from 'react';
import PropTypes          from 'prop-types';

import { withStyles }     from 'material-ui/styles';
import { Input, Button }  from 'material-ui';
import { InputLabel }     from 'material-ui/Input';
import { FormControl }    from 'material-ui/Form';
import RssButton          from 'Components/RssButton/RssButton';

class EditButtons extends React.Component {
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

  render() {
    const {classes, value} = this.props;
    const primary = 'skyblue';
    const secondary = 'orange';
    return <div className={classes.edit}>
      <FormControl className={classes.inputText}>
        <InputLabel htmlFor="name-simple">タイトル</InputLabel>
        <Input id="name-simple" value={value}
          onChange={this.handleChangeInput.bind(this)}/>
      </FormControl>
      <div className={classes.buttons}>
        <RssButton color={primary}
          onClick={this.handleDraft.bind(this)}
          className={classes.button}>下書き</RssButton>
        <RssButton color={primary}
          onClick={this.handleSave.bind(this)}
          className={classes.button}>
        {this.props.changed ? '*' : ''}変更する</RssButton>
        <RssButton color={secondary}
          onClick={this.handleDelete.bind(this)}
          className={classes.button}>削除</RssButton>
      </div>
    </div>;
  }
};

const columnHeight = 62;
const styles = theme => ({
  edit:       { display: 'flex', flexDirection: 'row'
              , alignItems: 'stretch'
              , height: columnHeight, minHeight: columnHeight
              , boxSizing: 'border-box'
              , padding: '5px', borderBottom: '1px solid #CCC' }
, inputText:  { flex: 2 }
, buttons:    { flex: 0
              , padding: theme.spacing.unit
              , display: 'flex', flexDirection: 'row' }
, button:     { flex: 1 }
});

EditButtons.displayName = 'EditButtons';
EditButtons.defaultProps = {};
EditButtons.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(EditButtons);
