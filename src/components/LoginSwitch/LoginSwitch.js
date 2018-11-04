import React          from 'react';
import PropTypes      from 'prop-types'

import { withStyles } from '@material-ui/core/styles';
import { Switch, FormControlLabel, FormGroup } from '@material-ui/core';

class LoginSwitch extends React.Component {
  handleChange(event, checked) {
    this.props.onChange(event, checked);
  }

  renderSwitch(auth) {
    return <Switch checked={auth} color="primary" onChange={this.handleChange.bind(this)} aria-label="LoginSwitch" />;
  }

  render() {
    const {auth} = this.props;
    const renderSwitch = this.renderSwitch(auth);
    return <FormGroup><FormControlLabel control={renderSwitch} label={auth ? 'Logout' : 'Login'} /></FormGroup>;
  }
}
LoginSwitch.displayName = 'LoginSwitch';
LoginSwitch.defaultProps = {};
LoginSwitch.propTypes = {
  classes:  PropTypes.object.isRequired
, onChange: PropTypes.func.isRequired
, auth: PropTypes.bool.isRequired
};

const styles = {};
export default withStyles(styles)(LoginSwitch);
