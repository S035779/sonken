import React          from 'react';
import PropTypes      from 'prop-types';
import std            from 'Utilities/stdutils';

import { withStyles } from 'material-ui/styles';
import ClosedForms    from 'Components/ClosedForms/ClosedForms';

class ClosedMarchantEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: {
        aucStartTime: std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
      , aucStopTime:  std.formatDate(new Date(), 'YYYY-MM-DDThh:mm')
      , allAuction: true
      , inAuction:  true
      , endAuction: true
      }
    };
  }

  itemFilter(filter, item) {
    const date      = new Date();
    const now       = new Date(item.aucStopTime);
    const start     = new Date(filter.aucStartTime);
    const stop      = new Date(filter.aucStopTime);
    const year      = date.getFullYear();
    const month     = date.getMonth();
    const day       = date.getDate();
    const today     = new Date(year, month, day+1);
    const yesterday = new Date(year, month, day);
    const isDay = yesterday <= now && now < today;
    const isAll = true;
    const isNow = start <= now && now <= stop;
    return filter.inAuction
      ? isNow
      : filter.endAuction && filter.allAuction
        ? isAll
        : filter.endAuction
          ? isDay
          : true;
  }

  render() {
    const { classes, user, note, category, file } = this.props
    const { filter } = this.state;
    if(!note || !note._id) return null;
    const items = note.items ? note.items.filter(item => this.itemFilter(filter, item)) : [];
    const _note = Object.assign(note, { items });
    return <div className={classes.noteEdit}>
      <div classes={classes.forms}>
        <ClosedForms
          user={user}
          note={note}
          category={category}
          itemFilter={filter} 
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
, forms:    { overflow: 'scroll' }
});
ClosedMarchantEdit.displayName= 'ClosedMarchantEdit';
ClosedMarchantEdit.defaultProps = { note: null };
ClosedMarchantEdit.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(ClosedMarchantEdit);
