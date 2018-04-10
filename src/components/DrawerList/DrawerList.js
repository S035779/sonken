import React              from 'react';
import PropTypes          from 'prop-types'
import { withRouter }     from 'react-router-dom';

import { withStyles }     from 'material-ui/styles';
import { Divider, List, Avatar }
                          from 'material-ui';
import { ListItem, ListItemIcon, ListItemText }
                          from 'material-ui/List';
import { Collapse }       from 'material-ui/transitions';
import { LocalMall, People, Timeline, Gavel, ArrowDropUp, ArrowDropDown
, RssFeed }               from 'material-ui-icons';

class DrawerList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
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
    }
  }

  renderListItems() {
    return <div>
      <ListItem button
        onClick={this.handleClickButton.bind(this, 'marchant')}>
        <ListItemIcon><LocalMall /></ListItemIcon>
        <ListItemText primary="Marchandise" />
      </ListItem>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'sellers')}>
        <ListItemIcon><People /></ListItemIcon>
        <ListItemText primary="Sellers" />
      </ListItem>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'bids')}>
        <ListItemIcon><Timeline /></ListItemIcon>
        <ListItemText primary="Bids" />
      </ListItem>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'trade')}>
        <ListItemIcon><Gavel /></ListItemIcon>
        <ListItemText primary="Trade" />
      </ListItem>
    </div>;
  }
    
  renderUserListItems() {
    const { classes, user } = this.props;
    const { open } = this.state;
    return <div>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'user')}>
        <ListItemIcon>
          <Avatar className={classes.avatar}>{user.substr(0,2)}</Avatar>
        </ListItemIcon>
        <ListItemText primary={user} />
        {open ? <ArrowDropUp /> : <ArrowDropDown />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem button>
            <ListItemIcon>
              <Avatar className={classes.avatar}>MP</Avatar>
            </ListItemIcon>
            <ListItemText primary="My Profile" />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <Avatar className={classes.avatar}>EP</Avatar>
            </ListItemIcon>
            <ListItemText primary="Edit Profile" />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <Avatar className={classes.avatar}>S</Avatar>
            </ListItemIcon>
            <ListItemText primary="Setting" />
          </ListItem>
        </List>
      </Collapse>
    </div>;
  }
    
  renderTitleListItems() {
    const { classes } = this.props;
    return <div>
      <ListItem button
        onClick={this.handleClickButton.bind(this, 'title')}>
        <ListItemIcon><RssFeed /></ListItemIcon>
        <ListItemText primary="RSS Reader !!" />
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

const barHeightSmUp = 112;
const barHeightSmDown = 104;
const styles = theme => ({
  header: {
    height: barHeightSmDown
  , [theme.breakpoints.up('sm')]: { height: barHeightSmUp }
  }
, avatar: { width: 24, height: 24, fontSize: 12 }
, nested: { }
});

DrawerList.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(DrawerList));
