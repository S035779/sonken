import React          from 'react';
import PropTypes      from 'prop-types';
import { Container }  from 'flux/utils';
import NoteAction     from 'Actions/NoteAction';
import {
  getStores, getState
}                     from 'Stores';

import { withStyles } from 'material-ui/styles';
import TradeSearch    from 'Components/TradeSearch/TradeSearch';
import TradeFilter    from 'Components/TradeFilter/TradeFilter';
import TradeItemList  from 'Components/TradeItemList/TradeItemList';

class Trade extends React.Component {
  static getStores() {
    return getStores(['dashboardStore']);
  }

  static calculateState() {
    return getState('dashboardStore');
  }

  static prefetch(props) {
    console.log('Trade prefetch!!', 'Props:', props)
    return NoteAction.fetchNotes(props);
  }

  componentDidMount() {
    this.logInfo('Trade did mount!!');
    NoteAction.fetchMyNotes();
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
    const isNow = start < now && now < stop;
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
    const { notes, page, ids, filter } = this.state;
    let items = [];
    notes.forEach(note => {
      if(note.items) note.items.forEach(item => items.push(item))
    });
    let _items = items.filter(item => this.itemFilter(filter, item));
    const number = _items.length;
    _items.length = this.itemPage(number, page);
    return <div className={classes.root}>
      <TradeSearch
        itemNumber={number}
        itemPage={page}/>
      <TradeFilter
        items={_items}
        itemFilter={filter}
        selectedItemId={ids}/>
      <TradeItemList
        items={_items}
        selectedItemId={ids}/>
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
