import React            from 'react';
import PropTypes        from 'prop-types'
import { withRouter }   from 'react-router-dom';
import classNames       from 'classnames';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { Divider, List, Avatar, IconButton }
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
    , openMarchant:     false
    , openSellers:      false
    , isProfile:        false
    , isPreference:     false
    , isEditMarchant:   false 
    , isEditSellers:    false 
    , dragged:          false
    , dropZoneEntered:  false
    , dragSrcEl:        null
    , dragDstEl:        null
    , categorys:        [
        { main: 'marchant', sub: '01category', index: 1000 }
      , { main: 'marchant', sub: '02category', index: 1100 }
      , { main: 'marchant', sub: '03category', index: 1200 }
      , { main: 'marchant', sub: '04category', index: 1300 }
      , { main: 'marchant', sub: '05category', index: 1400 }
      , { main: 'sellers', sub: '06category', index: 2000 }
      , { main: 'sellers', sub: '07category', index: 2100 }
      , { main: 'sellers', sub: '08category', index: 2200 }
      , { main: 'sellers', sub: '09category', index: 2300 }
      , { main: 'sellers', sub: '10category', index: 2400 }
      ]
    };
  }

  handleClickButton(name, event) {
    switch(name) {
      case 'title':
        this.props.history.push('/');
        break;
      case 'marchant':
        this.setState({ openMarchant: !this.state.openMarchant });
        this.props.history.push('/marchant');
        break;
      case 'sellers':
        this.setState({ openSellers: !this.state.openSellers });
        this.props.history.push('/sellers');
        break;
      case 'bids':
        this.props.history.push('/bids');
        break;
      case 'trade':
        this.props.history.push('/trade');
        break;
      case 'user':
        this.setState({ openUser: !this.state.openUser });
        break;
      case 'isPreference':
      case 'isProfile':
      case 'isEditMarchant':
      case 'isEditSellers':
        this.setState({ [name]: true });
        break;
    }
  }

  handleCloseDialog(name, event) {
    std.logInfo(DrawerList.displayName, 'handleCloseDialog', name);
    this.setState({ [name]: false });
  }

  handleDragStart(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragStart', name)
    event.dataTransfer.effectAllowed = 'move';
    const dragSrcEl = this.state.categorys.find(obj => obj.sub === name);
    event.dataTransfer.setData('text/plain', dragSrcEl.index);
    this.setState({ dragged: true, dragSrcEl: dragSrcEl });
  }

  handleDragOver(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragOver', name)
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  handleDragEnter(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragEnter', name)
    const dragDstEl = this.state.categorys.find(obj => obj.sub === name);
    this.setState({ dropZoneEntered: true, dragDstEl });
  }

  handleDragLeave(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragLeave', name)
    this.setState({ dropZoneEntered: false });
  }

  handleDrop(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragDrop', name)
    event.stopPropagation();
    const { dragSrcEl, categorys } = this.state;
    const dragDstEl = this.state.categorys.find(obj => obj.sub === name);
    if(dragSrcEl.index !== dragDstEl.index) {
      dragSrcEl.index = dragDstEl.index;
      dragDstEl.index = Number(event.dataTransfer.getData('text/plain'));
      const _categorys = categorys.map(obj => {
        if(dragSrcEl.sub === obj.sub) return dragSrcEl;
        if(dragDstEl.sub === obj.sub) return dragDstEl;
        return obj;
      });
      this.setState({ dragSrcEl, dragDstEl, categorys: _categorys });
    }
  }

  handleDragEnd(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragEnd', name)
    this.setState({ dropZoneEntered: false, dragged: false });
  }

  renderCategoryList(index, name) {
    const { classes } = this.props;
    const { dragged, dropZoneEntered, dragSrcEl, dragDstEl } = this.state;
    const isDragDstEl = dragDstEl && dragDstEl.sub === name;
    const isDragSrcEl = dragSrcEl && dragSrcEl.sub === name;
    const textClass =
      { primary: classes.primary, secondary: classes.secondary };
    return <ListItem button key={index}
        draggable="true"
        onDragOver={this.handleDragOver.bind(this, name)}
        onDragEnter={this.handleDragEnter.bind(this, name)}
        onDragLeave={this.handleDragLeave.bind(this, name)}
        onDragStart={this.handleDragStart.bind(this, name)}
        onDragEnd={this.handleDragEnd.bind(this, name)}
        onDrop={this.handleDrop.bind(this, name)}
        className={classNames(
            classes.draggable
          , isDragSrcEl && dragged && classes.dragged
          , isDragDstEl && dropZoneEntered && classes.dragOver
        )}
      >
        <ListItemIcon>
          <Avatar className={classes.avatar}>
            {name.substr(0,2)}
          </Avatar>
        </ListItemIcon>
        <ListItemText primary={name} classes={textClass}
        />
      </ListItem>;
  }

  renderListItems() {
    const { classes, open } = this.props;
    const { isEditMarchant, isEditSellers, openMarchant, openSellers
      , categorys } = this.state;
    const textClass =
      { primary: classes.primary, secondary: classes.secondary };
    const renderCategoryList = category => categorys
      .filter(obj => category === obj.main)
      .sort((a, b) => a.index < b.index ? -1 : a.index > b.index ? 1 : 0)
      .map((c, i) => this.renderCategoryList(i, c.sub));
    return <div>
      <ListItem button
        onClick={this.handleClickButton.bind(this, 'marchant')}>
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
                <SettingsApplications className={classes.icon} />
              </IconButton>
            </ListItemSecondaryAction>
          : null
        }
      </ListItem>
      <RssEditDialog category="marchant"
        open={isEditMarchant}
        onClose={this.handleCloseDialog.bind(this, 'isEditMarchant')}
      />
      <Collapse in={openMarchant} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {renderCategoryList('marchant')}
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
                <SettingsApplications className={classes.icon} />
              </IconButton>
            </ListItemSecondaryAction>
          : null
        }
      </ListItem>
      <RssEditDialog category="sellers"
        open={isEditSellers}
        onClose={this.handleCloseDialog.bind(this, 'isEditSellers')}
      />
      <Collapse in={openSellers} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {renderCategoryList('sellers')}
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
    const textClass =
      { primary: classes.primary, secondary: classes.secondary };
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
    const textClass =
      { primary: classes.title, secondary: classes.secondary };
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
const styles = theme => ({
  header: {
    height: barHeightSmDown
  , [theme.breakpoints.up('sm')]: { height: barHeightSmUp }
  }
, icon: {
  color: theme.palette.common.white
}
, avatar: {
    color: theme.palette.common.white
  , background: 'inherit'
  , width: 24, height: 24, fontSize: 16
}
, primary: {
    whiteSpace: 'nowrap'
  , color: theme.palette.common.white
  }
, secondary: {}
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
