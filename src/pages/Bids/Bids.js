import React from 'react';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import NoteAction from 'Actions/NoteAction';
import { getStores, getState } from 'Stores';

import { withStyles } from 'material-ui/styles';
import BidsSearch from 'Components/BidsSearch/BidsSearch';
import BidsFilter from 'Components/BidsFilter/BidsFilter';
import BidsItemList from 'Components/StarredNoteList/StarredNoteList';

class Bids extends React.Component {
  static getStores() {
    return getStores(['starredNotesStore']);
  }

  static calculateState() {
    return getState('starredNotesStore');
  }

  static prefetch(props) {
    console.log('Bids prefetch!!', 'Props:', props)
    return NoteAction.fetchStarred();
  }

  componentDidMount() {
    console.log('Bids did mount!!');
    Bids.prefetch(this.props);
  }

  render() {
    const { classes } = this.props;
    const { notes } = this.state;
    return <div className={classes.root}>
      <BidsSearch />
      <BidsFilter notes={notes}/>
      <BidsItemList notes={notes} />
    </div>;
  }
};
const styles = theme => ({
  root:     { display: 'flex', flexDirection: 'column' }
});
Bids.displayName = 'Bids';
Bids.defaultProps = { notes: null };
Bids.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Bids));
