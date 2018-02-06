import React from 'react';
import PropTypes from 'prop-types'
import { renderRoutes } from 'react-router-config';
import getRoutes from 'Main/routes';

import { withStyles } from 'material-ui/styles';
import { Reboot, Hidden, Drawer } from 'material-ui';
import DrawerList from 'Components/DrawerList/DrawerList';
import GlobalHeader from 'Components/GlobalHeader/GlobalHeader';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      mobileOpen: false
    };
  }

  handleDrawerToggle() {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  }

  renderDrawerMdUp(classes) {
    const modalProps = { keepMounted: true };
    const paperClass = { paper: classes.drawerPaper };
    return <Drawer type="temporary"
      classes={paperClass}
      open={this.state.mobileOpen}
      onClose={this.handleDrawerToggle.bind(this)}
      ModalProps={modalProps}>
      <DrawerList />
    </Drawer>;
  }
  
  renderDrawerSmDown(classes) {
    const paperClass = { paper: classes.drawerPaper };
    return <Drawer type="permanent" open
      classes={paperClass}>
      <DrawerList />
    </Drawer>;
  }

  render() {
    const {classes} = this.props;
    const renderDrawerMdUp = this.renderDrawerMdUp(classes);
    const renderDrawerSmDown = this.renderDrawerSmDown(classes);
    return <div className={classes.root}>
      <Reboot />
      <div className={classes.appFrame}>
        <GlobalHeader onClickNav={this.handleDrawerToggle.bind(this)}/>
        <Hidden mdUp>{renderDrawerMdUp}</Hidden>
        <Hidden smDown implementation="css">{renderDrawerSmDown}</Hidden>
        <div className={classes.content}>
        {renderRoutes(this.props.route.routes)}
        </div>
      </div>
    </div>;
  }
};

const drawerWidthMdUp = 240;
const drawerWidthMdDown = 250;
const barHeightSmUp = 112;
const barHeightSmDown = 104;
const styles = theme => ({
  root:       { width: '100%', zIndex: 1 },
  appFrame:   { position: 'relative'
              , display: 'flex', flexDirection: 'column'
              , width: '100%'},
  drawerPaper:{ width: drawerWidthMdDown
              , [theme.breakpoints.up('md')]: {
                  position: 'relative'
                , width: drawerWidthMdUp
                , height: '100%'
              }},
  content:    { position: 'absolute'
              , width: '100%'
              , [theme.breakpoints.up('md')]: {
                  width: `calc(100% - ${drawerWidthMdUp}px)`
                , marginLeft: drawerWidthMdUp
              }
              , height: `calc(100vh - ${barHeightSmDown}px)`
              , marginTop: barHeightSmDown
              , [theme.breakpoints.up('sm')]: {
                  height: `calc(100vh - ${barHeightSmUp}px)`
                , marginTop: barHeightSmUp
              }}
});

App.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(App);
