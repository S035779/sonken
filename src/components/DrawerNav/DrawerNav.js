import React            from 'react';
import PropTypes        from 'prop-types';

import { withStyles }   from 'material-ui/styles';
import { Drawer }       from 'material-ui';
import RssHeader        from 'Components/RssHeader/RssHeader';
import DrawerPermanent  from 'Components/DrawerPermanent/DrawerPermanent';
import DrawerTemporary  from 'Components/DrawerTemporary/DrawerTemporary';

class DrawerNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = { mobileOpen: false };
  }

  handleDrawerToggle() {
    const { mobileOpen } = this.state;
    this.setState({ mobileOpen: !mobileOpen });
  }

  render() {
    const { classes, user, isAuthenticated, profile, preference }
      = this.props;
    const { mobileOpen } = this.state;
    return <div className={classes.root}>
      <RssHeader user={user}
        profile={profile} preference={preference}
        isAuthenticated={isAuthenticated}
        onClickNav={this.handleDrawerToggle.bind(this)} />
      <DrawerTemporary open={mobileOpen}
        onClose={this.handleDrawerToggle.bind(this)}/>
      <DrawerPermanent />
    </div>;
  }
};

const styles = theme => ({
  root: {}
});
DrawerNav.displayName = 'DrawerNav';
DrawerNav.defaultProps = {};
DrawerNav.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(DrawerNav);
