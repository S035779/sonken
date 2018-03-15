import React              from 'react';
import PropTypes          from 'prop-types';
import { Link }           from 'react-router-dom';
import std                from 'Utilities/stdutils';

import { withStyles }     from 'material-ui/styles';
import { AccountCircle }  from 'material-ui-icons';
import EditBody           from 'Components/EditBody/EditBody';

class PostedFaqList extends React.Component {
  renderList(faq, classes) {
    return <li className={classes.item} key={faq._id}>
      <Link to={`/faqs/${faq._id}`} className={classes.link}>
      <div className={classes.title}>{faq.title}</div>
      <div className={classes.meta}>
        <span className={classes.author}>
          <AccountCircle className={classes.icon} />{faq.user}
        </span>
        <span className={classes.updated}>
        {std.getLocalTimeStamp(faq.updated)}
        </span>
      </div>
      <EditBody body={faq.body} />
      </Link>
    </li>;
  }

  render() {
    const { classes, faqs } = this.props;
    const renderList = faqs.map(faq => this.renderList(faq, classes));
    return <div className={classes.root}>
      <ul className={classes.list}>{renderList}</ul>
    </div>;
  }
};
const styles = theme => ({
  root:     {}
, list:     { margin: '10px 0', padding: 0, listStyle: 'none'
            , borderTop:    '1px solid #CCC' }
, item:     { borderBottom: '1px solid #CCC' }
, link:     { display: 'block', color: '#333', padding: '20px 15px'
            , textDecoration: 'none'
            , borderLeft: '8px solid transparent'
            , '&:hover': {
              borderLeftColor: '#2673E8', background: '#F5F5F5' }}
, title:    { fontWeight: 'bold', fontSize: '20px' }
, meta:     { fontSize: '13px', marginTop: '10px' }
, author:   { display: 'inline-block', marginRight: '15px' }
, icon:     { margin: theme.spacing.unit, verticalAlign: 'middle' }
, updated:  { color: '#666' }
});
PostedFaqList.displayName = 'PostedFaqList';
PostedFaqList.defaultProps = { faqs: null };
PostedFaqList.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(PostedFaqList);
