import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';
import { Button, Checkbox } from 'material-ui';

class RssButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = { checked: false };
  }

  handleChangeCheckbox(event) {
    this.setState({ checked: event.target.checked });
    this.props.onSelect();
  }

  handleRead() {
    this.props.onRead();
  }

  handleDelete() {
    this.props.onDelete();
  }

  render() {
    const {classes} = this.props;
    return <div className={classes.noteButtons}>
      <Checkbox checked={this.state.checked}
        className={classes.checkbox}
        onChange={this.handleChangeCheckbox.bind(this)}
        tabIndex={-1} disableRipple />
      <div className={classes.buttons}>
        <Button variant="raised"
          className={classes.button}
          onClick={this.handleRead.bind(this)}>既読にする</Button>
        <Button variant="raised"
          className={classes.button}
          onClick={this.handleDelete.bind(this)}>削除</Button>
      </div>
    </div>;
  }
};

const titleHeight   = 62;
const checkboxWidth = 38;
const styles = theme => ({
  noteButtons:  { display: 'flex', flexDirection: 'row'
                , alignItems: 'stretch', justifyContent: 'flex-start' 
                , height: titleHeight, minHeight: titleHeight
                , boxSizing: 'border-box'
                , padding: '5px' }
, checkbox:     { flex: 0, minWidth: checkboxWidth }
, buttons:      { flex: 0, display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, margin: theme.spacing.unit
                , wordBreak: 'keep-all' }
});
RssButtons.displayName = 'RssButtons';
RssButtons.defaultProps = {};
RssButtons.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssButtons);
