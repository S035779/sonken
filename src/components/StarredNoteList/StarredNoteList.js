import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import { AccountCircle } from 'material-ui-icons';

class StarredNoteList extends React.Component {
  renderList(note, classes) {
    return <li className={classes.item}key={note.id}>
      <Link to={`/notes/${note.id}`} className={classes.link}>
      <div className={classes.title}>{note.title}</div>
      <div className={classes.meta}>
        <span className={classes.author}>
          <AccountCircle className={classes.icon} />{note.user}
        </span>
        <span className={classes.updated}>{note.updated}</span>
      </div>
      </Link>
    </li>;
  }

  render() {
    const { classes, notes } = this.props;
    const renderList = notes.map(note => this.renderList(note, classes));
    return <div className={classes.root}>
      <ul className={classes.list}>{renderList}</ul>
    </div>;
  }
};
const styles = theme => ({
  root:     {},
  list:     { margin: '10px 0', padding: 0, listStyle: 'none'
            , borderTop:    '1px solid #CCC' },
  item:     { borderBottom: '1px solid #CCC' },
  link:     { display: 'block', color: '#333', padding: '20px 15px'
            , textDecoration: 'none'
            , borderLeft: '8px solid transparent'
            , '&:hover': {
              borderLeftColor: '#2673E8', background: '#F5F5F5' }},
  title:    { fontWeight: 'bold', fontSize: '20px' },
  meta:     { fontSize: '13px', marginTop: '10px' },
  author:   { display: 'inline-block', marginRight: '15px' },
  icon:     { margin: theme.spacing.unit, verticalAlign: 'middle' },
  updated:  { color: '#666' }
});
StarredNoteList.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(StarredNoteList);
