import React          from 'react';
import PropTypes      from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import RssItems       from 'Components/RssItems/RssItems';

class SellersEdit extends React.Component {
  render() {
    const { classes, user, note, category, file} = this.props
    if(!note || !note._id) return null;
    const itemNumber = note.item_attributes && note.item_attributes.item ? note.item_attributes.item.total : 0;
    const attrNumber = note.item_attributes && note.item_attributes.sold ? note.item_attributes.sold.total : 0;
    const loadingDownload = itemNumber !== attrNumber;
    return <div className={classes.noteEdit}>
      <RssItems user={user} note={note} category={category} itemNumber={itemNumber} loadingDownload={loadingDownload} file={file} />
    </div>;
  }
}
SellersEdit.displayName= 'SellersEdit';
SellersEdit.defaultProps = { note: null };
SellersEdit.propTypes = {
  classes: PropTypes.object.isRequired
, user: PropTypes.string.isRequired
, note: PropTypes.object
, category: PropTypes.string.isRequired
, file: PropTypes.object
};

const barHeightSmUp     = 64;
const barHeightSmDown   = 56;
const rowHeight         = 62;
const editHeightSmDown  = `calc(100vh - ${barHeightSmDown}px - ${rowHeight}px)`;
const editHeightSmUp    = `calc(100vh - ${barHeightSmUp  }px - ${rowHeight}px)`;
const styles = theme => ({
  noteEdit: { display: 'flex', flexDirection: 'column', height: editHeightSmDown
            , [theme.breakpoints.up('sm')]: { height: editHeightSmUp }}
});
export default withStyles(styles)(SellersEdit);
