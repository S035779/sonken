import React          from 'react';
import PropTypes      from 'prop-types';

import { withStyles } from 'material-ui/styles';
import { Typography } from 'material-ui';
import RssItemList    from 'Components/RssItemList/RssItemList';

class RssItems extends React.Component {
  render() {
    const { classes, user, note } = this.props;
    const items = note.items ? note.items : [];
    return <div className={classes.forms}>
      <div className={classes.header}>
        <Typography variant="title" noWrap
          className={classes.title}>{note.title}</Typography>
      </div>
      <div className={classes.noteList}>
        <RssItemList
          user={user}
          items={items} />
      </div>
    </div>;
  }
};

const barHeightSmDown   = 104;
const barHeightSmUp     = 112;
const searchHeight      = 62;
const filterHeight      = 62;
const listHeightSmDown  =
  `calc(100vh - ${barHeightSmDown}px - ${filterHeight}px- ${searchHeight}px)`;
const listHeightSmUp    =
  `calc(100vh - ${barHeightSmUp}px - ${filterHeight}px- ${searchHeight}px)`;
const columnHeight = 62;
const styles = theme => ({
  forms:        { display: 'flex', flexDirection: 'column' }
, noteList:     { width: '100%'
                , height: listHeightSmDown
                , [theme.breakpoints.up('sm')]: {
                  height: listHeightSmUp }}
, header:       { height: columnHeight, minHeight: columnHeight
                , boxSizing: 'border-box'
                , padding: '5px' }
, title:        { margin: theme.spacing.unit * 1.75 }
});
RssItems.displayName = 'RssItems';
RssItems.defaultProps = { note: null };
RssItems.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssItems);
