import loadable       from '@loadable/component';
import React          from 'react';
import PropTypes      from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
const RssItems = loadable(() => import('Components/RssItems/RssItems'));

class SellersEdit extends React.Component {
  render() {
    const { classes, user, note, category, file, images, noteNumber, itemsNumber } = this.props
    if(!note || !note._id) return null;
    const itemNumber = note.item_attributes && note.item_attributes.item ? note.item_attributes.item.total : 0;
    const attrNumber = note.item_attributes && note.item_attributes.sold ? note.item_attributes.sold.total : 0;
    const loadingDownload = itemNumber !== attrNumber;
    return <div className={classes.noteEdit}>
      <RssItems user={user} note={note} category={category} noteNumber={noteNumber} itemsNumber={itemsNumber} itemNumber={itemNumber}
        loadingDownload={loadingDownload} file={file} images={images} />
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
, images: PropTypes.array
, noteNumber: PropTypes.number.isRequired
, itemsNumber: PropTypes.number.isRequired
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
