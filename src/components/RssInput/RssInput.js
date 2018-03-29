import React          from 'react';
import PropTypes      from 'prop-types';

import { withStyles } from 'material-ui/styles';
import { TextField }  from 'material-ui';

class RssInput extends React.Component {
  handleChange(event) {
    this.props.onChange(event);
  }

  render() {
    const { classes, type, id, label, value } = this.props;
    const inputProps = {
      disableUnderline: true,
      classes: {
        root: classes.textFieldRoot,
        input: classes.textFieldInput
      }
    };
    const inputLabelProps = {
      shrink: true,
      className: classes.textFieldFormLabel
    }

    return <TextField fullWidth
      type={type}
      value={value}
      label={label}
      id={id}
      InputProps={inputProps}
      InputLabelProps={inputLabelProps}
      onChange={this.handleChange.bind(this)}
    />;
  }
}

const styles = theme => ({
  textFieldRoot: {
    padding: 0,
    'label + &': {
      marginTop: theme.spacing.unit * 3
    }
  },
  textFieldInput: {
    borderRadius: 4,
    backgroundColor: theme.palette.common.white,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 12px',
    width: 'calc(100% - 24px)',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:focus': {
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)'
    }
  },
  textFieldFormLabel: {
    fontSize: 18
  }
});
RssInput.displayName = 'RssInput';
RssInput.defaultProps = {};
RssInput.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssInput);
