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
    const { notes, page, ids, filter } = this.state;
    let _items = [];
    notes.forEach(note => {
      if(note.items) note.items.forEach(item => _items.push(item))
    });
    const itemNumber = _items.length;
    _items.length = 
      _items.length < page.perPage ? _items.length : page.perPage;;
    return <div className={classes.root}>
      <BidsSearch
        itemNumber={itemNumber}
        itemPage={page}/>
      <BidsFilter   items={_items}
        itemFilter={filter}
        selectedItemId={ids}/>
      <BidsItemList items={_items}
        itemFilter={filter}
        selectedItemId={ids}
        itemPage={page}/>
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
