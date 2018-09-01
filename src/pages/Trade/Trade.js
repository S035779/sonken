import React                    from 'react';
import PropTypes                from 'prop-types';
import { Redirect }             from 'react-router-dom';
import { Container }            from 'flux/utils';
import NoteAction               from 'Actions/NoteAction';
import { getStores, getState }  from 'Stores';
import std                      from 'Utilities/stdutils';
import Spinner                  from 'Utilities/Spinner';

import { withStyles }           from '@material-ui/core/styles';
import TradeSearch              from 'Components/TradeSearch/TradeSearch';
import TradeFilter              from 'Components/TradeFilter/TradeFilter';
import TradeItemList            from 'Components/TradeItemList/TradeItemList';

class Trade extends React.Component {
  static getStores() {
    return getStores(['tradedNotesStore']);
  }

  static calculateState() {
    return getState('tradedNotesStore');
  }

  static prefetch(options) {
    const { user, category } = options;
    if(!user) return null;
    std.logInfo(Trade.displayName, 'prefetch', category);
    return NoteAction.presetUser(user)
      .then(() => NoteAction.prefetchTraded(user, 0, 20))
      .then(() => NoteAction.prefetchCategorys(user, category, 0, 20));
  }

  componentDidMount() {
    const { user } = this.state;
    const category = 'trade';
    if(!user) return;
    std.logInfo(Trade.displayName, 'fetch', category);
    const spn = Spinner.of('app');
    spn.start();
    NoteAction.fetchTraded(user, 0, 20)
      .then(() => NoteAction.fetchCategorys(user, category, 0, 20))
      .then(() => spn.stop());
  }

  itemFilter(filter, item) {
    const now       = new Date(item.bidStopTime);
    const start     = new Date(filter.bidStartTime);
    const stop      = new Date(filter.bidStopTime);
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
}
Trade.displayName = 'Trade';
Trade.defaultProps = { notes: null };
Trade.propTypes = {
  classes: PropTypes.object.isRequired
, location: PropTypes.object.isRequired
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
export default withStyles(styles)(Container.create(Trade));
