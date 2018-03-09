import React          from 'react';
import PropTypes      from 'prop-types';
import UserAction     from 'Actions/UserAction';
import std            from 'Utilities/stdutils';

import { withStyles } from 'material-ui/styles';
import { Button, Checkbox }
                      from 'material-ui';

class AdminButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = { checked: false };
  }

  componentDidMount() {
    UserAction.select(this.props.admin, []);
  }

  handleChangeCheckbox(event) {
    const checked = event.target.checked;
    this.setState({ checked });

    const { admin, users } = this.props;
    const ids = checked ? users.map(user => user.id) : [];
    std.logInfo(AdminButtons.displayName, 'handleChangeCheckbox', ids);
    UserAction.select(admin, ids);
  }

  handleReaded() {
    const { admin, selectedUserId } = this.props;
    std.logInfo(AdminButtons.displayName, 'handleReaded', selectedUserId);
    UserAction.createRead(admin, selectedUserId);
    this.setState({ checked: false });
  }

  handleDelete() {
    const { admin, selectedUserId } = this.props;
    std.logInfo(AdminButtons.displayName, 'handleDelete', selectedUserId);
    if(window.confirm('Are you sure?')) {
      UserAction.delete(admin, selectedUserId);
      this.setState({ checked: false });
    }
  }

  render() {
    const { classes } = this.props;
    const { checked } = this.state;
    return <div className={classes.userButtons}>
      <Checkbox checked={checked}
        className={classes.checkbox}
        onChange={this.handleChangeCheckbox.bind(this)}
        tabIndex={-1} disableRipple />
      <div className={classes.buttons}>
        <Button variant="raised"
          className={classes.button}
          onClick={this.handleReaded.bind(this)}>既読にする</Button>
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
  userButtons:  { display: 'flex', flexDirection: 'row'
                , alignItems: 'stretch', justifyContent: 'flex-start' 
                , height: titleHeight, minHeight: titleHeight
                , boxSizing: 'border-box'
                , padding: '5px' }
, checkbox:     { flex: 0, minWidth: checkboxWidth }
, buttons:      { flex: 0, display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, margin: theme.spacing.unit
                , wordBreak: 'keep-all' }
});
AdminButtons.displayName = 'AdminButtons';
AdminButtons.defaultProps = {};
AdminButtons.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(AdminButtons);
