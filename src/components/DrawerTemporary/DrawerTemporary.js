import React            from 'react';
import PropTypes        from 'prop-types'
import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import { Hidden, Drawer }
                        from '@material-ui/core';
import DrawerList       from 'Components/DrawerList/DrawerList';
import rgstImg          from 'Assets/image/sidebar-5.jpg';

const env = process.env.NODE_ENV || 'development';
const assets = process.env.ASSET_URL;
let image;
if(env === 'development') {
  image = assets;
} else
if(env === 'production' || env === 'staging') {
  image = assets + '/image';
}

class DrawerTemporary extends React.Component {
  handleToggle() {
    this.props.onClose();
  }

  render() {
    //std.logInfo(DrawerTemporary.displayName, 'Props', this.props);
    //std.logInfo(DrawerTemporary.displayName, 'State', this.state);
    const { classes, user, profile, preference, open, categorys }
      = this.props;
    const modalProps = { keepMounted: true };
    const paperClass = { paper: classes.paper };
    return <Hidden mdUp>
      <Drawer
        variant="temporary"
        open={open}
        onClose={this.handleToggle.bind(this)}
        classes={paperClass}
        ModalProps={modalProps}>
        <DrawerList
          open={open}
          user={user}
          profile={profile}
          preference={preference}
          categorys={categorys}
        />
      </Drawer>
    </Hidden>;
  }
};

const drawerWidthMdUp = 240;
const drawerWidthMdDown = 250;
const rgst_top = std.toRGBa('#FFA534', 0.8);
const rgst_btm = std.toRGBa('#FF5221', 0.8);
const styles = theme => ({
  paper:{
    background: `linear-gradient(to bottom, ${rgst_top}, ${rgst_btm})`
      + `, url(${image + rgstImg})`
  , width: drawerWidthMdDown
  , [theme.breakpoints.up('md')]: {
      position: 'relative', width: drawerWidthMdUp, height: '100%'
    }
  }
});
DrawerTemporary.displayName = 'DrawerTemporary';
DrawerTemporary.defaultProps = {};
DrawerTemporary.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(DrawerTemporary);
