import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';
import RssItems from 'Components/RssItems/RssItems';

class ClosedSellersEdit extends React.Component {
  render() {
    const { classes, user, note, category, file} = this.props
    if(!note || !note._id) return null;
    return <div className={classes.noteEdit}>
      <div className={classes.items}>
        <RssItems
          user={user}
          note={note} 
          category={category}
          file={file} />
      </div>
    </div>;
  }
};

const barHeightSmUp     = 64;//112;
const barHeightSmDown   = 56;//104;
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
ClosedSellersEdit.displayName= 'ClosedSellersEdit';
ClosedSellersEdit.defaultProps = { note: null };
ClosedSellersEdit.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(ClosedSellersEdit);
