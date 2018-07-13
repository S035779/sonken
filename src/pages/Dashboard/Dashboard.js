import React            from 'react';
import PropTypes        from 'prop-types';
import { Redirect }     from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { Container }    from 'flux/utils';
import NoteAction       from 'Actions/NoteAction';
import { getStores, getState }
                        from 'Stores';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import RssSearch        from 'Components/RssSearch/RssSearch';
import RssButtons       from 'Components/RssButtons/RssButtons';
import RssList          from 'Components/RssList/RssList';

class Dashboard extends React.Component {
  static getStores() {
    return getStores(['dashboardStore']);
  }

  static calculateState() {
    return getState('dashboardStore');
  }

  static prefetch(options) {
    if(!options.user) return null;
    std.logInfo(Dashboard.displayName, 'prefetch', options);
    return NoteAction.presetUser(options.user)
      .then(() => NoteAction.prefetchNotes(options.user))
      .then(() => NoteAction.prefetchCategorys(options.user))
    ;
  }

  componentDidMount() {
    if(!this.state.user) return;
    std.logInfo(Dashboard.displayName, 'fetch', 'Dashboard');
    NoteAction.fetchNotes(this.state.user)
      .then(() => NoteAction.fetchCategorys(this.state.user))
    ;
  }

  getPageNumber(number, page) {
    return number < page.perPage ? number : page.perPage;
  }

  filterNotes(notes, category, categoryId) {
    const isCategory
      = obj => obj.category === category;
    const isCategoryId
      = obj => obj.categoryIds
        ? obj.categoryIds.some(id => id === categoryId) : false;
    const isNonCategoryId
      = obj => obj.categoryIds
        ? obj.categoryIds.length === 0 : true;
    const isFavorite
      = obj => obj.items
        ? obj.items.some(obj => obj.starred) : false;
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

  getTitleName(location) {
    let category = location.pathname.split('/')[1];
    switch(category) {
      case 'marchant':
        category='商品RSS';
        break;
      case 'sellers':
        category='出品者RSS';
        break;
      case 'closedmarchant':
        category='落札相場';
        break;
      case 'closedsellers':
        category='落札履歴';
        break;
      case 'bids':
        category='入札リスト';
        break;
      case 'trade':
        category='取引チェック';
        break;
      default:
        category='商品RSS';
        break;
    }
    return category;
  }

  render() {
    //std.logInfo(Dashboard.displayName, 'State', this.state);
    //std.logInfo(Dashboard.displayName, 'Props', this.props);
    const { classes, match, route, location } = this.props;
    const { isAuthenticated, user, notes, page, ids, filter, file
      , categorys } = this.state;
    if(!isAuthenticated) 
      return (<Redirect to={{ pathname: '/login/authenticate', state: { from: location }}}/>);
    const title = this.getTitleName(location);
    const _id = match.params.id;
    const category = match.params.category ? match.params.category : 'marchant';
    const categoryId = location.state && location.state.categoryId ? location.state.categoryId : 'all';
    const _notes = this.filterNotes(notes, category, categoryId);
    const note = notes.find(obj => obj._id === _id);
    const number = _notes.length;
    _notes.length = this.getPageNumber(number, page);
    return <div className={classes.root}>
        <RssSearch
          user={user}
          title={title}
          category={category}
          categorys={categorys}
          note={note}
          file={file}
          noteNumber={number} notePage={page} />
      <div className={classes.body}>
        <div className={classes.noteList}>
          <RssButtons
            user={user}
            notes={_notes}
            selectedNoteId={ids} />
          <RssList
            user={user}
            title={title}
            notes={_notes}
            categorys={categorys}
            categoryId={categoryId}
            selectedNoteId={ids}
            notePage={page}/>
        </div>
        <div className={classes.noteEdit}>
        {route.routes ? renderRoutes(route.routes
          , { user, note, category, filter, file }) : null}
        </div>
      </div>
    </div>;
  }
};

const barHeightSmUp     = 64;//112;
const barHeightSmDown   = 56;//104;
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
