import React            from 'react';
import PropTypes        from 'prop-types'
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { Hidden, Drawer }
                        from 'material-ui';
import DrawerList       from 'Components/DrawerList/DrawerList';

class DrawerTemporary extends React.Component {
  handleToggle() {
    this.props.onClose();
  }

  render() {
    std.logInfo(DrawerTemporary.displayName, 'Props', this.props);
    std.logInfo(DrawerTemporary.displayName, 'State', this.state);
    const { classes, open, user } = this.props;
    const modalProps = { keepMounted: true };
    const paperClass = { paper: classes.paper };
    return <Hidden mdUp>
      <Drawer
        variant="temporary"
        open={open}
        onClose={this.handleToggle.bind(this)}
        classes={paperClass}
        ModalProps={modalProps}>
        <DrawerList user={user} />
      </Drawer>
    </Hidden>;
  }
};

const drawerWidthMdUp = 240;
const drawerWidthMdDown = 250;
const styles = theme => ({
  paper:{
    width: drawerWidthMdDown
  , [theme.breakpoints.up('md')]: {
      position: 'relative', width: drawerWidthMdUp, height: '100%'
    }
  }
});
DrawerTemporary.displayName = 'DrawerTemporary';
DrawerTemporary.defaultProps = {};
DrawerTemporary.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(DrawerTemporary);
