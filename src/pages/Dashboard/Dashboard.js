import * as R                   from 'ramda';
import React                    from 'react';
import PropTypes                from 'prop-types';
import { Redirect }             from 'react-router-dom';
import { renderRoutes }         from 'react-router-config';
import { Container }            from 'flux/utils';
import NoteAction               from 'Actions/NoteAction';
import { getStores, getState }  from 'Stores';
import std                      from 'Utilities/stdutils';
import Spinner                  from 'Utilities/Spinner';

import { withStyles }           from '@material-ui/core/styles';
import RssSearch                from 'Components/RssSearch/RssSearch';
import RssButtons               from 'Components/RssButtons/RssButtons';
import RssList                  from 'Components/RssList/RssList';

class Dashboard extends React.Component {
  static getStores() {
    return getStores(['dashboardStore']);
  }

  static calculateState() {
    return getState('dashboardStore');
  }

  static prefetch(options) {
    const { user, category } = options;
    if(!user) return null;
    std.logInfo(Dashboard.displayName, 'prefetch', options);
    return Promise.all([
        NoteAction.presetUser(user)
      , NoteAction.prefetchNotes(user, category, 0, 20)
      , NoteAction.prefetchCategorys(user, category, 0, 20)
      ]);
  }

  componentDidMount() {
    this.spn = Spinner.of('app');
    const { match } = this.props;
    const { isAuthenticated, user, page } = this.state;
    if(isAuthenticated) {
      const skip = (page.number - 1) * page.perPage;
      const limit = page.perPage;
      const category = match.params.category || 'marchant';
      this.spn.start();
      std.logInfo(Dashboard.displayName, 'fetch', category);
      Promise.all([
        NoteAction.fetchNotes(user, category, skip, limit)
      , NoteAction.fetchCategorys(user, category, skip, limit)
      ]).then(() => this.spn.stop());
    }
  }

  componentWillUnmount() {
    this.spn.stop();
  }

  componentWillReceiveProps(nextProps) {
    const { user, page } = this.state;
    const nextCategory = nextProps.match.params.category;
    const prevCategory = this.props.match.params.category;
    if(user && (nextCategory !== prevCategory)) {
      const skip = (page.number - 1) * page.perPage;
      const limit = page.perPage;
      this.spn.start();
      std.logInfo(Dashboard.displayName, 'update', nextCategory);
      Promise.all([
        NoteAction.fetchNotes(user, nextCategory, skip, limit)
      , NoteAction.fetchCategorys(user, nextCategory, skip, limit)
      ]).then(() => this.spn.stop());
    }
  }

  filterNotes(notes, category, categoryId) {
    const isCategory = obj => obj.category === category;
    const isCategoryId = obj => obj.categoryIds ? obj.categoryIds.some(id => id === categoryId) : false;
    const isNonCategoryId = obj => obj.categoryIds ? obj.categoryIds.length === 0 : true;
    const isFavorite = obj => obj.items ? obj.items.some(obj => obj.starred) : false;
    if(!notes) return [];
    switch(categoryId) {
      case 'all':
        return notes.filter(isCategory);
      case 'none':
        return notes.filter(isCategory).filter(isNonCategoryId);
      case 'favorite':
        return notes.filter(isCategory).filter(isFavorite);
      default:
        return notes.filter(isCategory).filter(isCategoryId);
    }
  }

  getTitleName(category) {
    switch(category) {
      case 'marchant':
        return '商品RSS';
      case 'sellers':
        return '出品者RSS';
      case 'closedmarchant':
        return '落札相場';
      case 'closedsellers':
        return '落札履歴';
      case 'bids':
        return '入札リスト';
      case 'trade':
        return '取引チェック';
    }
  }

  render() {
    //std.logInfo(Dashboard.displayName, 'State', this.state);
    //std.logInfo(Dashboard.displayName, 'Props', this.props);
    const { classes, match, route, location } = this.props;
    const { isAuthenticated, user, notes, page, ids, filter, file, images, categorys, profile, preference } = this.state;
    const _id = match.params.id;
    const category = match.params.category || 'marchant';
    const title = this.getTitleName(category);
    const categoryId = location.state && location.state.categoryId ? location.state.categoryId : 'all';
    const _notes = this.filterNotes(notes, category, categoryId);
    const _note = _notes.find(obj => obj._id === _id);
    const __note = R.head(_notes);
    const noteNumber = __note && __note.note_attributes && __note.note_attributes.note ? __note.note_attributes.note.total : 0; 
    return isAuthenticated
      ? ( <div className={classes.root}>
          <RssSearch user={user} title={title} category={category} categorys={categorys} note={_note} file={file}
            notePage={page} noteNumber={noteNumber} profile={profile} preference={preference} />
          <div className={classes.body}>
            <div className={classes.noteList}>
              <RssButtons user={user} category={category} notes={_notes} file={file} selectedNoteId={ids} itemFilter={filter} noteNumber={noteNumber} />
              <RssList user={user} title={title} notes={_notes} categorys={categorys} categoryId={categoryId} selectedNoteId={ids}
                notePage={page}/>
            </div>
            <div className={classes.noteEdit}>
              { route.routes ? renderRoutes(route.routes, { user, note: _note, category, filter, file, images }) : null }
            </div>
          </div>
        </div> )
      : ( <Redirect to={{ pathname: '/login/authenticate', state: { from: location }}}/> );
  }
}
Dashboard.displayName = 'Dashboard';
Dashboard.defaultProps = {};
Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
, match: PropTypes.object.isRequired
, route: PropTypes.object.isRequired
, location: PropTypes.object.isRequired
};

const barHeightSmUp     = 64;
const barHeightSmDown   = 56;
const listWidth         = 400;
const searchHeight      = 62;
const noteHeightSmUp    = `calc(100vh - ${barHeightSmUp}px - ${searchHeight}px)`;
const noteHeightSmDown  = `calc(100vh - ${barHeightSmDown}px - ${searchHeight}px)`;
const styles = theme => ({
  root:     { display: 'flex', flexDirection: 'column' }
, body:     { display: 'flex', flexDirection: 'row' }
, noteList: { width: listWidth, minWidth: listWidth, height: noteHeightSmDown, [theme.breakpoints.up('sm')]: { height: noteHeightSmUp }}
, noteEdit: { flex: 1 }
});
export default withStyles(styles)(Container.create(Dashboard));
