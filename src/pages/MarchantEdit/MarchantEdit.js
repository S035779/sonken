import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';
import RssForms from 'Components/RssForms/RssForms';
import RssView from 'Components/RssView/RssView';
//import RssItemList from 'Components/RssItemList/RssItemList';

class MarchantEdit extends React.Component {
  render() {
    const { classes, note } = this.props
    if(!note || !note.id) return null;
    return <div className={classes.noteEdit}>
      <div className={classes.forms}>
        <RssForms note={note}>
          <div className={classes.view}>
            <RssView note={note} />
          </div>
        </RssForms>
      </div>
      <div className={classes.list}>
      {/*
        <RssItemList />
      */}
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
, view:     { border: '1px solid #CCC', height: rowHeight * 4
            , flex: '1 1 auto', overflow: 'auto'
            , position: 'relative'
            , padding: '20px 10px 10px 10px'
            , '&:before': {
              content: '"Preview"', display: 'inline-block'
              , position: 'absolute', top: 0, left: 0
              , backgroundColor: '#F5F5F5'
              , padding: '5px 10px', fontSize: '12px'
              , borderRight: '1px solid #CCC'
              , borderBottom: '1px solid #CCC' }}
, list:     {}
});
MarchantEdit.displayName= 'MarchantEdit';
MarchantEdit.defaultProps = { note: null };
MarchantEdit.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(MarchantEdit);
