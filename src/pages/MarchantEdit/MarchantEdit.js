import React          from 'react';
import PropTypes      from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import RssForms       from 'Components/RssForms/RssForms';
import RssView        from 'Components/RssView/RssView';

class MarchantEdit extends React.Component {
  render() {
    const { classes, user, note, category, file } = this.props
    if(!note || !note._id) return null;
    return <div className={classes.noteEdit}>
      <RssForms user={user} note={note} category={category} file={file}>
        <div className={classes.view}>
          <RssView note={note}/>
        </div>
      </RssForms>
    </div>;
  }
}
MarchantEdit.displayName= 'MarchantEdit';
MarchantEdit.defaultProps = { note: null };
MarchantEdit.propTypes = {
  classes: PropTypes.object.isRequired
, user: PropTypes.string.isRequired
, note: PropTypes.object
, category: PropTypes.string.isRequired
, file: PropTypes.object
};

const barHeightSmUp     = 64;
const barHeightSmDown   = 56;
const rowHeight         = 62
const editHeightSmDown  = `calc(100vh - ${barHeightSmDown}px - ${rowHeight}px)`;
const editHeightSmUp    = `calc(100vh - ${barHeightSmUp  }px - ${rowHeight}px)`;
const styles = theme => ({
  noteEdit: { display: 'flex', flexDirection: 'column'
            , height: editHeightSmDown
            , [theme.breakpoints.up('sm')]: { height: editHeightSmUp }}
, view:     { position: 'relative', height: rowHeight * 4
            , overflow: 'auto'
            , border: '1px solid #CCC', padding: '20px 10px 10px 10px'
            , '&:before': { position: 'absolute', top: 0, left: 0
              , display: 'inline-block'
              , borderRight: '1px solid #CCC'
              , borderBottom: '1px solid #CCC'
              , padding: '5px 10px'
              , content: '"Preview"', fontSize: '12px'
              , backgroundColor: '#F5F5F5' }}
});
export default withStyles(styles)(MarchantEdit);
