import React            from 'react';
import PropTypes        from 'prop-types'
import { renderRoutes } from 'react-router-config';

import { withStyles }   from 'material-ui/styles';
import { CssBaseline }  from 'material-ui';
import LoginHeader      from 'Components/LoginHeader/LoginHeader';
import ErrorBoundary    from 'Components/ErrorBoundary/ErrorBoundary';

class Auth extends React.Component {
  render() {
    const { classes, route } = this.props;
    return <div className={classes.root}>
      <ErrorBoundary>
      <CssBaseline />
      <div className={classes.authFrame}>
        <LoginHeader />
        <div className={classes.content}>
          {renderRoutes(route.routes)}
        </div>
      </div>
      </ErrorBoundary>
    </div>;
  }
};

const barHeightSmDown = 56;
const barHeightSmUp = 64;
const styles = theme => ({
  root:     { width: '100%', zIndex: 1
            , overflow: 'hidden', height: '100vh' }
, authFrame:{ position: 'relative'
            , display: 'flex', flexDirection: 'column'
            , width: '100%' }
, content:  { position: 'absolute'
            , width: '100%'
            , height: `calc(100vh - ${barHeightSmDown}px)`
            , marginTop: barHeightSmDown
            , [theme.breakpoints.up('sm')]: {
              height: `calc(100vh - ${barHeightSmUp}px)`
            , marginTop: barHeightSmUp }}
});
Auth.displayName = 'Auth';
Auth.defaultProps = {};
Auth.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(Auth);
