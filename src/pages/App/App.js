import React from 'react';
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import getRoutes from 'Main/routes';
import GlobalHeader from 'Components/GlobalHeader/GlobalHeader';

import { withStyles } from 'material-ui/styles';

class App extends React.Component {
  render() {
    const {classes} = this.props;
    return <div className={classes.root}>
      <div className={classes.head}>
        <GlobalHeader />
      </div>
      <div className={classes.main}>
      {renderRoutes(this.props.route.routes)}
      </div>
      </div>;
  }
}

const styles = {
  root: {},
  head: {},
  main: {
    margin: '0 auto'
  }
};

App.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(App);
