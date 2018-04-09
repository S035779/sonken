import React from 'react';
import PropTypes from 'prop-types'

import { withStyles } from 'material-ui/styles';
import { Hidden, Drawer } from 'material-ui';
import DrawerList from 'Components/DrawerList/DrawerList';

class DrawerPermanent extends React.Component {
  render() {
    const {classes} = this.props;
    const paperClass = { paper: classes.drawerPaper };
    return <Hidden smDown implementation="css">
      <Drawer variant="permanent" open classes={paperClass}>
        <DrawerList />
      </Drawer>
    </Hidden>
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

DrawerPermanent.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(DrawerPermanent);
