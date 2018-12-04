import * as R             from 'ramda';
import React              from 'react';
import { withRouter }     from 'react-router-dom';
import PropTypes          from 'prop-types'
import classNames         from 'classnames';
import NoteAction         from 'Actions/NoteAction';
import std                from 'Utilities/stdutils';

import { withStyles }     from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Fab, LinearProgress }
                          from '@material-ui/core';
import { Menu, MoreVert } from '@material-ui/icons';
import RssMenu            from 'Components/RssMenu/RssMenu';

const interval = 1000 * 60 * 3;

class RssHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      loadingDownload: false
    , category: ''
    };
  }

  componentDidMount() {
    const { user, location } = this.props;
    const category = location.pathname.split('/')[1];
    this.timer = std.invoke(() => NoteAction.fetchJobs({ user, category }), 0, interval);
  }

  componentWillUnmount() {
    if(this.timer) clearInterval(this.timer);
  }

  componentWillReceiveProps(nextProps) {
    const { user, location, jobs } = nextProps;
    const nextJobs = !R.isEmpty(jobs);
    const prevJobs = this.state.loadingDownload;
    const nextCategory = location.pathname.split('/')[1];
    const prevCategory = this.state.category;
    if(nextJobs !== prevJobs) {
      this.setState({ loadingDownload: nextJobs });
    }
    if(nextCategory !== prevCategory) {
      NoteAction.fetchJobs({ user, category: nextCategory });
      this.setState({ category: nextCategory });
      if(this.timer) clearInterval(this.timer);
      this.timer = std.invoke(() => NoteAction.fetchJobs({ user, category: nextCategory }), 0, interval);
    }
  }

  handleToggle() {
    this.props.onClick();
  }

  getTitleName(location) {
    let category = location.pathname.split('/')[1];
    switch(category) {
      case 'marchant':
        category='商品RSS';
        break;
      case 'sellers':
        category='出品者RSS';
        break;
      case 'closedmarchant':
        category='落札相場';
        break;
      case 'closedsellers':
        category='落札履歴';
        break;
      case 'bids':
        category='入札リスト';
        break;
      case 'trade':
        category='取引チェック';
        break;
      default:
        category='商品RSS';
        break;
    }
    return category;
  }

  render() {
    //std.logInfo(RssHeader.displayName, 'State', this.state);
    //std.logInfo(RssHeader.displayName, 'Props', this.props);
    const { classes, user, preference, profile, open, children, location, isAuthenticated } = this.props;
    const { loadingDownload } = this.state;
    const title = this.getTitleName(location);
    return <div className={classNames(classes.navHeader, open && classes.navHeaderShift)}>
      <AppBar color="default" position="static" className={classes.navBar}>
      <Toolbar>
        <Fab size="small" color="primary" onClick={this.handleToggle.bind(this)} className={classes.navIcon}>
          { open ? <MoreVert /> : <Menu /> }
        </Fab>
        <Typography variant="h6" color="inherit" className={classes.title}>{title}</Typography>
        <div className={classes.loginIcon}>
          <RssMenu isAuthenticated={isAuthenticated} user={user} preference={preference} profile={profile} />
        </div>
      </Toolbar>
      </AppBar>
      { loadingDownload ? <LinearProgress color="secondary" /> : null }
      <div className={classes.content}>{children}</div>
    </div>;
  }
}
RssHeader.displayName = 'RssHeader';
RssHeader.defaultProps = {};
RssHeader.propTypes = {
  classes:  PropTypes.object.isRequired
, isAuthenticated: PropTypes.bool.isRequired
, onClick: PropTypes.func.isRequired
, user: PropTypes.string.isRequired
, preference: PropTypes.object.isRequired
, profile: PropTypes.object.isRequired
, open: PropTypes.bool.isRequired
, children: PropTypes.object.isRequired
, location: PropTypes.object.isRequired
, jobs: PropTypes.array.isRequired
};

const drawerMinWidthMdUp    = 72;
const drawerMinWidthMdDown  = 0;
const drawerWidth           = 240;
const navHeightSmUp         = 64;
const navHeightSmDown       = 56;
const barHeightSmUp         = 64;
const barHeightSmDown       = 56;
const styles = theme => ({
  navHeader:        { marginLeft: drawerMinWidthMdDown, [theme.breakpoints.up('md')]: { marginLeft: drawerMinWidthMdUp }
, transition:       theme.transitions.create(['width', 'margin']
                  , { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }) }
, navHeaderShift:   { marginLeft: drawerMinWidthMdDown
                    , [theme.breakpoints.up('md')]: { marginLeft: drawerWidth, width: `calc(100% - ${drawerWidth}px)` }
                    , transition: theme.transitions.create(['width', 'margin']
                    , { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }) }
, navBar:           { height: navHeightSmDown, padding: 2, [theme.breakpoints.up('sm')]: { height: navHeightSmUp, padding: 6 } }
, navIcon:          { marginLeft: -12, marginRight: 20 }
, title:            { flex: 1, color: '#888888' }
, loginIcon:        { marginLeft: 'auto' }
, content:          { width: '100%', height: `calc(100vh - ${barHeightSmDown}px)`
                    , [theme.breakpoints.up('sm')]: { height: `calc(100vh - ${barHeightSmUp}px)` } }
});
export default withStyles(styles)(withRouter(RssHeader));
