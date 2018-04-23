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
        classes={{
          root: classes[color]
        , checked: classes.checked
        }}
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
, checked: {}
, default: {
    color: default_color
  , '&$checked': {
      color: default_color
    }
  }
, primary: {
    color: default_color
  , '&$checked': {
      color: primary_color
    }
  }
, secondary: {
    color: default_color
  , '&$checked': {
      color: secondary_color
    }
  }
, warning: {
    color: default_color
  , '&$checked': {
      color: warning_color
    }
  }
, success: {
    color: default_color
  , '&$checked': {
      color: success_color
    }
  }
, danger: {
    color: default_color
  , '&$checked': {
      color: danger_color
    }
  }
});
RssCheckbox.displayName = 'RssCheckbox';
RssCheckbox.defaultProps = {};
RssCheckbox.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssCheckbox);
