import loadable         from '@loadable/component';
import React            from 'react';
import PropTypes        from 'prop-types';

import { withStyles }   from '@material-ui/core/styles';
const RssHeader       = loadable(() => import('Components/RssHeader/RssHeader'));
const DrawerPermanent = loadable(() => import('Components/DrawerPermanent/DrawerPermanent'));
const DrawerTemporary = loadable(() => import('Components/DrawerTemporary/DrawerTemporary'));

class RssDrawer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: true };
  }

  handleToggle() {
    const { open } = this.state;
    this.setState({ open: !open });
  }

  render() {
    const { classes, user, isAuthenticated, profile, preference, categorys, children, jobs } = this.props;
    const { open } = this.state;
    return <div className={classes.root}>
      <RssHeader open={open} user={user} isAuthenticated={isAuthenticated} preference={preference} jobs={jobs} 
        profile={profile} onClick={this.handleToggle.bind(this)}>{children}</RssHeader>
      <DrawerTemporary open={open} user={user} preference={preference} profile={profile} categorys={categorys}
        onClose={this.handleToggle.bind(this)} />
      <DrawerPermanent open={open} user={user} preference={preference} profile={profile} categorys={categorys} />
    </div>;
  }
}
RssDrawer.displayName = 'RssDrawer';
RssDrawer.defaultProps = {};
RssDrawer.propTypes = {
  classes:  PropTypes.object.isRequired
, user: PropTypes.string.isRequired
, isAuthenticated: PropTypes.bool.isRequired
, profile: PropTypes.object.isRequired
, preference: PropTypes.object.isRequired
, categorys: PropTypes.array.isRequired
, children: PropTypes.object.isRequired
, jobs: PropTypes.array.isRequired
};

const styles = {
  root: {position: 'relative'}
};
export default withStyles(styles)(RssDrawer);
