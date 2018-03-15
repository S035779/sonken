import React            from 'react';
import PropTypes        from 'prop-types';
import { Container }    from 'flux/utils';
import FaqAction        from 'Actions/FaqAction';
import { getStores, getState }
                        from 'Stores';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import PostedFaqList  from 'Components/PostedFaqList/PostedFaqList';

class Faqs extends React.Component {
  static getStores() {
    return getStores(['postedFaqsStore']);
  }

  static calculateState() {
    return getState('postedFaqsStore');
  }

  static prefetch(options) {
    std.logInfo(Faqs.displayName, 'prefetch', options)
    return FaqAction.prefetchPostedFaqs();
  }

  componentDidMount() {
    std.logInfo(Faqs.displayName, 'fetch', 'Faqs');
    FaqAction.fetchPostedFaqs();
  }

  render() {
    std.logInfo(Faqs.displayName, 'State', this.state);
    const { classes } = this.props;
    const { faqs } = this.state;
    let _faqs = [];
    faqs.forEach(faq => {
      if(faq.posted) _faqs.push(faq);
    });
    return <div className={classes.root}>
      <h1 className={classes.title}>FAQ</h1>
      <PostedFaqList faqs={_faqs} />
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
