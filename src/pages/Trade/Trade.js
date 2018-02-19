import React from 'react';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import NoteAction from 'Actions/NoteAction';
import { getStores, getState } from 'Stores';

import { withStyles } from 'material-ui/styles';
//import RssItemList from 'Components/TradeNoteList/TradeNoteList';

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
    console.log(this.state.notes);
    const { classes } = this.props;
    return <div className={classes.root}>
      <h1 className={classes.title}>Trade Items</h1>
      {/*
      <RssItemList notes={this.state.notes} />
      */}
      </div>;
  }
};
const styles = {
  root:   { padding: '10px' },
  title:  { fontSize: '32px', fontWeight: 'bold', margin: '20px 10px' }
};
Trade.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Trade));
