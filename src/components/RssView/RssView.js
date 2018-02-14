import React from 'react';
import marked from 'marked';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';

class RssView extends React.Component {
  render() {
    const {classes, note} = this.props;
    return <div className={classes.root}
      dangerouslySetInnerHTML={{ __html: marked(note.body) }}/>;
  }
};

const styles = {
  root: { '& pre': {
      border: '1px solid #CCC', padding: '10px'
    , backgroundColor: '#FAFAFA', margin: '10px 0' }
    , '& blockquote': { borderLeft: '5px solid #CCC'
      , padding: '10px 10px 10px 20px'
      , '& > *:first-child': { marginTop: 0 }
      , '& > *:last-child': { matginBottom: 0 }}}
};
RssView.displayName = 'RssView';
RssView.defaultProps = { note: null };
RssView.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssView);
