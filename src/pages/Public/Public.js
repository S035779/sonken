import React            from 'react';
import PropTypes        from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Container }    from 'flux/utils';
import PublicAction       from 'Actions/PublicAction';
import {
  getStores, getState
}                       from 'Stores';

import { withStyles }   from 'material-ui/styles';

class Public extends React.Component {
  static getStores() {
    return getStores(['publicStore']);
  }

  static calculateState() {
    return getState('publicStore');
  }

  static prefetch(user) {
    console.info('prefetch', user);
    return PublicAction.presetUser(user);
  }

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  }

  render() {
    this.logInfo('render', this.state);
    const { classes } = this.props;
    return <div className={classes.root}>
      <div className={classes.body}>
        <div className={classes.public}>
        </div>
      </div>
    </div>;
  }
};

const publicWidth  = 640;
const publicHeight = 800;
const styles = theme => ({
  root:     { display: 'flex', flexDirection: 'column' }
, body:     { display: 'flex', flexDirection: 'row' }
, public:   { width: publicWidth, minWidth: publicWidth
            , height: publicHeight }
});
Public.displayName = 'Public';
Public.defaultProps = {};
Public.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Public));
