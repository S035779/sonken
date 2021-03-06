import loadable         from '@loadable/component';
import React            from 'react';
import PropTypes        from 'prop-types'
import LoginAction      from 'Actions/LoginAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import { List, IconButton, Avatar, FormLabel, FormControl, FormHelperText, ListItem, ListItemSecondaryAction, ListItemText, ListItemAvatar } from '@material-ui/core';
import { Clear, Edit, Folder } from '@material-ui/icons';
const RssDialog       = loadable(() => import('Components/RssDialog/RssDialog'));
const RssButton       = loadable(() => import('Components/RssButton/RssButton'));
const RssNewDialog    = loadable(() => import('Components/RssNewDialog/RssNewDialog'));
const LoginFormDialog = loadable(() => import('Components/LoginFormDialog/LoginFormDialog'));

class RssEditDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSuccess:      false
    , isNotValid:     false
    , openAdd:        false
    , openUpd:        []
    , categorys:      props.categorys
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(RssEditDialog.displayName, 'Props', nextProps);
    const { categorys } = nextProps;
    this.setState({ categorys });
  }

  handleClose(name) {
    this.setState({ [name]: false });
  }

  handleClickButton(name) {
    std.logInfo(RssEditDialog.displayName, 'handleClickButton', name);
    this.setState({ [name]: true });
  }

  handleCreate(subcategory) {
    std.logInfo(RssEditDialog.displayName, 'handleCreate', subcategory);
    const { user, category } = this.props;
    if(this.isValidate() && this.isChanged()) {
      LoginAction.createCategory(user, { category, subcategory })
        .then(()    => this.setState({ isSuccess: true }))
        .catch(err  => {
          std.logError(RssEditDialog.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
        })
      ;
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleDelete(id) {
    std.logInfo(RssEditDialog.displayName, 'handleDelete', id);
    const { user } = this.props;
    if(window.confirm('Are you sure ?')) {
      LoginAction.deleteCategory(user, [id])
        .then(()    => this.setState({ isSuccess: true }))
        .catch(err  => {
          std.logError(RssEditDialog.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
        })
      ;
    }
  }

  handleUpdate(id, subcategoryId, subcategory) {
    std.logInfo(RssEditDialog.displayName, 'handleUpdate', id);
    const { user, category } = this.props;
    if(this.isValidate() && this.isChanged()) {
      LoginAction.updateCategory(user, id
        , { category, subcategory, subcategoryId })
        .then(()    => this.setState({ isSuccess: true }))
        .catch(err  => {
          std.logError(RssEditDialog.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
        })
      ;
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleChangeToggle(name, id) {
    std.logInfo(RssEditDialog.displayName, 'handleChangeToggle', name);
    const checked = this.state[name];
    const currentIndex = checked.indexOf(id);
    const newChecked = [...checked];
    if(currentIndex === -1) newChecked.push(id);
    else newChecked.splice(currentIndex, 1);
    this.setState({ [name]: newChecked });
  }

  handleCloseDialog() {
    this.props.onClose();
  }

  isValidate() {
    return true;
  }

  isChanged() {
    return true;
  }

  render() {
    //std.logInfo(RssEditDialog.displayName, 'Props', this.props);
    //std.logInfo(RssEditDialog.displayName, 'State', this.state);
    const { classes, open, user, category, title } = this.props;
    const { isNotValid, isSuccess, openAdd, openUpd, categorys } = this.state;
    const paperClass = { paper: classes.dialog }
    const isCategory = obj => obj._id !== '9999' && obj._id !== '9998';
    return <LoginFormDialog 
        open={open} 
        title={'カテゴリー編集'}
        onClose={this.handleCloseDialog.bind(this)}
        classes={paperClass}
        className={classes.fieldset}>
        <FormControl component="fieldset" className={classes.column}>
          <FormLabel component="legend">{title}カテゴリー</FormLabel>
          <RssButton color="success"
            onClick={this.handleClickButton.bind(this, 'openAdd')}
            classes={classes.button}>新規追加</RssButton>
          <RssNewDialog
            open={openAdd}
            user={user}
            category={category}
            title={title}
            name={'Untitled'}
            onClose={this.handleClose.bind(this, 'openAdd')}
            onSubmit={this.handleCreate.bind(this)}
          />
          <List dense>
          {categorys.filter(isCategory).map(obj => (
            <ListItem key={obj._id}>
              <ListItemAvatar>
                <Avatar><Folder className={classes.folderIcon}/></Avatar>
              </ListItemAvatar>
              <ListItemText primary={obj.subcategory}/>
              <ListItemSecondaryAction>
                <IconButton onClick={this.handleChangeToggle.bind(this, 'openUpd', obj._id)}>
                  <Edit className={classes.editIcon}/>
                </IconButton>
                <RssNewDialog
                  open={openUpd.indexOf(obj._id) !== -1}
                  user={user}
                  category={category}
                  title={title}
                  name={obj.subcategory}
                  onClose={this.handleChangeToggle
                    .bind(this, 'openUpd', obj._id)}
                  onSubmit={this.handleUpdate
                    .bind(this, obj._id, obj.subcategoryId)}
                />
                <IconButton
                  onClick={this.handleDelete.bind(this, obj._id)}
                >
                  <Clear className={classes.clearIcon}/>
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          </List>
          <FormHelperText>
            カテゴリーを追加・編集することが出来ます。
          </FormHelperText>
        </FormControl>
        <RssDialog open={isNotValid} title={'送信エラー'}
          onClose={this.handleClose.bind(this, 'isNotValid')}>
          内容に不備があります。もう一度確認してください。
        </RssDialog>
        <RssDialog open={isSuccess} title={'送信完了'}
          onClose={this.handleClose.bind(this, 'isSuccess')}>
          要求を受け付けました。
        </RssDialog>
      </LoginFormDialog>
    ;
  }
}
RssEditDialog.displayName = 'RssEditDialog';
RssEditDialog.defaultProps = { open: false };
RssEditDialog.propTypes = {
  classes: PropTypes.object.isRequired
, onClose: PropTypes.func.isRequired
, open: PropTypes.bool.isRequired
, categorys: PropTypes.array.isRequired
, user: PropTypes.string
, category: PropTypes.string.isRequired
, title: PropTypes.string.isRequired
};

const styles = theme => ({
  fieldset:   { display: 'flex', flexDirection: 'column' }
, dialog:     { width: 512 }
, column:     { flex: 1, width: '100%'
              , marginTop: theme.spacing.unit *2 }
, button:     { margin: theme.spacing.unit *2 }
, clearIcon:  { fontSize: 16, color: '#FA404B' }
, editIcon:   { fontSize: 16, color: '#FEA634' }
});
export default withStyles(styles)(RssEditDialog);
