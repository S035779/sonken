import React          from 'react';
import PropTypes      from 'prop-types';
import { Redirect }   from 'react-router-dom';
import { Container }  from 'flux/utils';
import NoteAction     from 'Actions/NoteAction';
import { getStores, getState }
                      from 'Stores';
import std            from 'Utilities/stdutils';

import { withStyles } from 'material-ui/styles';
import BidsSearch     from 'Components/BidsSearch/BidsSearch';
import BidsFilter     from 'Components/BidsFilter/BidsFilter';
import BidsItemList   from 'Components/BidsItemList/BidsItemList';

class Bids extends React.Component {
  static getStores() {
    return getStores(['bidedNotesStore']);
  }

  static calculateState() {
    return getState('bidedNotesStore');
  }

  static prefetch(options) {
    std.logInfo(Bids.displayName, 'prefetch', options);
    return NoteAction.presetUser(options.user)
      .then(() => NoteAction.prefetchBided(options.user));
  }

  componentDidMount() {
    std.logInfo(Bids.displayName, 'fetch', 'Bids');
    NoteAction.fetchBided(this.state.user);
  }

  itemFilter(filter, item) {
    const date      = new Date();
    const now       = new Date(item.bidStopTime);
    const start     = new Date(filter.bidStartTime);
    const stop      = new Date(filter.bidStopTime);
    const year      = date.getFullYear();
    const month     = date.getMonth();
    const day       = date.getDate();
    const today     = new Date(year, month, day+1);
    const yesterday = new Date(year, month, day);
    const isDay = yesterday <= now && now < today; 
    const isAll = true;
    const isNow = start <= now && now <= stop;
    return filter.inBidding
      ? isNow
      : filter.endBidding && filter.allBidding
        ? isAll
        : filter.endBidding
          ? isDay
          : true; 
  }

  itemPage(number, page) {
    return number < page.perPage ? number : page.perPage;
  }

  render() {
    //std.logInfo(Bids.displayName, 'State', this.state);
    std.logInfo(Bids.displayName, 'Props', this.props);
    const { classes, location } = this.props;
    const { isAuthenticated, user, notes, page, ids, filter, file }
      = this.state;
    let items = [];
    notes.forEach(note => {
      if(note.items) note.items.forEach(item => items.push(item))
    });
    let _items = items
      .filter(item => item.listed && this.itemFilter(filter, item));
    const number = _items.length;
    _items.length = this.itemPage(number, page);
    if(!isAuthenticated) {
      return <Redirect to={{
        pathname: '/login/authenticate', state: { from: location } }} />;
    }
    return <div className={classes.root}>
      <BidsSearch
        user={user}
        items={_items}
        file={file}
        itemNumber={number} itemPage={page}/>
      <BidsFilter
        user={user}
        items={_items}
        itemFilter={filter}
        selectedItemId={ids}/>
      <div className={classes.noteList}>
        <BidsItemList
          user={user}
          items={_items}
          selectedItemId={ids}/>
      </div>
    </div>;
  }
};

const barHeightSmDown   = 104;
const barHeightSmUp     = 112;
const filterHeight      = 186;
const searchHeight      = 62;
const listHeightSmDown  =
  `calc(100vh - ${barHeightSmDown}px - ${filterHeight}px - ${searchHeight}px)`;
const listHeightSmUp    =
  `calc(100vh - ${barHeightSmUp}px - ${filterHeight}px - ${searchHeight}px)`;
const styles = theme => ({
  root:     { display: 'flex', flexDirection: 'column' }
, noteList: { width: '100%', overflow: 'scroll'
            , height: listHeightSmDown
            , [theme.breakpoints.up('sm')]: { height: listHeightSmUp } }
});
Bids.displayName = 'Bids';
Bids.defaultProps = { notes: null };
Bids.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Bids));
