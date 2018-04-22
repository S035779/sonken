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
, AccountBox, BlurOn, Settings }
                        from 'material-ui-icons';
import LoginProfile     from 'Components/LoginProfile/LoginProfile';
import LoginPreference  from 'Components/LoginPreference/LoginPreference';

class DrawerList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openUser:         false
    , openMarchant:     false
    , openSellers:      false
    , isProfile:        false
    , isPreference:     false
    , dragged:          false
    , dropZoneEntered:  false
    , dragSrcEl:        null
    , categorys:        [
      { main: 'marchant', sub: '01category' }
    , { main: 'marchant', sub: '02category' }
    , { main: 'marchant', sub: '03category' }
    , { main: 'marchant', sub: '04category' }
    , { main: 'marchant', sub: '05category' }
    , { main: 'sellers', sub: '06category' }
    , { main: 'sellers', sub: '07category' }
    , { main: 'sellers', sub: '08category' }
    , { main: 'sellers', sub: '09category' }
    , { main: 'sellers', sub: '10category' }
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
    const dragSrcEl = event.currentTarget;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', dragSrcEl.innerHTML)
    this.setState({ dragged: true, dragSrcEl: dragSrcEl });
  }

  handleDragOver(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragOver', name)
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  handleDragEnter(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragEnter', name)
    this.setState({ dropZoneEntered: true });
  }

  handleDragLeave(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragLeave', name)
    this.setState({ dropZoneEntered: false });
  }

  handleDrop(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragDrop', name)
    const { dragSrcEl } = this.state;
    event.stopPropagation();
    if(dragSrcEl !== event.currentTarget) {
      dragSrcEl.innerHTML = event.currentTarget.innerHTML;
      this.setState({ dragSrcEl: dragSrcEl });
      event.currentTarget.innerHTML
        = event.dataTransfer.getData('text/html');
    }
  }

  handleDragEnd(name, event) {
    std.logInfo(DrawerList.displayName, 'handleDragEnd', name)
    this.setState({ dropZoneEntered: false, dragged: false });
  }

  renderCategoryList(category) {
    const { classes } = this.props;
    const { dragged, dropZoneEntered } = this.state;
    const textClass =
      { primary: classes.primary, secondary: classes.secondary };
    return <ListItem button
        draggable="true"
        onDragOver={this.handleDragOver.bind(this, category)}
        onDragEnter={this.handleDragEnter.bind(this, category)}
        onDragLeave={this.handleDragLeave.bind(this, category)}
        onDragStart={this.handleDragStart.bind(this, category)}
        onDragEnd={this.handleDragEnd.bind(this, category)}
        onDrop={this.handleDrop.bind(this, category)}
        className={classNames(
            classes.draggable
          , dragged && classes.dragged
          , dropZoneEntered && classes.dragOver
        )}
      >
        <ListItemIcon>
          <Avatar className={classes.avatar}>
            {category.substr(0,2)}
          </Avatar>
        </ListItemIcon>
        <ListItemText primary={category} classes={textClass}
        />
      </ListItem>;
  }

  renderListItems() {
    const { classes, open } = this.props;
    const { openMarchant, openSellers } = this.state;
    const textClass =
      { primary: classes.primary, secondary: classes.secondary };
    const renderCategoryList =
      category => this.renderCategoryList(category);
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
              <IconButton>
                <Settings className={classes.icon} />
              </IconButton>
            </ListItemSecondaryAction>
          : null
        }
      </ListItem>
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
              <IconButton>
                <Settings className={classes.icon} />
              </IconButton>
            </ListItemSecondaryAction>
          : null
        }
      </ListItem>
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
, dragOver:   { border: '2px dashed #000' }
});
DrawerList.displayName = 'DrawerList';
DrawerList.defaultProps = {};
DrawerList.propTypes = {
  classes:  PropTypes.object.isRequired
};
export default withStyles(styles)(withRouter(DrawerList));
