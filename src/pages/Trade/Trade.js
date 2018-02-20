import React from 'react';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import NoteAction from 'Actions/NoteAction';
import { getStores, getState } from 'Stores';

import { withStyles } from 'material-ui/styles';
import TradeSearch from 'Components/TradeSearch/TradeSearch';
import TradeFilter from 'Components/TradeFilter/TradeFilter';
import TradeItemList from 'Components/TradeItemList/TradeItemList';

class Trade extends React.Component {
  static getStores() {
    return getStores(['starredNotesStore']);
  }

  static calculateState() {
    return getState('starredNotesStore');
  }

  static prefetch(props) {
    console.log('Trade prefetch!!', 'Props:', props)
    return NoteAction.fetchStarred();
  }

  componentDidMount() {
    console.log('Trade did mount!!');
    Trade.prefetch(this.props);
  }

  render() {
    const { classes } = this.props;
    const { notes } = this.state;
    return <div className={classes.root}>
      <TradeSearch notes={notes} />
      <TradeFilter notes={notes} />
      <TradeItemList notes={notes} />
      </div>;
  }
};
const styles = {
  root:   { display: 'flex', flexDirection: 'column' }
};
Trade.displayName = 'Trade';
Trade.defaultProps = { notes: null };
Trade.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Trade));
