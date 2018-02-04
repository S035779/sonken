import React from 'react';
import marked from 'marked';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';

class NoteBody extends React.Component {
  render() {
    const {classes} = this.props;
    return <div className={classes.root}
      dangerouslySetInnerHTML={{ __html: marked(this.props.body) }}/>;
  }
};

const styles = {
  root: {
    '& pre': {
      border: '1px solid #CCC', padding: '10px'
      , backgroundColor: '#FAFAFA', margin: '10px 0'
    }
    , '& blockquote': {
      borderLeft: '5px solid #CCC'
      , padding: '10px 10px 10px 20px'
      , '& > *:first-child': { marginTop: 0 }
      , '& > *:last-child': { matginBottom: 0 }
    }
  }
};
NoteBody.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(NoteBody);
