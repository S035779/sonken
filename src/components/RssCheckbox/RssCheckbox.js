import React          from 'react';
import PropTypes      from 'prop-types';

import { withStyles } from 'material-ui/styles';
import { Checkbox }   from 'material-ui';
import { CheckBoxOutlineBlank, CheckBox }
                      from 'material-ui-icons';

class RssCheckbox extends React.Component {
  render() {
    const { classes, color, onChange, type, value
      , checked, ...other } = this.props;
    return <Checkbox type={type}
        classes={{ checked: classes[color] }}
        value={value}
        checked={checked}
        icon={<CheckBoxOutlineBlank className={classes.sizeIcon} />}
        checkedIcon={<CheckBox className={classes.sizeIcon} />}
        onChange={onChange}
        {...other }
      />;
  }
};

const default_color   = '#888888';
const primary_color   = '#477AF7';
const secondary_color = '#29CBEF';
const warning_color   = '#FEA634';
const success_color   = '#87CC16';
const danger_color    = '#FA404B';
const theme = {
};
const styles = theme => ({
  sizeIcon: { fontSize: 16 }
, default: {
      color: default_color
  }
, primary: {
      color: primary_color
  }
, secondary: {
      color: secondary_color
  }
, warning: {
      color: warning_color
  }
, success: {
      color: success_color
  }
, danger: {
      color: danger_color
  }
});
RssCheckbox.displayName = 'RssCheckbox';
RssCheckbox.defaultProps = {};
RssCheckbox.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssCheckbox);