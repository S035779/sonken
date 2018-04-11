import React          from 'react';
import PropTypes      from 'prop-types';

import { withStyles } from 'material-ui/styles';
import RssForms       from 'Components/RssForms/RssForms';
import RssView        from 'Components/RssView/RssView';

class MarchantEdit extends React.Component {
  render() {
    const { classes, user, note } = this.props
    if(!note || !note._id) return null;
    return <div className={classes.noteEdit}>
      <div className={classes.forms}>
        <RssForms
          user={user}
          note={note}>
          <div className={classes.view}>
            <RssView note={note}/>
          </div>
        </RssForms>
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
, forms:    { overflow: 'scroll' }
, view:     { position: 'relative', height: rowHeight * 4, overflow: 'auto'
            , border: '1px solid #CCC', padding: '20px 10px 10px 10px'
            , '&:before': { position: 'absolute', top: 0, left: 0
              , display: 'inline-block'
              , borderRight: '1px solid #CCC'
              , borderBottom: '1px solid #CCC'
              , padding: '5px 10px'
              , content: '"Preview"', fontSize: '12px'
              , backgroundColor: '#F5F5F5' }}
});
MarchantEdit.displayName= 'MarchantEdit';
MarchantEdit.defaultProps = { note: null };
MarchantEdit.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(MarchantEdit);
