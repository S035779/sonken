import React from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { Container } from 'flux/utils';
import NoteAction from 'Actions/NoteAction';
import { getStores, getState } from 'Stores';

import { withStyles } from 'material-ui/styles';
import RssSearch from 'Components/RssSearch/RssSearch';
import RssButtons from 'Components/RssButtons/RssButtons';
import RssList from 'Components/RssList/RssList';

class Dashboard extends React.Component {
  static getStores() {
    return getStores(['dashboardStore']);
  }

  static calculateState() {
    return getState('dashboardStore');
  }

  static prefetch(props) {
    return NoteAction.fetchNotes();
  }

  componentDidMount() {
    NoteAction.fetchMyNotes();
    //Dashboard.prefetch(this.props);
  }

  handleSubmit(url, category) {
    NoteAction.create({ url, category });
  }

  handlePages(pages, page) {
    NoteAction.page({ pages, page })
  }

  handleUpload(filename) {
    NoteAction.upload({ filename });
  }

  handleDownload(file) {
    NoteAction.download({ filename });
  }

  handleSelectAll() {
    NoteAction.select();
  }

  handleSelectRead() {
    NoteAction.read();
  }

  handleSelectDelete() {
    NoteAction.delete(id);
  }

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  }

  render() {
    this.logInfo('render', this.state);
    const { classes, match, route } = this.props;
    const { notes, pages, page } = this.state;
    const itemId = Number(match.params.id);
    const noteCategory =
      match.params.category ? match.params.category : 'marchant';
    const items =
      notes ? notes.filter(note => note.category === noteCategory) : [];
    const item = notes.find(note => note.id === itemId);
    return <div className={classes.root}>
        <RssSearch
          category={noteCategory}
          pages={pages} page={page} 
          onSubmit={this.handleSubmit.bind(this)}
          onPages={this.handlePages.bind(this)}
          onUpload={this.handleUpload.bind(this)}
          onDownload={this.handleDownload.bind(this)} />
      <div className={classes.body}>
        <div className={classes.noteList}>
          <RssButtons
            onRead={this.handleSelectRead.bind(this)}
            onDelete={this.handleSelectDelete.bind(this)}
            onSelect={this.handleSelectAll.bind(this)} />
          <RssList notes={items} selectedNoteId={itemId}/>
        </div>
        <div className={classes.noteEdit}>
          {
            route.routes
            ? renderRoutes(route.routes, { note: item })
            : null
          }
        </div>
      </div>
    </div>;
  }
};

const barHeightSmUp     = 112;
const barHeightSmDown   = 104;
const listWidth         = 400;
const searchHeight      = 62;
const noteHeightSmUp    = 
  `calc(100vh - ${barHeightSmUp}px - ${searchHeight}px)`;
const noteHeightSmDown  =
  `calc(100vh - ${barHeightSmDown}px - ${searchHeight}px)`;
const styles = theme => ({
  root:     { display: 'flex', flexDirection: 'column' }
, body:     { display: 'flex', flexDirection: 'row' }
, noteList: { width: listWidth, minWidth: listWidth
            , height: noteHeightSmDown
            , [theme.breakpoints.up('sm')]: { height: noteHeightSmUp }}
, noteEdit: { flex: 1 }
});
Dashboard.displayName = 'Dashboard';
Dashboard.defaultProps = {};
Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Container.create(Dashboard));
