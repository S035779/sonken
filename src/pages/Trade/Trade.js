import React                    from 'react';
import PropTypes                from 'prop-types';
import { Redirect }             from 'react-router-dom';
import { Container }            from 'flux/utils';
import TradeAction              from 'Actions/TradeAction';
import { getStores, getState }  from 'Stores';
import std                      from 'Utilities/stdutils';
import Spinner                  from 'Utilities/Spinner';

import { withStyles }           from '@material-ui/core/styles';
import TradeSearch              from 'Components/TradeSearch/TradeSearch';
import TradeFilter              from 'Components/TradeFilter/TradeFilter';

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
    return TradeAction.presetUser(user)
      .then(() => TradeAction.prefetchTraded(user, 0, 20));
  }

  componentDidMount() {
    const { user, page } = this.state;
    if(!user) return;
    const skip = (page.number - 1) * page.perPage;
    const limit = page.perPage;
    const spn = Spinner.of('app');
    spn.start();
    std.logInfo(Trade.displayName, 'fetch', 'trade');
    TradeAction.fetchTraded(user, skip, limit)
      .then(() => spn.stop());
  }

  //itemFilter(filter, item) {
  //  const now       = new Date(item.bidStopTime);
  //  const start     = new Date(filter.bidStartTime);
  //  const stop      = new Date(filter.bidStopTime);
  //  const isTrade = item.traded;
  //  const isAll = true;
  //  const isNow = start <= now && now <= stop;
  //  return filter.inBidding
  //    ? isNow
  //    : filter.endTrading && filter.allTrading
  //      ? isAll
  //      : filter.endTrading
  //        ? isTrade
  //        : true; 
  //}

  render() {
    //std.logInfo(Trade.displayName, 'State', this.state);
    //std.logInfo(Trade.displayName, 'Props', this.props);
    const { classes, location } = this.props;
    const { isAuthenticated, user, notes, page, ids, filter, file } = this.state;
    if(!isAuthenticated) 
      return (<Redirect to={{ pathname: '/login/authenticate', state: { from: location }}}/>);
    let items = [];
    notes.forEach(note => { if(note.items !== null) note.items.forEach(item => items.push(item)) });
    //let _items = items.filter(item => item.bided && this.itemFilter(filter, item));
    const number = items.length;
    return <div className={classes.root}>
      <TradeSearch user={user} items={items} file={file} itemNumber={number} itemPage={page}/>
      <TradeFilter user={user} items={items} itemFilter={filter} selectedItemId={ids}/>
    </div>;
  }
}
Trade.displayName = 'Trade';
Trade.defaultProps = {};
Trade.propTypes = {
  classes: PropTypes.object.isRequired
, location: PropTypes.object.isRequired
};

const styles = { root: { display: 'flex', flexDirection: 'column' } };
export default withStyles(styles)(Container.create(Trade));
