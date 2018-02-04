import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import { Star, StarBorder } from 'material-ui-icons';

class StarButton extends React.Component {
  renderStar(classes) {
    return <Button raised size="medium" color="primary"
      className={classes.button}
      onClick={this.props.onChange.bind(this, true)}>
      Star<Star className={classes.star} />
    </Button>;
  }

  renderUnstar(classes) {
    return <Button raised size="medium" color="secondary"
      className={classes.button}
      onClick={this.props.onChange.bind(this, false)}>
      Unstar<StarBorder className={classes.unstar} />
    </Button>;
  }

  render() {
    const { classes } = this.props;
    const renderButton = this.props.starred
        ? this.renderUnstar(classes) : this.renderStar(classes);
    return <span className={classes.root}>
      {renderButton}
    </span>;
  }
};
const styles = theme => ({
  root:   {},
  button: { margin:     theme.spacing.unit },
  star:   { marginLeft: theme.spacing.unit },
  unstar: { marginLeft: theme.spacing.unit }
});
StarButton.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(StarButton);
