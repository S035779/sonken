import React            from 'react';
import PropTypes        from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Redirect }     from 'react-router-dom';
import { Container }    from 'flux/utils';
import { getStores, getState }
                        from 'Stores';
import FaqAction        from 'Actions/FaqAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';

class Faqs extends React.Component {
  static getStores() {
    return getStores(['postedFaqsStore']);
  }

  static calculateState() {
    return getState('postedFaqsStore');
  }

  static prefetch(options) {
    std.logInfo(Faqs.displayName, 'prefetch', options)
    return FaqAction.presetUser(options.user)
      .then(() => FaqAction.prefetchPostedFaqs());
  }

  componentDidMount() {
    std.logInfo(Faqs.displayName, 'fetch', 'Faqs');
    FaqAction.fetchPostedFaqs();
  }

  render() {
    std.logInfo(Faqs.displayName, 'State', this.state);
    std.logInfo(Faqs.displayName, 'Props', this.props);
    const { classes, route, location } = this.props;
    const { isAuthenticated, user, faqs } = this.state;
    let _faqs = [];
    faqs.forEach(faq => { if(faq.posted) _faqs.push(faq); });
    if(!isAuthenticated) {
      return <Redirect to={{
        pathname: '/login/authenticate', state: { from: location } }} />;
    }
    return <div className={classes.root}>
      <h1 className={classes.title}>FAQ</h1>
      {
        route.routes
          ? renderRoutes(route.routes , { faqs: _faqs })
          : null
      }
      </div>;
  }
};

const styles = theme => ({
  root:   { padding: '10px' },
  title:  { fontSize: '32px', fontWeight: 'bold', margin: '20px 10px' }
});
Faqs.displayName = 'Faqs';
Faqs.defaultProps = {};
Faqs.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Faqs));
