import React from 'react';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import NoteAction from 'Actions/NoteAction';
import { getStores, getState } from 'Stores';

import { withStyles } from 'material-ui/styles';
import BidsSearch from 'Components/BidsSearch/BidsSearch';
import BidsFilter from 'Components/BidsFilter/BidsFilter';
import BidsItemList from 'Components/BidsItemList/BidsItemList';

class Bids extends React.Component {
  static getStores() {
    return getStores(['dashboardStore']);
  }

  static calculateState() {
    return getState('dashboardStore');
  }

  static prefetch(props) {
    return NoteAction.fetchNotes();
  }

  componentDidMount() {
    NoteAction.fetchMyNotes();
  }

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  }

  render() {
    this.logInfo('render', this.state);
    const { classes } = this.props;
    const { notes, page, ids } = this.state;
    return <div className={classes.root}>
      <BidsSearch notes={notes}/>
      <BidsFilter notes={notes} selectedItemId={ids}/>
      <BidsItemList notes={notes} selectedItemId={ids}/>
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
