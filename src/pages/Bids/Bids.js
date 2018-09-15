import React                    from 'react';
import PropTypes                from 'prop-types';
import { Redirect }             from 'react-router-dom';
import { Container }            from 'flux/utils';
import NoteAction               from 'Actions/NoteAction';
import { getStores, getState }  from 'Stores';
import std                      from 'Utilities/stdutils';
import Spinner                  from 'Utilities/Spinner';

import { withStyles }           from '@material-ui/core/styles';
import BidsSearch               from 'Components/BidsSearch/BidsSearch';
import BidsFilter               from 'Components/BidsFilter/BidsFilter';

class Bids extends React.Component {
  static getStores() {
    return getStores(['bidedNotesStore']);
  }

  static calculateState() {
    return getState('bidedNotesStore');
  }

  static prefetch(options) {
    const { user, category } = options;
    if(!user) return null;
    std.logInfo(Bids.displayName, 'prefetch', category);
    return NoteAction.presetUser(user)
      .then(() => NoteAction.prefetchBided(user, 0, 20));
  }

  componentDidMount() {
    const { user, page } = this.state;
    if(!user) return;
    const skip = (page.number - 1) * page.perPage;
    const limit = page.perPage;
    const category = 'bids';
    const spn = Spinner.of('app');
    spn.start();
    std.logInfo(Bids.displayName, 'fetch', category);
    NoteAction.fetchBided(user, skip, limit)
      .then(() => spn.stop());
  }

  //itemFilter(filter, item) {
  //  const date      = new Date();
  //  const now       = new Date(item.bidStopTime);
  //  const start     = new Date(filter.bidStartTime);
  //  const stop      = new Date(filter.bidStopTime);
  //  const year      = date.getFullYear();
  //  const month     = date.getMonth();
  //  const day       = date.getDate();
  //  const today     = new Date(year, month, day+1);
  //  const yesterday = new Date(year, month, day);
  //  const isDay = yesterday <= now && now < today; 
  //  const isAll = true;
  //  const isNow = start <= now && now <= stop;
  //  return filter.inBidding
  //    ? isNow
  //    : filter.endBidding && filter.allBidding
  //      ? isAll
  //      : filter.endBidding
  //        ? isDay
  //        : true; 
  //}

  render() {
    //std.logInfo(Bids.displayName, 'State', this.state);
    //std.logInfo(Bids.displayName, 'Props', this.props);
    const { classes, location } = this.props;
    const { isAuthenticated, user, notes, page, ids, filter, file } = this.state;
    if(!isAuthenticated) 
      return (<Redirect to={{ pathname: '/login/authenticate', state: { from: location }}}/>);
    let items = [];
    notes.forEach(note => { if(note.items) note.items.forEach(item => items.push(item)) });
    let _items = items.filter(item => item.listed);// && this.itemFilter(filter, item));
    const number = _items.length;
    return <div className={classes.root}>
      <BidsSearch user={user} items={_items} file={file} itemNumber={number} itemPage={page}/>
      <BidsFilter user={user} items={_items} itemFilter={filter} selectedItemId={ids}/>
    </div>;
  }
}
Bids.displayName = 'Bids';
Bids.defaultProps = { notes: null };
Bids.propTypes = {
  classes: PropTypes.object.isRequired
, location: PropTypes.object.isRequired
};

const styles = { root: { display: 'flex', flexDirection: 'column' } };
export default withStyles(styles)(Container.create(Bids));
