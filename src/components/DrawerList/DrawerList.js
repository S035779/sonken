import React            from 'react';
import PropTypes        from 'prop-types'
import { withRouter }   from 'react-router-dom';
import classNames       from 'classnames';
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { Divider, List, Avatar, IconButton, Badge }
                        from 'material-ui';
import { ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction }
                        from 'material-ui/List';
import { Collapse }     from 'material-ui/transitions';
import { LocalMall, People, Timeline, Gavel, ArrowDropUp, ArrowDropDown
, AccountBox, BlurOn, SettingsApplications }
                        from 'material-ui-icons';
import LoginProfile     from 'Components/LoginProfile/LoginProfile';
import LoginPreference  from 'Components/LoginPreference/LoginPreference';
import RssEditDialog    from 'Components/RssEditDialog/RssEditDialog';

class DrawerList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openUser:         false
    , openMarchant:     true
    , openSellers:      true
    , isProfile:        false
    , isPreference:     false
    , isEditMarchant:   false 
    , isEditSellers:    false 
    , dragged:          false
    , dropZoneEntered:  false
    , dragSrcEl:        null
    , dragDstEl:        null
    , categorys:        props.categorys
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(DrawerList.displayName, 'Props', nextProps);
    const { categorys } = nextProps;
    this.setState({ categorys });
  }

  handleClickButton(name) {
    switch(name) {
      case 'title':
        this.props.history.push('/');
        break;
      case 'marchant':
        this.setState({
          openMarchant: true
        , openSellers:  false
        , openUser:     false
        });
        this.props.history.push('/marchant');
        break;
      case 'sellers':
        this.setState({
          openMarchant: false
        , openSellers:  true
        , openUser:     false
        });
        this.props.history.push('/sellers');
        break;
      case 'bids':
        this.setState({
          openMarchant: false
        , openSellers:  false
        , openUser:     false
        });
        this.props.history.push('/bids');
        break;
      case 'trade':
        this.setState({
          openMarchant: false
        , openSellers:  false
        , openUser:     false
        });
        this.props.history.push('/trade');
        break;
      case 'user':
        this.setState({
          openMarchant: false
        , openSellers:  false
        , openUser:     true
        });
        break;
      case 'isPreference':
      case 'isProfile':
      case 'isEditMarchant':
      case 'isEditSellers':
        this.setState({ [name]: true });
        break;
    }
  }

  handleCategoryList(category, categoryId) {
    //std.logInfo(DrawerList.displayName, category, categoryId);
    this.props.history.push('/' + category, { categoryId })
  }

  handleCloseDialog(name, event) {
    std.logInfo(DrawerList.displayName, 'handleCloseDialog', name);
    this.setState({ [name]: false });
  }

  handleDragStart(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragStart', name)
    event.dataTransfer.effectAllowed = 'move';
    const dragSrcEl
      = this.state.categorys.find(obj => obj.subcategory === name);
    event.dataTransfer.setData('text/plain', dragSrcEl.subcategoryId);
    this.setState({ dragged: true, dragSrcEl: dragSrcEl });
  }

  handleDragOver(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragOver', name)
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  handleDragEnter(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragEnter', name)
    const dragDstEl
      = this.state.categorys.find(obj => obj.subcategory === name);
    this.setState({ dropZoneEntered: true, dragDstEl });
  }

  handleDragLeave(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragLeave', name)
    this.setState({ dropZoneEntered: false });
  }

  handleDrop(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragDrop', name)
    event.stopPropagation();
    const { profile } = this.props;
    const { dragSrcEl, categorys } = this.state;
    const dragDstEl
      = this.state.categorys.find(obj => obj.subcategory === name);
    if(dragSrcEl.subcategoryId !== dragDstEl.subcategoryId) {
      dragSrcEl.subcategoryId = dragDstEl.subcategoryId;
      dragDstEl.subcategoryId = event.dataTransfer.getData('text/plain');
      //const _categorys = categorys.map(obj => {
      //  if(dragSrcEl.subcategory === obj.subcategory) return dragSrcEl;
      //  if(dragDstEl.subcategory === obj.subcategory) return dragDstEl;
      //  return obj;
      //});
      //this.setState({ dragSrcEl, dragDstEl, categorys: _categorys });
      LoginAction.updateCategory(profile.user, dragDstEl._id, {
        category:       dragDstEl.category
      , subcategory:    dragDstEl.subcategory
      , subcategoryId:  dragDstEl.subcategoryId })
        .then(()    =>
          LoginAction.updateCategory(profile.user, dragSrcEl._id, {
            category:       dragSrcEl.category
          , subcategory:    dragSrcEl.subcategory
          , subcategoryId:  dragSrcEl.subcategoryId }))
        .then(()    => this.setState({ dragSrcEl, dragDstEl }))
        .catch(err  => {
          std.logError(DrawerList.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
        })
      ;
    }
  }

  handleDragEnd(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragEnd', name)
    this.setState({ dropZoneEntered: false, dragged: false });
  }

  renderCategoryList(index, category, subcategory, categoryId, release) {
    const { classes } = this.props;
    const { dragged, dropZoneEntered, dragSrcEl, dragDstEl } = this.state;
    const isDragDstEl
      = dragDstEl && dragDstEl.subcategory === subcategory;
    const isDragSrcEl
      = dragSrcEl && dragSrcEl.subcategory === subcategory;
    const isRelease = release > 0;
    const textClass = {
      primary:        classes.textPrimary
    , secondary:      classes.textSecondary
    };
    const badgeClass = {
      colorPrimary:   classes.badgePrimary
    , colorSecondary: classes.badgeSecondary
    , colorError:     classes.badgeError
    , badge:          classNames(!isRelease && classes.nonbadge)
    };
    return <ListItem dense button key={index}
        draggable="true"
        onDragOver={this.handleDragOver.bind(this, subcategory)}
        onDragEnter={this.handleDragEnter.bind(this, subcategory)}
        onDragLeave={this.handleDragLeave.bind(this, subcategory)}
        onDragStart={this.handleDragStart.bind(this, subcategory)}
        onDragEnd={this.handleDragEnd.bind(this, subcategory)}
        onDrop={this.handleDrop.bind(this, subcategory)}
        onClick={this.handleCategoryList.bind(this, category, categoryId)}
        className={classNames(
            classes.draggable
          , isDragSrcEl && dragged && classes.dragged
          , isDragDstEl && dropZoneEntered && classes.dragOver
        )}
      >
        <ListItemIcon>
          <Badge
            badgeContent={release}
            color="error"
            classes={badgeClass}
          >
            <Avatar className={classes.avatar}>
              {subcategory.substr(0,1)}
            </Avatar>
          </Badge>
        </ListItemIcon>
        <ListItemText primary={subcategory} classes={textClass} />
      </ListItem>;
  }

  renderNonCategoryList(index, category, subcategory, release) {
    const { classes } = this.props;
    const isRelease = release > 0;
    const textClass = {
      primary:        classes.textPrimary
    , secondary:      classes.textSecondary
    };
    const badgeClass = {
      colorPrimary:   classes.badgePrimary
    , colorSecondary: classes.badgeSecondary
    , colorError:     classes.badgeError
    , badge:          classNames(!isRelease && classes.nonbadge)
    };
    return <ListItem dense button key={index}
        onClick={this.handleCategoryList.bind(this, category, 'none')}
      >
        <ListItemIcon>
          <Badge
            badgeContent={release}
            color="error"
            classes={badgeClass}
          >
            <Avatar className={classes.avatar}>
              {subcategory.substr(0,1)}
            </Avatar>
          </Badge>
        </ListItemIcon>
        <ListItemText primary={subcategory} classes={textClass} />
      </ListItem>;
  }

  renderFavoriteList(index, category, subcategory, release) {
    const { classes } = this.props;
    const isRelease = release > 0;
    const textClass = {
      primary:        classes.textPrimary
    , secondary:      classes.textSecondary
    };
    const badgeClass = {
      colorPrimary:   classes.badgePrimary
    , colorSecondary: classes.badgeSecondary
    , colorError:     classes.badgeError
    , badge:          classNames(!isRelease && classes.nonbadge)
    };
    return <ListItem dense button key={index}
        onClick={this.handleCategoryList.bind(this, category, 'favorite')}
      >
        <ListItemIcon>
          <Badge
            badgeContent={release}
            color="error"
            classes={badgeClass}
          >
            <Avatar className={classes.avatar}>
              {subcategory.substr(0,1)}
            </Avatar>
          </Badge>
        </ListItemIcon>
        <ListItemText primary={subcategory} classes={textClass} />
      </ListItem>;
  }

  renderListItems() {
    const { classes, open, profile } = this.props;
    const { isEditMarchant, isEditSellers, openMarchant, openSellers
      , categorys } = this.state;
    const textClass
      = { primary: classes.textPrimary
        , secondary: classes.textSecondary };
    const _categorys
      = category => categorys
        .filter(obj => obj._id !== '9999')
        .filter(obj => obj._id !== '9998')
        .filter(obj => category === obj.category)
        .sort((a, b) =>
          parseInt(a.subcategoryId, 16) < parseInt(b.subcategoryId, 16)
            ? 1  :
          parseInt(a.subcategoryId, 16) > parseInt(b.subcategoryId, 16)
            ? -1 : 0
        );
    const _noncategorys
      = category => categorys
        .filter(obj => obj._id === '9999')
        .filter(obj => category === obj.category);
    const _favorites
      = category => categorys
        .filter(obj => obj._id === '9998')
        .filter(obj => category === obj.category);
    const categoryList
      = category => categorys ? _categorys(category) : null;
    const renderCategoryList = category => categorys
      ? _categorys(category)
        .map((obj, index) => 
          this.renderCategoryList(
            index
          , category
          , obj.subcategory
          , obj._id
          , obj.newRelease && obj.newRelease.true
            ? obj.newRelease.true : 0
          )
        )
      : null;
    const renderNonCategoryList = category => categorys
      ? _noncategorys(category)
        .map((obj, index) =>
          this.renderNonCategoryList(
            index
          , category
          , obj.subcategory
          , obj.newRelease && obj.newRelease.true
            ? obj.newRelease.true : 0
          )
        )
      : null;
    const renderFavoriteList = category => categorys
      ? _favorites(category)
        .map((obj, index) =>
          this.renderFavoriteList(
            index
          , category
          , obj.subcategory
          , obj.newRelease && obj.newRelease.true
            ? obj.newRelease.true : 0
          )
        )
      : null;
    return <div>
      <ListItem button
        onClick={this.handleClickButton.bind(this, 'marchant')}
      >
        <ListItemIcon>
          <LocalMall className={classes.icon} />
        </ListItemIcon>
        <ListItemText primary="商品RSS" classes={textClass} />
        {openMarchant
          ? <ArrowDropUp className={classes.icon} />
          : <ArrowDropDown className={classes.icon} />
        }
        {open
          ? <ListItemSecondaryAction>
              <IconButton
                onClick={
                  this.handleClickButton.bind(this, 'isEditMarchant')}>
                <SettingsApplications className={classes.setting} />
              </IconButton>
            </ListItemSecondaryAction>
          : null
        }
      </ListItem>
      <RssEditDialog
        user={profile.user}
        category="marchant"
        categorys={categoryList('marchant')}
        open={isEditMarchant}
        onClose={this.handleCloseDialog.bind(this, 'isEditMarchant')}
      />
      <Collapse in={openMarchant} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {renderFavoriteList('marchant')}
          {renderCategoryList('marchant')}
          {renderNonCategoryList('marchant')}
        </List>
      </Collapse>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'sellers')}>
        <ListItemIcon>
          <People className={classes.icon} />
        </ListItemIcon>
        <ListItemText primary="出品者RSS" classes={textClass} />
        {openSellers
          ? <ArrowDropUp className={classes.icon} />
          : <ArrowDropDown className={classes.icon} />
        }
        {open
          ? <ListItemSecondaryAction>
              <IconButton
                onClick={
                  this.handleClickButton.bind(this, 'isEditSellers')}>
                <SettingsApplications className={classes.setting} />
              </IconButton>
            </ListItemSecondaryAction>
          : null
        }
      </ListItem>
      <RssEditDialog
        user={profile.user}
        category="sellers"
        categorys={categoryList('sellers')}
        open={isEditSellers}
        onClose={this.handleCloseDialog.bind(this, 'isEditSellers')}
      />
      <Collapse in={openSellers} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {renderFavoriteList('sellers')}
          {renderCategoryList('sellers')}
          {renderNonCategoryList('sellers')}
        </List>
      </Collapse>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'bids')}>
        <ListItemIcon>
          <Timeline className={classes.icon} />
        </ListItemIcon>
        <ListItemText primary="入札リスト" classes={textClass} />
      </ListItem>
      <ListItem button 
        onClick={this.handleClickButton.bind(this, 'trade')}>
        <ListItemIcon>
          <Gavel className={classes.icon} />
        </ListItemIcon>
        <ListItemText primary="取引チェック" classes={textClass} />
      </ListItem>
    </div>;
  }
    
  renderUserListItems() {
    const { classes, profile, preference } = this.props;
    const { openUser, isProfile, isPreference } = this.state;
    const { name, user, kana, email, phone, plan } = profile;
    const textClass
      = { primary: classes.textPrimary
        , secondary: classes.textSecondary };
    return <div>
        <ListItem button 
          onClick={this.handleClickButton.bind(this, 'user')}>
          <ListItemIcon>
            <AccountBox className={classes.icon} />
          </ListItemIcon>
          <ListItemText primary={user} classes={textClass} />
          {openUser
            ? <ArrowDropUp className={classes.icon} />
            : <ArrowDropDown className={classes.icon} />
          }
        </ListItem>
        <Collapse in={openUser} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button>
              <ListItemIcon>
                <Avatar className={classes.avatar}>MP</Avatar>
              </ListItemIcon>
              <ListItemText primary="My Profile" classes={textClass} />
            </ListItem>
            <ListItem button
              onClick={this.handleClickButton.bind(this, 'isProfile')}>
              <ListItemIcon>
                <Avatar className={classes.avatar}>EP</Avatar>
              </ListItemIcon>
              <ListItemText primary="Edit Profile" classes={textClass} />
            </ListItem>
            <ListItem button
              onClick={this.handleClickButton.bind(this, 'isPreference')}>
              <ListItemIcon>
                <Avatar className={classes.avatar}>S</Avatar>
              </ListItemIcon>
              <ListItemText primary="Setting" classes={textClass} />
            </ListItem>
          </List>
          <LoginProfile
            open={isProfile}
            profile={profile}
            name={name}
            user={user}
            kana={kana}
            email={email}
            phone={phone}
            onClose={this.handleCloseDialog.bind(this, 'isProfile')}
          />
          <LoginPreference 
            open={isPreference}
            profile={profile}
            preference={preference}
            name={name}
            user={user}
            plan={plan}
            onClose={this.handleCloseDialog.bind(this, 'isPreference')}
          />
        </Collapse>
      </div>
    ;
  }
    
  renderTitleListItems() {
    const { classes } = this.props;
    const textClass
      = { primary: classes.title
        , secondary: classes.textSecondary };
    return <div>
      <ListItem button
        onClick={this.handleClickButton.bind(this, 'title')}>
        <ListItemIcon>
          <BlurOn className={classes.icon} />
        </ListItemIcon>
        <ListItemText primary="アルファOne" classes={textClass}/>
      </ListItem>
    </div>;
  }

  render() {
    const { classes } = this.props;
    const renderTitleListItems = this.renderTitleListItems();
    const renderListItems = this.renderListItems();
    const renderUserListItems = this.renderUserListItems();
    return <div>
      <div className={classes.header}>
        <List>{renderTitleListItems}</List>
      </div>
      <Divider />
      <List>{renderListItems}</List>
      <Divider />
      <List>{renderUserListItems}</List>
    </div>;
  }
};

