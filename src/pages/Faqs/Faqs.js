import React            from 'react';
import PropTypes        from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Redirect }     from 'react-router-dom';
import { Container }    from 'flux/utils';
import { getStores, getState }
                        from 'Stores';
import FaqAction        from 'Actions/FaqAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import { CssBaseline }  from '@material-ui/core';
import ErrorBoundary    from 'Components/ErrorBoundary/ErrorBoundary';
import LoginHeader      from 'Components/LoginHeader/LoginHeader';
import faqsImg          from 'Assets/image/bg7.jpg';

const env = process.env.NODE_ENV || 'development';
const assets = process.env.ASSET_URL;
let image;
if(env === 'development') {
  image = assets;
} else 
if(env === 'production' || env === 'staging') {
  image = assets + '/image';
}

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
    //std.logInfo(Faqs.displayName, 'State', this.state);
    //std.logInfo(Faqs.displayName, 'Props', this.props);
    const { classes, route, location } = this.props;
    const { isAuthenticated, faqs } = this.state;
    let _faqs = [];
    faqs.forEach(faq => { if(faq.posted) _faqs.push(faq); });
    const to = { pathname: '/login/authenticate', state: { from: location } };
    if(!isAuthenticated) return <Redirect to={to} />;
    return <div className={classes.root}>
      <ErrorBoundary>
      <CssBaseline />
      <div className={classes.faqsFrame}>
        <LoginHeader />
        <div className={classes.content}>
          {route.routes ? renderRoutes(route.routes , { faqs: _faqs }) : null }
        </div>
      </div>
      </ErrorBoundary>
    </div>;
  }
}
Faqs.propTypes = {
  classes: PropTypes.object.isRequired
, route: PropTypes.object.isRequired
, location: PropTypes.object.isRequired
};
const faqs_top = std.toRGBa('#1dc7ea', 0.8);
const faqs_btm = std.toRGBa('#4091ff', 0.8);
const barHeightSmUp   = 64;
const barHeightSmDown = 56;
const styles = theme => ({
  root:       { width: '100vw', zIndex: 1, overflow: 'hidden', height: '100vh'
              , background: `linear-gradient(180deg, ${faqs_top}, ${faqs_btm})` + `, url(${image + faqsImg})`
              , backgroundSize: 'cover' }
, faqsFrame:  { position: 'relative', height: '100%' }
, content:    { position: 'absolute', width: '100%', zIndex: 500, display: 'flex', flexDirection: 'column'
              , justifyContent: 'center', alignItems: 'center', height: `calc(100vh - ${barHeightSmDown}px)`
              , [theme.breakpoints.up('sm')]: { height: `calc(100vh - ${barHeightSmUp}px)` }}
});
Faqs.displayName = 'Faqs';
Faqs.defaultProps = {};
export default withStyles(styles)(Container.create(Faqs));
