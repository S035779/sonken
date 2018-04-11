import React            from 'react';
import PropTypes        from 'prop-types'
import { withRouter }   from 'react-router-dom';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { Divider, List, Avatar }
                        from 'material-ui';
import { ListItem, ListItemIcon, ListItemText }
                        from 'material-ui/List';
import { Collapse }     from 'material-ui/transitions';
import { LocalMall, People, Timeline, Gavel, ArrowDropUp, ArrowDropDown
, RssFeed }             from 'material-ui-icons';
import LoginProfile     from 'Components/LoginProfile/LoginProfile';
import LoginPreference  from 'Components/LoginPreference/LoginPreference';

class DrawerList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    , isProfile: false
    , isPreference: false
    };
  }

  handleClickButton(name, event) {
    switch(name) {
      case 'title':
        this.props.history.push('/login/authenticate');
        break;
      case 'marchant':
        this.props.history.push('/marchant');
        break;
      case 'sellers':
        this.props.history.push('/sellers');
        break;
      case 'bids':
        this.props.history.push('/bids');
        break;
      case 'trade':
        this.props.history.push('/trade');
        break;
      case 'user':
        this.setState({ open: !this.state.open });
        break;
      case 'isPreference':
      case 'isProfile':
        this.setState({ [name]: true });
        break;
    }
  }

  handleCloseDialog(name, event) {
    std.logInfo(DrawerList.displayName, 'handleCloseDialog', name);
    this.setState({ [name]: false });
  }

  renderListItems() {
    const { classes } = this.props;
    const textClass =
      { primary: classes.primary, secondary: classes.secondary };
    return <div>
      <ListItem button
        onClick={this.handleClickButton.bind(this, 'marchant')}>
        <ListItemIcon>
          <LocalMall className={classes.icon} />
        </ListItemIcon>
        <ListItemText primary="Merchandise" classes={textClass} />
      </ListItem>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'sellers')}>
        <ListItemIcon>
          <People className={classes.icon} />
        </ListItemIcon>
        <ListItemText primary="Sellers" classes={textClass} />
      </ListItem>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'bids')}>
        <ListItemIcon>
          <Timeline className={classes.icon} />
        </ListItemIcon>
        <ListItemText primary="Bids" classes={textClass} />
      </ListItem>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'trade')}>
        <ListItemIcon>
          <Gavel className={classes.icon} />
        </ListItemIcon>
        <ListItemText primary="Trade" classes={textClass} />
      </ListItem>
    </div>;
  }
    
  renderUserListItems() {
    const { classes, profile, preference } = this.props;
    const { open, isProfile, isPreference } = this.state;
    const { name, user, kana, email, phone, plan } = profile;
    const textClass =
      { primary: classes.primary, secondary: classes.secondary };
    return <div>
        <ListItem button 
          onClick={this.handleClickButton.bind(this, 'user')}>
          <ListItemIcon>
            <Avatar className={classes.avatar}>
              {user ? user.substr(0,2) : ''}</Avatar>
          </ListItemIcon>
          <ListItemText primary={user} classes={textClass} />
          {open
            ? <ArrowDropUp className={classes.icon} />
            : <ArrowDropDown className={classes.icon} />
          }
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button>
              <ListItemIcon>
                <Avatar className={classes.avatar}>MP</Avatar>
              </ListItemIcon>
              <ListItemText primary="My Profile" classes={textClass} />
            </ListItem>
            <ListItem button
              onClick={this.handleClickButton.bind(this, 'isProfile')}>
              <ListItemIcon>
                <Avatar className={classes.avatar}>EP</Avatar>
              </ListItemIcon>
              <ListItemText primary="Edit Profile" classes={textClass} />
            </ListItem>
            <ListItem button
              onClick={this.handleClickButton.bind(this, 'isPreference')}>
              <ListItemIcon>
                <Avatar className={classes.avatar}>S</Avatar>
              </ListItemIcon>
              <ListItemText primary="Setting" classes={textClass} />
            </ListItem>
          </List>
          <LoginProfile
            open={isProfile}
            profile={profile}
            name={name}
            user={user}
            kana={kana}
            email={email}
            phone={phone}
            onClose={this.handleCloseDialog.bind(this, 'isProfile')}
          />
          <LoginPreference 
            open={isPreference}
            profile={profile}
            preference={preference}
            name={name}
            user={user}
            plan={plan}
            onClose={this.handleCloseDialog.bind(this, 'isPreference')}
          />
        </Collapse>
      </div>
    ;
  }
    
  renderTitleListItems() {
    const { classes } = this.props;
    const textClass =
      { primary: classes.title, secondary: classes.secondary };
    return <div>
      <ListItem button
        onClick={this.handleClickButton.bind(this, 'title')}>
        <ListItemIcon>
          <RssFeed className={classes.icon} />
        </ListItemIcon>
        <ListItemText primary="RSS Reader !!" classes={textClass}/>
      </ListItem>
    </div>;
  }

  render() {
    const { classes } = this.props;
    const renderTitleListItems = this.renderTitleListItems();
    const renderListItems = this.renderListItems();
    const renderUserListItems = this.renderUserListItems();
    return <div>
      <div className={classes.header}>
        <List>{renderTitleListItems}</List>
      </div>
      <Divider /><List>{renderUserListItems}</List>
      <Divider /><List>{renderListItems}</List>
    </div>;
  }
};

const barHeightSmUp   = 64;//112;
const barHeightSmDown = 56;//104;
const styles = theme => ({
  header: {
    height: barHeightSmDown
  , [theme.breakpoints.up('sm')]: { height: barHeightSmUp }
  }
, icon: {
  color: theme.palette.common.white
}
, avatar: {
    color: theme.palette.common.white
  , background: 'inherit'
  , width: 24, height: 24, fontSize: 16
}
, nested: {}
, primary: {
    whiteSpace: 'nowrap'
  , color: theme.palette.common.white
  }
, secondary: {}
, title:  {
    whiteSpace: 'nowrap'
  , color: theme.palette.common.white
  , fontSize: 20
  }
});

DrawerList.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(DrawerList));
