import React          from 'react';
import PropTypes      from 'prop-types';
import { Redirect }   from 'react-router-dom';
import { Container }  from 'flux/utils';
import NoteAction     from 'Actions/NoteAction';
import { getStores, getState }
                      from 'Stores';
import std            from 'Utilities/stdutils';

import { withStyles } from '@material-ui/core/styles';
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

  static prefetch(options) {
    std.logInfo(Trade.displayName, 'prefetch', options);
    return NoteAction.presetUser(options.user)
      .then(() => NoteAction.prefetchTraded(options.user))
      .then(() => NoteAction.prefetchCategorys(options.user))
    ;
  }

  componentDidMount() {
    std.logInfo(Trade.displayName, 'fetch', 'Trade');
    NoteAction.fetchTraded(this.state.user)
      .then(() => NoteAction.fetchCategorys(this.state.user))
    ;
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
    //const isDay = yesterday <= now && now < today; 
    const isTrade = item.traded;
    const isAll = true;
    const isNow = start <= now && now <= stop;
    return filter.inBidding
      ? isNow
      : filter.endTrading && filter.allTrading
        ? isAll
        : filter.endTrading
          ? isTrade
          : true; 
  }

  itemPage(number, page) {
    return number < page.perPage ? number : page.perPage;
  }

  render() {
    //std.logInfo(Trade.displayName, 'State', this.state);
    //std.logInfo(Trade.displayName, 'Props', this.props);
    const { classes, location } = this.props;
    const { isAuthenticated, user, notes, page, ids, filter, file }
      = this.state;
    if(!isAuthenticated)
      return (<Redirect to={{ pathname: '/login/authenticate', state: { from: location }}} />);
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
        file={file}
        items={_items}
        itemNumber={number} itemPage={page}/>
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

const barHeightSmUp     = 64;//112;
const barHeightSmDown   = 56;//104;
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
