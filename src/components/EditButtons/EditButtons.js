import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';
import { Input, Button } from 'material-ui';
import { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';

class EditButtons extends React.Component {
  handleSave() {
    this.props.onSave();
  }

  handleDelete() {
    this.props.onDelete();
  }

  handleShow() {
    this.props.onShow();
  }

  handleChangeInput(event) {
    this.props.onChange(event.target.value);
  }

  render() {
    const {classes, value} = this.props;
    return <div className={classes.editButtons}>
      <FormControl className={classes.inputText}>
        <InputLabel htmlFor="name-simple">Title</InputLabel>
        <Input id="name-simple" value={value}
          onChange={this.handleChangeInput.bind(this)}/>
      </FormControl>
      <div className={classes.editButton}>
        <div className={classes.buttons}>
        <Button raised size="medium" color="primary"
          className={classes.button}
          onClick={this.handleSave.bind(this)}>
          {this.props.changed ? '*' : ''}Save</Button>
        <Button raised size="medium" color="secondary"
          className={classes.button}
          onClick={this.handleDelete.bind(this)}>
          Delete</Button>
        <Button raised size="medium"
          className={classes.button}
          onClick={this.handleShow.bind(this)}>
            Show</Button>
        </div>
      </div>
    </div>;
  }
};

const titleHeight = 62;
const styles = theme => ({
  editButtons:{ display: 'flex', flexDirection: 'row'
              , alignItems: 'stretch'
              , height: titleHeight, minHeight: titleHeight
              , boxSizing: 'border-box'
              , padding: '5px', borderBottom: '1px solid #CCC' }
, inputText:  { flex: '1 1 auto' }
, editButton: { flex: '0 0 auto' }
, buttons:    { display: 'flex', flexDirection: 'row' }
, button:     { flex: 1, margin: theme.spacing.unit }
});

EditButtons.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(EditButtons);
