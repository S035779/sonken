import React from 'react';
import PropTypes from 'prop-types'
import { renderRoutes } from 'react-router-config';
import getRoutes from 'Main/routes';

import { withStyles } from 'material-ui/styles';
import { Reboot } from 'material-ui';
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
    const { classes, route } = this.props;
    return <div className={classes.root}>
      <ErrorBoundary>
      <Reboot />
      <div className={classes.appFrame}>
        <RssHeader onClickMenu={this.handleDrawerToggle.bind(this)}/>
        <div className={classes.content}>
          {renderRoutes(route.routes)}
        </div>
      </div>
      </ErrorBoundary>
    </div>;
  }
};

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
            , height: `calc(100vh - ${barHeightSmDown}px)`
            , marginTop: barHeightSmDown
            , [theme.breakpoints.up('sm')]: {
              height: `calc(100vh - ${barHeightSmUp}px)`
            , marginTop: barHeightSmUp }}
});
App.displayName = 'App';
App.defaultProps = {};
App.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(App);
