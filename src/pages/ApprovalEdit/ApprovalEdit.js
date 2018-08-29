import React          from 'react';
import PropTypes      from 'prop-types';
//import std            from 'Utilities/stdutils';

import { withStyles } from '@material-ui/core/styles';
import ApprovalForms  from 'Components/ApprovalForms/ApprovalForms';

class ApprovalEdit extends React.Component {
  render() {
    //std.logInfo(ApprovalEdit.displayName, 'Props', this.props);
    const { classes, admin, user, preference } = this.props
    if(!user || !user._id) return null;
    return <div className={classes.userEdit}>
      <div className={classes.forms}>
        <ApprovalForms admin={admin} user={user} preference={preference}/>
      </div>
    </div>;
  }
}
ApprovalEdit.displayName= 'ApprovalEdit';
ApprovalEdit.defaultProps = { user: null };
ApprovalEdit.propTypes = {
  classes: PropTypes.object.isRequired
, admin: PropTypes.string.isRequired
, user: PropTypes.object.isRequired
, preference: PropTypes.object.isRequired
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
export default withStyles(styles)(ApprovalEdit);
