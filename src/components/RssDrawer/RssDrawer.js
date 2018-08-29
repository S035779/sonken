import React            from 'react';
import PropTypes        from 'prop-types';
//import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import RssHeader        from 'Components/RssHeader/RssHeader';
import DrawerPermanent  from 'Components/DrawerPermanent/DrawerPermanent';
import DrawerTemporary  from 'Components/DrawerTemporary/DrawerTemporary';

class RssDrawer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: true };
  }

  handleToggle() {
    const { open } = this.state;
    this.setState({ open: !open });
  }

  render() {
    //std.logInfo(RssDrawer.displayName, 'Props', this.props);
    //std.logInfo(RssDrawer.displayName, 'State', this.state);
    const { classes, user, isAuthenticated, profile, preference, categorys
      , children } = this.props;
    const { open } = this.state;
    return <div className={classes.root}>
      <RssHeader
        open={open}
        user={user}
        isAuthenticated={isAuthenticated}
        preference={preference}
        profile={profile}
        onClick={this.handleToggle.bind(this)}
      >
        {children}
      </RssHeader>
      <DrawerTemporary
        open={open}
        user={user}
        preference={preference}
        profile={profile}
        categorys={categorys}
        onClose={this.handleToggle.bind(this)}
      />
      <DrawerPermanent
        open={open}
        user={user}
        preference={preference}
        profile={profile}
        categorys={categorys}
      />
    </div>;
  }
}
RssDrawer.displayName = 'RssDrawer';
RssDrawer.defaultProps = {};
RssDrawer.propTypes = {
  classes:  PropTypes.object.isRequired
, user: PropTypes.string.isRequired
, isAuthenticated: PropTypes.bool.isRequired
, profile: PropTypes.object.isRequired
, preference: PropTypes.object.isRequired
, categorys: PropTypes.array.isRequired
, children: PropTypes.object.isRequired
};

const styles = {
  root: {position: 'relative'}
};
export default withStyles(styles)(RssDrawer);
