import React          from 'react';
import marked         from 'marked';
import PropTypes      from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

class EditBody extends React.Component {
  render() {
    const { classes, body } = this.props;
    return (<div className={classes.root} dangerouslySetInnerHTML={{ __html: marked(body) }}/>);
  }
}
EditBody.displayName = 'EditBody';
EditBody.defaultProps = {};
EditBody.propTypes = {
  classes: PropTypes.object.isRequired
, body: PropTypes.string.isRequired
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
export default withStyles(styles)(EditBody);
