import React from 'react';
import PropTypes from 'prop-types'

import { withStyles } from 'material-ui/styles';
import { Hidden, Drawer } from 'material-ui';
import DrawerList from 'Components/DrawerNav/DrawerList';

class DrawerNavTemporary extends React.Component {
  handleToggle() {
    this.props.onClose();
  }

  render() {
    const {classes} = this.props;
    const modalProps = { keepMounted: true };
    const paperClass = { paper: classes.drawerPaper };
    return <Hidden mdUp>
      <Drawer type="temporary"
        classes={paperClass}
        open={this.props.open}
        onClose={this.handleToggle.bind(this)}
        ModalProps={modalProps}>
        <DrawerList />
      </Drawer>
    </Hidden>;
  }
};

const drawerWidthMdUp = 240;
const drawerWidthMdDown = 250;
const styles = theme => ({
  drawerPaper:{ width: drawerWidthMdDown
              , [theme.breakpoints.up('md')]: {
                  position: 'relative'
                , width: drawerWidthMdUp
                , height: '100%'
              }}
});

DrawerNavTemporary.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(DrawerNavTemporary);