const barHeightSmUp   = 64;//112;
const barHeightSmDown = 56;//104;
const primary_color   = '#477AF7';
const secondary_color = '#29CBEF';
const warning_color   = '#FEA634';
const success_color   = '#87CC16';
const danger_color    = '#FA404B';
const styles = theme => ({
  header: {
    height: barHeightSmDown
  , [theme.breakpoints.up('sm')]: { height: barHeightSmUp }
  }
, title: {
    fontSize: 24
  }
, icon: {
    color: theme.palette.common.white
  , marginRight: theme.spacing.unit *2
  }
, setting: {
    color: theme.palette.common.white
  }
, avatar: {
    color: theme.palette.common.white
  , background: 'inherit'
  , width: 24, height: 24, fontSize: 16
  }
, badge: {}
, nonbadge: {
    display: 'none'
  }
, badgePrimary: {
    backgroundColor: primary_color
  }
, badgeSecondary: {
    backgroundColor: secondary_color
  }
, badgeError: {
    backgroundColor: danger_color
  }
, textPrimary: {
    whiteSpace: 'nowrap'
  , color: theme.palette.common.white
  }
, textSecondary: {
    whiteSpace: 'nowrap'
  , color: theme.palette.common.white
  }
, title:  {
    whiteSpace: 'nowrap'
  , color: theme.palette.common.white
  , fontSize: 20
  }
, draggable:  { cursor: 'move' }
, dragged:    { opacity: 0.4 }
, dragOver:   { border: '1px dashed #FFF' }
});
DrawerList.displayName = 'DrawerList';
DrawerList.defaultProps = {};
DrawerList.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(DrawerList));
