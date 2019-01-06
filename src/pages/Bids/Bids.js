import loadable       from '@loadable/component';
import React                    from 'react';
import PropTypes                from 'prop-types';
import * as R                   from 'ramda';
import { Redirect }             from 'react-router-dom';
import { Container }            from 'flux/utils';
import BidsAction               from 'Actions/BidsAction';
import { getStores, getState }  from 'Stores';
import std                      from 'Utilities/stdutils';
import Spinner                  from 'Utilities/Spinner';

import { withStyles }           from '@material-ui/core/styles';
const BidsSearch = loadable(() => import('Components/BidsSearch/BidsSearch'));
const BidsFilter = loadable(() => import('Components/BidsFilter/BidsFilter'));

class Bids extends React.Component {
  static getStores() {
    return getStores(['bidedNotesStore']);
  }

  static calculateState() {
    return getState('bidedNotesStore');
  }

  static prefetch({ user, page }) {
    if(!user) return null;
    std.logInfo(Bids.displayName, 'fetch', { user });
    const skip = 0;
    const limit = page ? page.perPage : 20;
    return BidsAction.presetUser(user)
      .then(() => BidsAction.fetchBided(user, skip, limit));
  }

  componentDidMount() {
    this.spn = Spinner.of('app');
    const { user, page } = this.state;
    if(!user) return;
    //const skip = (page.number - 1) * page.perPage;
    //const limit = page.perPage;
    this.spn.start();
    //std.logInfo(Bids.displayName, 'fetch', 'bids');
    //BidsAction.fetchBided(user, skip, limit)
    Bids.prefetch({ user, page })
      .then(() => this.spn.stop());
  }

  componentWillUnmount() {
    this.spn.stop();
  }

  render() {
    //std.logInfo(Bids.displayName, 'State', this.state);
    //std.logInfo(Bids.displayName, 'Props', this.props);
    const { classes, location } = this.props;
    const { isAuthenticated, user, notes, page, ids, filter, file } = this.state;
    const note = R.head(notes);
    const items = note && note.items ? note.items : [];
    const itemNumber = note && note.items_attributes && note.items_attributes.item ? note.items_attributes.item.total : 0;
    return isAuthenticated 
      ? ( <div className={classes.root}>
            <BidsSearch user={user} items={items} itemFilter={filter} itemNumber={itemNumber} itemPage={page} file={file}/>
            <BidsFilter user={user} items={items} itemFilter={filter} itemNumber={itemNumber} selectedItemId={ids}/>
          </div> )
      : ( <Redirect to={{ pathname: '/login/authenticate', state: { from: location }}}/> );
  }
}
Bids.displayName = 'Bids';
Bids.defaultProps = {};
Bids.propTypes = {
  classes: PropTypes.object.isRequired
, location: PropTypes.object.isRequired
};

const styles = { root: { display: 'flex', flexDirection: 'column' } };
export default withStyles(styles)(Container.create(Bids));
