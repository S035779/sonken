import React from 'react';
import PropTypes from 'prop-types'

import { withStyles } from 'material-ui/styles';
import { AppBar, Toolbar, Typography
       , IconButton, Button } from 'material-ui';
import { Menu as MenuIcon } from 'material-ui-icons';
import LoginMenu from 'Components/LoginMenu/LoginMenu';
import LoginSwitch from 'Components/LoginMenu/LoginSwitch';
import ButtonNav from 'Components/ButtonNav/ButtonNav';

class GlobalHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state ={ auth: true };
  }

  handleChange(event, checked) {
    this.setState({ auth: checked });
  }

  handleClickNav() {
    this.props.onClickNav();
  }

  render() {
    const {classes} = this.props;
    const {auth} = this.state;
    return <div className={classes.appBar}>
      <LoginSwitch auth={auth} onChange={this.handleChange.bind(this)}/>
      <AppBar position="static">
      <Toolbar>
        <IconButton className={classes.navIcon}
          color="inherit" aria-label="open drawer"
          onClick={this.handleClickNav.bind(this)}>
        <MenuIcon />
        </IconButton>
        <Typography type="title" color="inherit" 
          className={classes.title} noWrap>Watch Note</Typography>
        <ButtonNav />
        <LoginMenu auth={auth}/>
      </Toolbar>
      </AppBar>
    </div>;
  }
};
const drawerWidthMdUp = 240;
const styles = theme => ({
  appBar:     { position: 'absolute'
              , width: '100%'
              , [theme.breakpoints.up('md')]: {
                  width: `calc(100% - ${drawerWidthMdUp}px)`
                , marginLeft: drawerWidthMdUp
              }},
  title:      { flex: '1 1 auto' },
  navIcon:    { marginLeft: -12, marginRight: 20
              , [theme.breakpoints.up('md')]: {
                  display: 'none'
              }}
});
GlobalHeader.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(GlobalHeader);
