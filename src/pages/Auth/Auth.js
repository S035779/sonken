import React            from 'react';
import PropTypes        from 'prop-types'
import { renderRoutes } from 'react-router-config';

import { withStyles }   from 'material-ui/styles';
import { CssBaseline }  from 'material-ui';
import ErrorBoundary    from 'Components/ErrorBoundary/ErrorBoundary';

class Auth extends React.Component {
  render() {
    const { classes, route } = this.props;
    return <ErrorBoundary>
      <CssBaseline />
       <div className={classes.root}>
        {renderRoutes(route.routes)}
      </div>
    </ErrorBoundary>;
  }
};

const styles = theme => ({
  root: { width: '100%', height: '100vh' }
});
Auth.displayName = 'Auth';
Auth.defaultProps = {};
Auth.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(Auth);
