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
    return <div className={classes.noteButtons}>
      <Checkbox checked={this.state.checked}
        className={classes.button}
        onChange={this.handleChangeCheckbox.bind(this)}
        tabIndex={-1} disableRipple />
      <div className={classes.noteButton}>
      <Button raised size="medium" color="primary"
        className={classes.button}
        onClick={this.handleRead.bind(this)}>
        Read</Button>
      <Button raised size="medium" color="secondary"
        className={classes.button}
        onClick={this.handleDelete.bind(this)}>
        Delete</Button>
      </div>
    </div>;
  }
};
const titleHeight = 62;
const styles = theme => ({
  noteButtons:{ display:    'flex',      flexDirection: 'row'
              , alignItems: 'stretch'
              , height:     titleHeight, minHeight: titleHeight
              , boxSizing:  'border-box'
              , padding:    '5px',       borderBottom: '1px solid #CCC' }
, checkbox:   { flex: '1 1 auto' }
, noteButton: { flex: '1 1 auto' }
, buttons:    { display: 'flex', flexDirection: 'row' }
, button:     { flex: 1, margin: theme.spacing.unit }
});

NoteButtons.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(NoteButtons);
