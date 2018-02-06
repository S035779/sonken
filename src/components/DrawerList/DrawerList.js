import React from 'react';
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import { Divider, List } from 'material-ui';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import { MoveToInbox as InboxIcon  
       , Drafts      as DraftsIcon 
       , Star        as StarIcon   
       , Delete      as DeleteIcon } from 'material-ui-icons';

class DrawerList extends React.Component {
  handleClickButton(name, event) {
    switch(name) {
      case 'inbox':
        this.props.history.push('/');
        break;
      case 'starred':
        this.props.history.push('/starred');
        break;
      case 'drafts':
        this.props.history.push('/drafts');
        break;
      case 'trash':
        this.props.history.push('/trash');
        break;
      default:
        break;
    }
  }

  renderListItems() {
    return <div>
      <ListItem button
        onClick={this.handleClickButton.bind(this, 'inbox')}>
        <ListItemIcon>
          <InboxIcon />
        </ListItemIcon>
        <ListItemText primary="Inbox" />
      </ListItem>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'starred')}>
        <ListItemIcon>
          <StarIcon />
        </ListItemIcon>
        <ListItemText primary="Starred" />
      </ListItem>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'drafts')}>
        <ListItemIcon>
          <DraftsIcon />
        </ListItemIcon>
        <ListItemText primary="Drafts" />
      </ListItem>
    </div>;
  }
    
  renderOtherListItems() {
    return <div>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'trash')}>
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText primary="Trash" />
      </ListItem>
    </div>;
  }
    
  render() {
    const {classes} = this.props;
    const renderListItems = this.renderListItems();
    const renderOtherListItems = this.renderOtherListItems();
    return <div>
      <div className={classes.drawerHeader} />
      <Divider />
      <List>{renderListItems}</List>
      <Divider />
      <List>{renderOtherListItems}</List>
    </div>;
  }
};

const barHeightSmUp = 112;
const barHeightSmDown = 104;
const styles = theme => ({
  drawerHeader:{height: barHeightSmDown
              , [theme.breakpoints.up('sm')]: {
                  height: barHeightSmUp
              }}
});

DrawerList.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(DrawerList));
