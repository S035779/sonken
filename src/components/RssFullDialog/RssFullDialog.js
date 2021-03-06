import React            from 'react';
import PropTypes        from 'prop-types';

import { withStyles }   from '@material-ui/core/styles';
import { Button, Dialog, AppBar, Toolbar, Typography, IconButton, Slide } from '@material-ui/core';
import { Close }        from '@material-ui/icons';

const Transition =  props => <Slide direction="up" {...props} />;

class RssFullDialog extends React.Component {
  handleClose() {
    this.props.onClose();
  }

  render() {
    const { classes, open, children, title } = this.props;
    return <Dialog fullScreen TransitionComponent={Transition} open={open} onClose={this.handleClose.bind(this)}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton color="inherit" onClick={this.handleClose.bind(this)}>
              <Close />
            </IconButton>
            <Typography variant="h6" color="inherit" className={classes.flex}>{title}</Typography>
            <Button color="inherit" onClick={this.handleClose.bind(this)}>Close</Button>
          </Toolbar>
        </AppBar>
        {children}
      </Dialog>;
  }
}
RssFullDialog.displayName = 'RssFullDialog';
RssFullDialog.defaultProps = {};
RssFullDialog.propTypes = {
  classes: PropTypes.object.isRequired
, onClose: PropTypes.func.isRequired
, open: PropTypes.bool.isRequired
, children: PropTypes.object.isRequired
, title: PropTypes.string.isRequired
};

const styles = {
  appBar: { position: 'relative' }
, flex: { flex: 1 }
};
export default withStyles(styles)(RssFullDialog);
