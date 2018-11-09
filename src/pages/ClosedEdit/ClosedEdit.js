import React          from 'react';
import PropTypes      from 'prop-types';
//import std            from 'Utilities/stdutils';

import { withStyles } from '@material-ui/core/styles';
import ClosedForms    from 'Components/ClosedForms/ClosedForms';

class ClosedEdit extends React.Component {
  render() {
    //std.logInfo(ClosedEdit.displayName, 'Props', this.props);
    const { classes, user, note, category, filter, file, images } = this.props
    if(!note || !note._id) return null;
    const itemNumber = note.attributes ? note.attributes.item.total : 0;
    const perPage = note.attributes ? note.attributes.item.count : 0;
    const cntSold = note.attributes ? note.attributes.sold.total : 0;
    const cntArchive = note.attributes ? note.attributes.archive.total : 0;
    const loadingDownload = itemNumber !== cntSold;
    const loadingImages = itemNumber !== cntArchive;
    return <div className={classes.noteEdit}>
        <ClosedForms user={user} note={note} category={category} itemFilter={filter} itemNumber={itemNumber}
          perPage={perPage} loadingImages={loadingImages} loadingDownload={loadingDownload} file={file} images={images}/>
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
, images: PropTypes.object
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
