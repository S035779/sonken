import React            from 'react';
import PropTypes        from 'prop-types';

import { withStyles }   from 'material-ui/styles';
import { Button, Dialog, AppBar, Toolbar, Typography, IconButton }
                        from 'material-ui';
import { DialogContent }
                        from 'material-ui/Dialog';
import { Close }        from 'material-ui-icons';
import { Slide }        from 'material-ui/transitions';

const Transition =  props => <Slide direction="up" {...props} />;

class RssFullDialog extends React.Component {
  handleClose() {
    this.props.onClose();
  }

  render() {
    const { classes, open, children, title } = this.props;
    return <Dialog
      fullScreen
      transition={Transition}
      open={open}
      onClose={this.handleClose.bind(this)}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton color="inherit"
              onClick={this.handleClose.bind(this)}>
              <Close />
            </IconButton>
            <Typography variant="title" color="inherit"
              className={classes.flex}>
              {title}
            </Typography>
            <Button color="inherit"
              onClick={this.handleClose.bind(this)}>
              Close
            </Button>
          </Toolbar>
        </AppBar>
        {children}
      </Dialog>;
  }
};

const styles = theme => ({
  appBar: { position: 'relative' }
, flex: { flex: 1 }
});
RssFullDialog.displayName = 'RssFullDialog';
RssFullDialog.defaultProps = {};
RssFullDialog.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssFullDialog);
