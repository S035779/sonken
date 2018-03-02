import React          from 'react';
import PropTypes      from 'prop-types';
import { Container }  from 'flux/utils';
import NoteAction    from 'Actions/NoteAction';
import {
  getStores, getState
}                     from 'Stores';

import { withStyles } from 'material-ui/styles';
import TradeSearch    from 'Components/TradeSearch/TradeSearch';
import TradeFilter    from 'Components/TradeFilter/TradeFilter';
import TradeItemList  from 'Components/TradeItemList/TradeItemList';

class Trade extends React.Component {
  static getStores() {
    return getStores(['tradedNotesStore']);
  }

  static calculateState() {
    return getState('tradedNotesStore');
  }

  static prefetch(user) {
    console.info('prefetch', user)
    return NoteAction.presetUser(user)
      .then(() => NoteAction.prefetchTraded(user));
  }

  componentDidMount() {
    this.logInfo('fetch', 'Trade');
    NoteAction.fetchTraded(this.state.user);
  }

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
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
    this.logInfo('render', this.state);
    const { classes } = this.props;
    const { user, notes, page, ids, filter } = this.state;
    let items = [];
    notes.forEach(note => {
      if(note.items) note.items.forEach(item => items.push(item))
    });
    let _items = items
      .filter(item => item.bided && this.itemFilter(filter, item));
    const number = _items.length;
    _items.length = this.itemPage(number, page);
    return <div className={classes.root}>
      <TradeSearch
        user={user}
        itemNumber={number}
        itemPage={page}/>
      <TradeFilter
        user={user}
        items={_items}
        itemFilter={filter}
        selectedItemId={ids}/>
      <div className={classes.noteList}>
        <TradeItemList
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
Trade.displayName = 'Trade';
Trade.defaultProps = { notes: null };
Trade.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Trade));
