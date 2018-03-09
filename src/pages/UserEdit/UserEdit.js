import React          from 'react';
import PropTypes      from 'prop-types';
import std            from 'Utilities/stdutils';

import { withStyles } from 'material-ui/styles';
import UserForms       from 'Components/UserForms/UserForms';

class UserEdit extends React.Component {
  render() {
    std.logInfo(UserEdit.displayName, 'Props', this.props);
    const { classes, admin, user } = this.props
    if(!user || !user._id) return null;
    return <div className={classes.userEdit}>
      <div className={classes.forms}>
        <UserForms
          admin={admin}
          user={user}>
      aaaaaa
        </UserForms>
      </div>
    </div>;
  }
};

const barHeightSmDown   = 104;
const barHeightSmUp     = 112;
const rowHeight         = 62
const editHeightSmDown  =
  `calc(100vh - ${barHeightSmDown}px - ${rowHeight}px)`;
const editHeightSmUp    =
  `calc(100vh - ${barHeightSmUp  }px - ${rowHeight}px)`;
const styles = theme => ({
  userEdit: { display: 'flex', flexDirection: 'column'
            , height: editHeightSmDown
            , [theme.breakpoints.up('sm')]: { height: editHeightSmUp }}
, forms:    { overflow: 'scroll' }
});
UserEdit.displayName= 'UserEdit';
UserEdit.defaultProps = { user: null };
UserEdit.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(UserEdit);
