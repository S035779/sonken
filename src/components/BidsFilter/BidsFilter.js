import React from 'react';
import PropTypes from 'prop-types';
import NoteAction from 'Actions/NoteAction';

import { withStyles } from 'material-ui/styles';
import { Input, Button, Checkbox, Typography, TextField }
  from 'material-ui';
import { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';

class BidsFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notes:          props.notes
    , endBidding:     false
    , allBidding:     false
    , inBidding:      false
    , bidStartTime:   ''
    , bidStopTime:    ''
    };
  }

  componentWillReceiveProps(props) {
    this.logInfo('props', props);
    this.setState({ note: props.notes });
  }

  handleChangeTrade(traded) {
  }

  handleChangeInput(name, event) {
  }

  handleChangeCheckbox(name, event) {
  }

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  }

  render() {
    this.logInfo('render', this.state);
    const { classes, notes } = this.props;
    return <div className={classes.forms}>
      <div className={classes.edit}>
        <Typography variant="subheading" noWrap
          className={classes.title}>Amazon商品名：</Typography>
      </div>
    </div>;
  }
};

const listWidth = 400;
const columnHeight = 62;
const editWidth = `calc(100% - ${listWidth}px)`;
const styles = theme => ({
  forms:      { display: 'flex', flexDirection: 'column' }
, header:     { height: columnHeight, minHeight: columnHeight
              , boxSizing: 'border-box'
              , padding: '5px' }
, title:      { margin: theme.spacing.unit * 1.75 }
, edit:       { display: 'flex', flexDirection: 'row'
              , alignItems: 'stretch'
              , height: columnHeight, minHeight: columnHeight
              , boxSizing: 'border-box'
              , padding: '5px' }
, buttons:    { display: 0, display: 'flex', flexDirection: 'row' }
, button:     { flex: 1, margin: theme.spacing.unit
              , wordBreak: 'keep-all' }
, link:       { flex: 1, margin: theme.spacing.unit /2
              , wordBreak: 'keep-all' }
, name:       { flex: 1, margin: theme.spacing.unit /2
              , border: '1px solid #CCC'
              , wordBreak: 'keep-all' }
, text:       { marginLeft: theme.spacing.unit * 1.75 }
, memo:       { display: 'flex', flexDirection: 'row'
              , alignItems: 'stretch'
              , height: columnHeight * 2, minHeight: columnHeight * 2
              , boxSizing: 'border-box' }
, field:      { paddingTop: 5 }
, textarea:   { width: '100%', padding: 5 }
});
BidsFilter.displayName = 'BidsFilter';
BidsFilter.defaultProps = { note: null };
BidsFilter.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(BidsFilter);
