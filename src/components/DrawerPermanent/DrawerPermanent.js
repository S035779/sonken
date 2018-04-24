import React              from 'react';
import PropTypes          from 'prop-types'
import classNames         from 'classnames';
import std                from 'Utilities/stdutils';

import { withStyles }     from 'material-ui/styles';
import { Hidden, Drawer } from 'material-ui';
import DrawerList         from 'Components/DrawerList/DrawerList';
import rgstImg            from 'Assets/image/sidebar-5.jpg';

const env = process.env.NODE_ENV || 'development';
const assets = process.env.ASSET_URL;
let image;
if(env === 'development') {
  image = assets;
} else
if(env === 'production' || env === 'staging') {
  image = assets + '/image';
}

class DrawerPermanent extends React.Component {
  render() {
    //std.logInfo(DrawerPermanent.displayName, 'Props', this.props);
    //std.logInfo(DrawerPermanent.displayName, 'State', this.state);
    const { classes, user, profile, preference, open, categorys }
      = this.props;
    const paperClass
      = { paper: classNames(classes.paper, !open && classes.paperClose) };
    return <Hidden smDown implementation="css">
      <Drawer
        variant="permanent"
        open={open}
        classes={paperClass}>
        <DrawerList
          open={open}
          user={user}
          profile={profile}
          preference={preference}
          categorys={categorys}
        />
      </Drawer>
    </Hidden>
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
  , backgroundSize: 'cover'
  , width: drawerWidthMdDown
  , [theme.breakpoints.up('md')]: {
      width: drawerWidthMdUp, height: '100%'
    }
  , transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp
    , duration: theme.transitions.duration.enteringScreen
    })
  }
, paperClose: {
    overflowX: 'hidden'
  , transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp
    , duration: theme.transitions.duration.leavingScreen
    })
  , width: theme.spacing.unit *7
  , [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit *9
    }
  }
});
DrawerPermanent.displayName = 'DrawerPermanent';
DrawerPermanent.defaultProps = {};
DrawerPermanent.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(DrawerPermanent);
