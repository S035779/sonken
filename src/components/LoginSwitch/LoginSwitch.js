import React from 'react';
import PropTypes from 'prop-types'

import { withStyles } from 'material-ui/styles';
import { Switch } from 'material-ui';
import { FormControlLabel, FormGroup } from 'material-ui/Form';

class LoginSwitch extends React.Component {
  handleChange(event, checked) {
    this.props.onChange(event, checked);
  }

  renderSwitch(auth) {
    return <Switch checked={auth} color="primary"
      onChange={this.handleChange.bind(this)}
      aria-label="LoginSwitch" />;
  }

  render() {
    const {auth} = this.props;
    const renderSwitch = this.renderSwitch(auth);
    return <FormGroup>
      <FormControlLabel
        control={renderSwitch}
        label={auth ? 'Logout' : 'Login'} />
    </FormGroup>;
  }
};
const styles = theme => ({});
LoginSwitch.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(LoginSwitch);
