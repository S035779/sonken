import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { withStyles } from 'material-ui/styles';
import { BottomNavigation } from 'material-ui';
import { BottomNavigationAction } from 'material-ui/BottomNavigation';
import { RssFeed as RssIcon, List as ListIcon
       , CheckCircle as CheckIcon } from 'material-ui-icons';

class ButtonNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: 'marchant' };
  }

  handleChange(event, value) {
    switch(value) {
      case 'marchant':
        this.props.history.push('/');
        break;
      case 'sellers':
        this.props.history.push('/sellers');
        break;
      case 'bids':
        this.props.history.push('/bids');
        break;
      case 'trade':
        this.props.history.push('/trade');
        break;
    }
    this.setState({ value });
  }

  render() {
    const { classes } = this.props;
    const { value } = this.state;
    return <BottomNavigation showLabels
      color="inherit"
      className={classes.root}
      value={value}
      onChange={this.handleChange.bind(this)}
    >
      <BottomNavigationAction
        label="Marchant"    value="marchant" icon={<RssIcon />} />
      <BottomNavigationAction
        label="Sellers"     value="sellers"  icon={<RssIcon />} />
      <BottomNavigationAction
        label="Bids"        value="bids"     icon={<ListIcon />} />
      <BottomNavigationAction
        label="Trade"       value="trade"    icon={<CheckIcon />} />
    </BottomNavigation>;
  }
};
const styles = theme => ({
  root: { flex: '1 1 auto' }
});
ButtonNav.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(ButtonNav));
