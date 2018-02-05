import React from 'react';
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import InboxIcon from 'material-ui-icons/MoveToInbox';
import DraftsIcon from 'material-ui-icons/Drafts';
import StarIcon from 'material-ui-icons/Star';
import DeleteIcon from 'material-ui-icons/Delete';

class DrawerList extends React.Component {
  renderListItems() {
    return <div>
      <ListItem button>
        <ListItemIcon>
          <InboxIcon />
        </ListItemIcon>
        <ListItemText primary="Inbox" />
      </ListItem>
      <ListItem button>
        <ListItemIcon>
          <StarIcon />
        </ListItemIcon>
        <ListItemText primary="Starred" />
      </ListItem>
      <ListItem button>
        <ListItemIcon>
          <DraftsIcon />
        </ListItemIcon>
        <ListItemText primary="Drafts" />
      </ListItem>
    </div>;
  }
    
  renderOtherListItems() {
    return <div>
      <ListItem button>
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
export default withStyles(styles)(DrawerList);
