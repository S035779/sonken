import loadable       from '@loadable/component';
import React          from 'react';
import PropTypes      from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
const ClosedForms = loadable(() => import('Components/ClosedForms/ClosedForms'));

class ClosedEdit extends React.Component {
  render() {
    const { classes, user, note, category, filter, file, images, noteNumber, itemsNumber } = this.props
    if(!note || !note._id) return null;
    const itemNumber = note.item_attributes && note.item_attributes.item ? note.item_attributes.item.total : 0;
    const attrNumber = note.item_attributes && note.item_attributes.sold ? note.item_attributes.sold.total : 0;
    const imgsNumber = note.item_attributes && note.item_attributes.images ? note.item_attributes.images.total : 0;
    const loadingDownload = itemNumber !== attrNumber || attrNumber === 0;
    const loadingImages   = itemNumber !== imgsNumber || imgsNumber === 0;
    const perPage = note.item_attributes && note.item_attributes.item ? note.item_attributes.item.count : 0;
    return <div className={classes.noteEdit}>
        <ClosedForms user={user} note={note} category={category} itemFilter={filter} 
          itemNumber={itemNumber} noteNumber={noteNumber} itemsNumber={itemsNumber}
          perPage={perPage} loadingImages={loadingImages} loadingDownload={loadingDownload} file={file} images={images} />
      </div>;
  }
}
ClosedEdit.displayName= 'ClosedEdit';
ClosedEdit.defaultProps = { note: null };
ClosedEdit.propTypes = {
  classes: PropTypes.object.isRequired
, user: PropTypes.string.isRequired
, note: PropTypes.object
, category: PropTypes.string.isRequired
, filter: PropTypes.object.isRequired
, file: PropTypes.object
, images: PropTypes.array
, noteNumber: PropTypes.number.isRequired
, itemsNumber: PropTypes.number.isRequired
};

const barHeightSmUp     = 64;
const barHeightSmDown   = 56;
const rowHeight         = 62
const editHeightSmDown  = `calc(100vh - ${barHeightSmDown}px - ${rowHeight}px)`;
const editHeightSmUp    = `calc(100vh - ${barHeightSmUp  }px - ${rowHeight}px)`;
const styles = theme => ({
  noteEdit: { display: 'flex', flexDirection: 'column', height: editHeightSmDown
            , [theme.breakpoints.up('sm')]: { height: editHeightSmUp }}
});
export default withStyles(styles)(ClosedEdit);
