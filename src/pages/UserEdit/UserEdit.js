import React          from 'react';
import PropTypes      from 'prop-types';

import { withStyles } from 'material-ui/styles';
import UserForms       from 'Components/UserForms/UserForms';

class UserEdit extends React.Component {
  render() {
    const { classes, user, note } = this.props
    if(!note || !note.id) return null;
    return <div className={classes.noteEdit}>
      <div className={classes.forms}>
        <UserForms
          user={user}
          note={note}>
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
  noteEdit: { display: 'flex', flexDirection: 'column'
            , height: editHeightSmDown
            , [theme.breakpoints.up('sm')]: { height: editHeightSmUp }}
, forms:    { overflow: 'scroll' }
});
UserEdit.displayName= 'UserEdit';
UserEdit.defaultProps = { note: null };
UserEdit.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(UserEdit);
