import React            from 'react';
import PropTypes        from 'prop-types'
import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import { Hidden, Drawer }
                        from '@material-ui/core';
import DrawerList       from 'Components/DrawerList/DrawerList';
import rgstImg          from 'Assets/image/sidebar-5.jpg';

const node_env = process.env.NODE_ENV || 'development';
const asetPath = process.env.ASSET_URL;
const rootPath = process.env.PLATFORM === 'local' ? '/' : '';
let image;
if(node_env === 'development') {
  image = asetPath + rootPath;
} else
if(node_env === 'production' || node_env === 'staging') {
  image = asetPath + '/image' + rootPath;
}

class DrawerTemporary extends React.Component {
  handleToggle() {
    this.props.onClose();
  }

  render() {
    //std.logInfo(DrawerTemporary.displayName, 'Props', this.props);
    //std.logInfo(DrawerTemporary.displayName, 'State', this.state);
    const { classes, user, profile, preference, open, categorys } = this.props;
    const modalProps = { keepMounted: true };
    const paperClass = { paper: classes.paper };
    return <Hidden mdUp>
      <Drawer variant="temporary" open={open} onClose={this.handleToggle.bind(this)} classes={paperClass} ModalProps={modalProps}>
        <DrawerList open={open} user={user} profile={profile} preference={preference} categorys={categorys} />
      </Drawer>
    </Hidden>;
  }
}
DrawerTemporary.displayName = 'DrawerTemporary';
DrawerTemporary.defaultProps = {};
DrawerTemporary.propTypes = {
  classes:  PropTypes.object.isRequired
, onClose: PropTypes.func.isRequired
, user: PropTypes.string.isRequired
, profile: PropTypes.object.isRequired
, preference: PropTypes.object.isRequired
, open: PropTypes.bool.isRequired
, categorys: PropTypes.array.isRequired
};

const drawerWidthMdUp = 240;
const drawerWidthMdDown = 250;
const rgst_top = std.toRGBa('#FFA534', 0.8);
const rgst_btm = std.toRGBa('#FF5221', 0.8);
const styles = theme => ({
  paper: {
    background: `linear-gradient(to bottom, ${rgst_top}, ${rgst_btm}), url(${image}${rgstImg})`, width: drawerWidthMdDown
  , [theme.breakpoints.up('md')]: { position: 'relative', width: drawerWidthMdUp, height: '100%' }
  }
});
export default withStyles(styles)(DrawerTemporary);
