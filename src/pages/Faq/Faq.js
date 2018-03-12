import React            from 'react';
import PropTypes        from 'prop-types';
import { Redirect }     from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { Container }    from 'flux/utils';
import UserAction       from 'Actions/UserAction';
import { getStores, getState }
                        from 'Stores';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import AdminSearch        from 'Components/AdminSearch/AdminSearch';
import FaqButtons       from 'Components/FaqButtons/FaqButtons';
import FaqList          from 'Components/FaqList/FaqList';

class Faq extends React.Component {
  static getStores() {
    return getStores(['faqStore']);
  }

  static calculateState() {
    return getState('faqStore');
  }

  static prefetch(options) {
    std.logInfo(Faq.displayName, 'prefetch', options);
    return UserAction.presetAdmin(options.admin)
      .then(() => UserAction.prefetchFaqs());
  }

  componentDidMount() {
    std.logInfo(Faq.displayName, 'fetch', 'Faq');
    UserAction.fetchFaqs(this.state.admin);
  }

  faqPage(number, page) {
    return number < page.perPage ? number : page.perPage;
  }

  render() {
    std.logInfo(Faq.displayName, 'State', this.state);
    std.logInfo(Faq.displayName, 'Props', this.props);
    const { classes, match, route, location } = this.props;
    const { isAuthenticated, admin, faqs, page, ids } = this.state;
    const _id = match.params.id;
    const faq = faqs.find(obj => obj._id === _id);
    const number = faqs.length;
    faqs.length = this.faqPage(number, page);
    if(!isAuthenticated) {
      return <Redirect to={{
        pathname: '/login/authenticate', state: { from: location } }} />;
    }
    return <div className={classes.root}>
        <AdminSearch
          admin={admin}
          faqNumber={number} faqPage={page} />
      <div className={classes.body}>
        <div className={classes.faqList}>
          <FaqButtons
            admin={admin}
            faqs={faqs}
            selectedFaqId={ids} />
          <FaqList
            admin={admin}
            faqs={faqs}
            selectedFaqId={ids}
            faqPage={page}/>
        </div>
        <div className={classes.faqEdit}>
        {route.routes ? renderRoutes(route.routes,{ admin, faq }) : null}
        </div>
      </div>
    </div>;
  }
};

const barHeightSmUp     = 112;
const barHeightSmDown   = 104;
const listWidth         = 400;
const searchHeight      = 62;
const faqHeightSmUp    = 
  `calc(100vh - ${barHeightSmUp}px - ${searchHeight}px)`;
const faqHeightSmDown  =
  `calc(100vh - ${barHeightSmDown}px - ${searchHeight}px)`;
const styles = theme => ({
  root:     { display: 'flex', flexDirection: 'column' }
, body:     { display: 'flex', flexDirection: 'row' }
, faqList: { width: listWidth, minWidth: listWidth
            , height: faqHeightSmDown
            , [theme.breakpoints.up('sm')]: { height: faqHeightSmUp }}
, faqEdit: { flex: 1 }
});
Faq.displayName = 'Faq';
Faq.defaultProps = {};
Faq.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Faq));
