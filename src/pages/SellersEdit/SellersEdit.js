import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';
import RssItems from 'Components/RssItems/RssItems';

class SellersEdit extends React.Component {
  render() {
    const { classes, user, note } = this.props
    if(!note || !note._id) return null;
    return <div className={classes.noteEdit}>
      <div className={classes.items}>
        <RssItems
          user={user}
          note={note} />
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
, items:     { overflow: 'scroll' }
});
SellersEdit.displayName= 'SellersEdit';
SellersEdit.defaultProps = { note: null };
SellersEdit.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(SellersEdit);
