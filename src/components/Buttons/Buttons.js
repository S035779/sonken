import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import Save from 'material-ui-icons/Save';
import Delete from 'material-ui-icons/Delete';


class Buttons extends React.Component {
  handleSave() {
    this.props.onSave();
  }

  handleDelete() {
    this.props.onDelete();
  }

  handleShow() {
    this.props.onShow();
  }

  render() {
    const {classes} = this.props;
    return <div className={classes.root}>
      <Button raised size="medium" color="primary"
        className={classes.button}
        onClick={this.handleSave.bind(this)}>
        {this.props.changed ? '*' : ''}
        <Save className={classes.leftIcon} />Save</Button>
      <Button raised size="medium" color="secondary"
        className={classes.button}
        onClick={this.handleDelete.bind(this)}>
          Delete<Delete className={classes.rightIcon} /></Button>
      <Button raised size="medium"
        className={classes.button}
        onClick={this.handleShow.bind(this)}>
          Show</Button>
    </div>;
  }
};

const styles = theme => ({
  root:       { display: 'flex', flexDirection: 'row' },
  button:     { flex: 1
                , margin:     theme.spacing.unit },
  rightIcon:  { marginLeft:   theme.spacing.unit },
  leftIcon:   { marginRight:  theme.spacing.unit }
});

Buttons.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Buttons);
