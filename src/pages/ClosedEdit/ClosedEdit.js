import React          from 'react';
import PropTypes      from 'prop-types';
//import std            from 'Utilities/stdutils';

import { withStyles } from '@material-ui/core/styles';
import ClosedForms    from 'Components/ClosedForms/ClosedForms';

class ClosedEdit extends React.Component {
  itemFilter(filter, item) {
    //std.logInfo(ClosedEdit.displayName, 'Item', item)
    const date      = new Date();
    const now       = new Date(item.bidStopTime);
    const start     = new Date(filter.aucStartTime);
    const stop      = new Date(filter.aucStopTime);
    const year      = date.getFullYear();
    const month     = date.getMonth();
    const day       = date.getDate();
    const lastWeek  = new Date(year, month, day-7);
    const twoWeeks  = new Date(year, month, day-14);
    const lastMonth = new Date(year, month-1, day);
    const today     = new Date(year, month, day);
    const isLastWeek  = lastWeek  <= now && now < today && item.sold >= 1;
    const isTwoWeeks  = twoWeeks  <= now && now < today && item.sold >= 2;
    const isLastMonth = lastMonth <= now && now < today && item.sold >= 3;
    const isAll = true;
    const isNow = start <= now && now <= stop;
    return filter.inAuction
      ? isNow
      : filter.allAuction
        ? isAll
        : filter.lastMonthAuction 
          ? isLastMonth
          : filter.twoWeeksAuction 
            ? isTwoWeeks
            : filter.lastWeekAuction 
              ? isLastWeek
              : true;
  }

  render() {
    //std.logInfo(ClosedEdit.displayName, 'State', this.state);
    //std.logInfo(ClosedEdit.displayName, 'Props', this.props);
    const { classes, user, note, category, filter, file } = this.props
    if(!note || !note._id) return null;
    const items = note.items ? note.items : [];
    const _items = items.filter(item => this.itemFilter(filter, item));
    const _note = Object.assign({}, note, { items: _items });
    const itemNumber = items.length;
    const perPage = _items.length;
    return <div className={classes.noteEdit}>
        <ClosedForms user={user} note={_note} category={category} itemFilter={filter} itemNumber={itemNumber}
          perPage={perPage} file={file} />
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
};

const barHeightSmUp     = 64;
const barHeightSmDown   = 56;
const rowHeight         = 62
const editHeightSmDown  =
  `calc(100vh - ${barHeightSmDown}px - ${rowHeight}px)`;
const editHeightSmUp    =
  `calc(100vh - ${barHeightSmUp  }px - ${rowHeight}px)`;
const styles = theme => ({
  noteEdit: { display: 'flex', flexDirection: 'column'
            , height: editHeightSmDown
            , [theme.breakpoints.up('sm')]: { height: editHeightSmUp }}
});
export default withStyles(styles)(ClosedEdit);
