import loadable       from '@loadable/component';
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
const TradeSearch = loadable(() => import('Components/TradeSearch/TradeSearch'));
const TradeFilter = loadable(() => import('Components/TradeFilter/TradeFilter'));

class Trade extends React.Component {
  static getStores() {
    return getStores(['tradedNotesStore']);
  }

  static calculateState() {
    return getState('tradedNotesStore');
  }

  static prefetch({ user, page }) {
    if(!user) return null;
    std.logInfo(Trade.displayName, 'fetch', { user });
    const skip = 0;
    const limit = page ? page.perPage : 20;
    return TradeAction.presetUser(user)
      .then(() => TradeAction.fetchTraded(user, skip, limit));
  }

  componentDidMount() {
    this.spn = Spinner.of('app');
    const { user, page } = this.state;
    if(!user) return;
    //const skip = (page.number - 1) * page.perPage;
    //const limit = page.perPage;
    this.spn.start();
    //std.logInfo(Trade.displayName, 'fetch', 'trade');
    //TradeAction.fetchTraded(user, skip, limit)
    Trade.prefetch({ user, page })
      .then(() => this.spn.stop());
  }

  componentWillUnmount() {
    this.spn.stop();
  }

  render() {
    //std.logInfo(Trade.displayName, 'State', this.state);
    //std.logInfo(Trade.displayName, 'Props', this.props);
    const { classes, location } = this.props;
    const { isAuthenticated, user, notes, page, ids, filter, file } = this.state;
    const note = R.head(notes);
    const items = note && note.items ? note.items : [];
    const itemNumber = note && note.items_attributes && note.items_attributes.item ? note.items_attributes.item.total : 0;
    return isAuthenticated
      ? ( <div className={classes.root}>
            <TradeSearch user={user} items={items} itemFilter={filter} itemNumber={itemNumber} itemPage={page} file={file}/>
            <TradeFilter user={user} items={items} itemFilter={filter} itemNumber={itemNumber} selectedItemId={ids}/>
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
