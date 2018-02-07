import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { withStyles } from 'material-ui/styles';
import { BottomNavigation } from 'material-ui';
import { BottomNavigationAction } from 'material-ui/BottomNavigation';
import {
  RssFeed       as RssIcon
  , List        as ListIcon
  , CheckCircle as CheckIcon
  , LiveHelp    as FaqIcon
  , Feedback    as InquiryIcon
} from 'material-ui-icons';

class ButtonNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: 'marchant' };
  }

  handleChangeNav(event, value) {
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
      case 'faq':
        this.props.history.push('/faq');
        break;
      case 'inquiry':
        this.props.history.push('/inquiry');
        break;
    }
    this.setState({ value });
  }

  render() {
    const { classes } = this.props;
    const { value } = this.state;
    return <BottomNavigation showLabels value={value}
      className={classes.root}
      onChange={this.handleChangeNav.bind(this)}>
      <BottomNavigationAction className={classes.buttons}
        label="Marchant"    value="marchant" icon={<RssIcon />}     />
      <BottomNavigationAction className={classes.buttons}
        label="Sellers"     value="sellers"  icon={<RssIcon />}     />
      <BottomNavigationAction className={classes.buttons}
        label="Bids"        value="bids"     icon={<ListIcon />}    />
      <BottomNavigationAction className={classes.buttons}
        label="Trade"       value="trade"    icon={<CheckIcon />}   />
      <BottomNavigationAction className={classes.buttons}
        label="FAQ"         value="faq"      icon={<FaqIcon />}     />
      <BottomNavigationAction className={classes.buttons}
        label="Inquiry"     value="inquiry"  icon={<InquiryIcon />} />
    </BottomNavigation>;
  }
};
const styles = theme => ({
  root: { flex: '2 1 auto'
        , backgroundColor:theme.palette.primary.main },
  buttons: { color: '#fff' }
});
ButtonNav.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(ButtonNav));
