import React                    from 'react';
import PropTypes                from 'prop-types';
import * as R                   from 'ramda';
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
    return Promise.all([
        TradeAction.presetUser(user)
      , TradeAction.prefetchTraded(user, 0, 20)
      ]);
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

  render() {
    //std.logInfo(Trade.displayName, 'State', this.state);
    //std.logInfo(Trade.displayName, 'Props', this.props);
    const { classes, location } = this.props;
    const { isAuthenticated, user, notes, page, ids, filter, file } = this.state;
    const note = R.head(notes);
    const items = note && note.items ? note.items : [];
    const number = note && note.attributes ? note.attributes.item.total : 0;
    return isAuthenticated
      ? ( <div className={classes.root}>
            <TradeSearch user={user} items={items} itemFilter={filter} itemNumber={number} itemPage={page} file={file}/>
            <TradeFilter user={user} items={items} itemFilter={filter} itemNumber={number} selectedItemId={ids}/>
          </div> )
      : ( <Redirect to={{ pathname: '/login/authenticate', state: { from: location }}}/> );
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
