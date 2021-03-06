import loadable       from '@loadable/component';
import React                    from 'react';
import PropTypes                from 'prop-types';
import { Redirect }             from 'react-router-dom';
import { renderRoutes }         from 'react-router-config';
import { Container }            from 'flux/utils';
import FaqAction                from 'Actions/FaqAction';
import { getStores, getState }  from 'Stores';
import std                      from 'Utilities/stdutils';
import Spinner                  from 'Utilities/Spinner';

import { withStyles }           from '@material-ui/core/styles';
const FaqSearch  = loadable(() => import('Components/FaqSearch/FaqSearch'));
const FaqButtons = loadable(() => import('Components/FaqButtons/FaqButtons'));
const FaqList    = loadable(() => import('Components/FaqList/FaqList'));

class Faq extends React.Component {
  static getStores() {
    return getStores(['faqStore']);
  }

  static calculateState() {
    return getState('faqStore');
  }

  static prefetch({ admin }) {
    if(!admin) return null;
    std.logInfo(Faq.displayName, 'fetch', { admin });
    return FaqAction.presetAdmin(admin)
      .then(() => FaqAction.fetchFaqs(admin));
  }

  componentDidMount() {
    this.spn = Spinner.of('app');
    const { isAuthenticated, admin } = this.state;
    if(isAuthenticated) {
      this.spn.start();
      //std.logInfo(Faq.displayName, 'fetch', 'Faq');
      //FaqAction.fetchFaqs(admin)
      Faq.prefetch({ admin })
        .then(() => this.spn.stop());
    }
  }

  componentWillUnmount() {
    this.spn.stop();
  }

  faqPage(number, page) {
    return number < page.perPage ? number : page.perPage;
  }

  render() {
    //std.logInfo(Faq.displayName, 'State', this.state);
    //std.logInfo(Faq.displayName, 'Props', this.props);
    const { classes, match, route, location } = this.props;
    const { isAuthenticated, admin, faqs, page, ids } = this.state;
    const _id = match.params.id;
    const faq = faqs.find(obj => obj._id === _id);
    const number = faqs.length;
    faqs.length = this.faqPage(number, page);
    return isAuthenticated
      ? ( <div className={classes.root}>
          <FaqSearch admin={admin} faqNumber={number} faqPage={page} />
          <div className={classes.body}>
            <div className={classes.faqList}>
              <FaqButtons admin={admin} faqs={faqs} selectedFaqId={ids} />
              <FaqList admin={admin} faqs={faqs} selectedFaqId={ids} faqPage={page}/>
            </div>
            <div className={classes.faqEdit}>{route.routes ? renderRoutes(route.routes,{ admin, faq }) : null}</div>
          </div>
        </div> ) 
      : ( <Redirect to={{ pathname: '/login/authenticate', state: { from: location } }} /> );
  }
}
Faq.displayName = 'Faq';
Faq.defaultProps = {};
Faq.propTypes = {
  classes: PropTypes.object.isRequired
, match: PropTypes.object.isRequired
, route: PropTypes.object.isRequired
, location: PropTypes.object.isRequired
};
const barHeightSmUp     = 112;
const barHeightSmDown   = 104;
const listWidth         = 400;
const searchHeight      = 62;
const faqHeightSmUp    = `calc(100vh - ${barHeightSmUp}px - ${searchHeight}px)`;
const faqHeightSmDown  = `calc(100vh - ${barHeightSmDown}px - ${searchHeight}px)`;
const styles = theme => ({
  root:     { display: 'flex', flexDirection: 'column' }
, body:     { display: 'flex', flexDirection: 'row' }
, faqList:  { width: listWidth, minWidth: listWidth, height: faqHeightSmDown
            , [theme.breakpoints.up('sm')]: { height: faqHeightSmUp }}
, faqEdit:  { flex: 1 }
});
export default withStyles(styles)(Container.create(Faq));
