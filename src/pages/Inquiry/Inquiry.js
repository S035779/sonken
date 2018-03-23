import React            from 'react';
import PropTypes        from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Redirect }     from 'react-router-dom';
import { Container }    from 'flux/utils';
import { getStores, getState }
                        from 'Stores';
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';

class Inquiry extends React.Component {
  static getStores() {
    return getStores(['loginStore']);
  }

  static calculateState() {
    return getState(['loginStore']);
  }

  static prefetch(options) {
    std.logInfo(Inquiry.displayName, 'prefetch', options);
    return LoginAction.presetUser(options.user);
  }

  render() {
    std.logInfo(Inquiry.displayName, 'State', this.state);
    std.logInfo(Inquiry.displayName, 'Props', this.props);
    const { classes, route, location } = this.props;
    const { user, isAuthenticated, preference } = this.state;
    if(!isAuthenticated) {
      return <Redirect to={{
        pathname: '/login/authenticate', state: { from: location } }} />;
    }
    return <div className={classes.inquiryFrame}>
      <div className={classes.drawArea}>
        <div className={classes.space}/>
        <div className={classes.container}>
        {
          route.routes
            ? renderRoutes(route.routes, { user, preference })
          : null
        }
        </div>
        <div className={classes.space}/>
      </div>
    </div>;
  }
};

const inquiryWidth = 640;
const inquiryHeight = 800;
const rowHeight = 62;
const styles = theme => ({
  inquiryFrame: { display: 'flex', flexDirection: 'column'
                , justifyContent: 'center', alignItems: 'center'
                , height: '100vh' }
, drawArea:     { height: '100%', overFlow: 'scroll' }
, space:        { minHeight: '5%' }
, container:    { width: inquiryWidth, height: inquiryHeight
                , border: '1px solid #CCC', borderRadius: 4
                , paddingLeft: theme.spacing.unit * 4
                , paddingRight: theme.spacing.unit *4 }
});
Inquiry.displayName = 'Inquiry';
Inquiry.defaultProps = {};
Inquiry.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Inquiry));
