import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';
import { Button, Checkbox } from 'material-ui';


class NoteButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = { checked: false };
  }

  handleChangeCheckbox(event) {
    this.setState({ checked: event.target.checked });
  }

  handleRead() {
    this.props.onSave();
  }

  handleDelete() {
    this.props.onDelete();
  }

  render() {
    const {classes} = this.props;
    return <div className={classes.buttons}>
      <Checkbox checked={this.state.checked}
        className={classes.button}
        onChange={this.handleChangeCheckbox.bind(this)}
        tabIndex={-1} disableRipple />
      <Button raised size="medium" color="primary"
        className={classes.button}
        onClick={this.handleRead.bind(this)}>
        Read</Button>
      <Button raised size="medium" color="secondary"
        className={classes.button}
        onClick={this.handleDelete.bind(this)}>
        Delete</Button>
    </div>;
  }
};

const styles = theme => ({
  buttons:    { display: 'flex', flexDirection: 'row' },
  button:     { flex: 1
              , margin:     theme.spacing.unit }
});

NoteButtons.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(NoteButtons);
