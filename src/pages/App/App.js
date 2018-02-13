import React from 'react';
import PropTypes from 'prop-types'
import { renderRoutes } from 'react-router-config';
import getRoutes from 'Main/routes';

import { withStyles } from 'material-ui/styles';
import { Reboot } from 'material-ui';
//import DrawerNavTemporary from 'Components/DrawerNav/DrawerNavTemporary';
//import DrawerNavPermanent from 'Components/DrawerNav/DrawerNavPermanent';
import RssHeader from 'Components/RssHeader/RssHeader';
import ErrorBoundary from 'Components/ErrorBoundary/ErrorBoundary';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { mobileOpen: false };
  }

  handleDrawerToggle() {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  }

  render() {
    const {classes} = this.props;
    return <div className={classes.root}>
      <ErrorBoundary>
      <Reboot />
      <div className={classes.appFrame}>
        <RssHeader onClickMenu={this.handleDrawerToggle.bind(this)}/>
      {/*
        <DrawerNavTemporary open={this.state.mobileOpen}
          onClose={this.handleDrawerToggle.bind(this)}/>
        <DrawerNavPermanent />
      */}
        <div className={classes.content}>
          {renderRoutes(this.props.route.routes)}
        </div>
      </div>
      </ErrorBoundary>
    </div>;
  }
};

//const drawerWidthMdUp = 240;
const barHeightSmUp = 112;
const barHeightSmDown = 104;
const styles = theme => ({
  root:     { width: '100%', zIndex: 1
            , overflow: 'hidden', height: '100vh' },
  appFrame: { position: 'relative'
            , display: 'flex', flexDirection: 'column'
            , width: '100%'},
  content:  { position: 'absolute'
            , width: '100%'
//            , [theme.breakpoints.up('md')]: {
//             width: `calc(100% - ${drawerWidthMdUp}px)`
//            , marginLeft: drawerWidthMdUp }
            , height: `calc(100vh - ${barHeightSmDown}px)`
            , marginTop: barHeightSmDown
            , [theme.breakpoints.up('sm')]: {
              height: `calc(100vh - ${barHeightSmUp}px)`
            , marginTop: barHeightSmUp }}
});

App.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(App);
