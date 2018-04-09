import React from 'react';
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import { Divider, List } from 'material-ui';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import {
  AccountBox        as UsersIcon  
  , VerifiedUser    as ApprovalIcon 
  , LiveHelp        as FaqIcon
  , Feedback        as InquiryIcon   
  , MonetizationOn  as InventoryIcon
} from 'material-ui-icons';

class DrawerList extends React.Component {
  handleClickButton(name, event) {
    switch(name) {
      case 'users':
        this.props.history.push('/users');
        break;
      case 'approval':
        this.props.history.push('/approval');
        break;
      case 'inquiry':
        this.props.history.push('/inquiry');
        break;
      case 'faq':
        this.props.history.push('/faq');
        break;
      case 'inventry':
        this.props.history.push('/inventry');
        break;
      default:
        break;
    }
  }

  renderListItems() {
    return <div>
      <ListItem button
        onClick={this.handleClickButton.bind(this, 'users')}>
        <ListItemIcon>
          <UsersIcon />
        </ListItemIcon>
        <ListItemText primary="Users" />
      </ListItem>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'approval')}>
        <ListItemIcon>
          <ApprovalIcon />
        </ListItemIcon>
        <ListItemText primary="Approval" />
      </ListItem>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'faq')}>
        <ListItemIcon>
          <FaqIcon />
        </ListItemIcon>
        <ListItemText primary="FAQ" />
      </ListItem>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'inquiry')}>
        <ListItemIcon>
          <InquiryIcon />
        </ListItemIcon>
        <ListItemText primary="Inquiry" />
      </ListItem>
    </div>;
  }
    
  renderOtherListItems() {
    return <div>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'inventory')}>
        <ListItemIcon>
          <InventoryIcon />
        </ListItemIcon>
        <ListItemText primary="Inventory" />
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
  drawerHeader: { height: barHeightSmDown
                , [theme.breakpoints.up('sm')]: {
                  height: barHeightSmUp }}
});

DrawerList.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(DrawerList));
