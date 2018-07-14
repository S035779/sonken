import React            from 'react';
import PropTypes        from 'prop-types';
import NoteAction       from 'Actions/NoteAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import { List, IconButton, TextField, FormLabel, FormControl, FormHelperText, ListItem, ListItemSecondaryAction, ListItemText } from '@material-ui/core';
import { Clear, ContentPaste } from '@material-ui/icons';
import RssDialog        from 'Components/RssDialog/RssDialog';
import RssCheckbox      from 'Components/RssCheckbox/RssCheckbox';
import RssButton        from 'Components/RssButton/RssButton';
import RssNewDialog     from 'Components/RssNewDialog/RssNewDialog';
import LoginFormDialog  from 'Components/LoginFormDialog/LoginFormDialog';

class RssFormDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSuccess:  false
    , isNotValid: false
    , openAdd:    false
    , openUpd:    []
    , checked:    props.categoryIds ? props.categoryIds : []
    , noteTitle:      props.noteTitle
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(RssFormDialog.displayName, 'Props', nextProps);
    const { categorys, categoryIds } = nextProps;
    this.setState({ categorys, checked: categoryIds ? categoryIds : [] });
  }

  handleClose(name, event) {
    this.setState({ [name]: false });
  }

  handleClickButton(name) {
    std.logInfo(RssFormDialog.displayName, 'handleClickButton', name);
    this.setState({ [name]: true });
  }

  handleCreate(subcategory) {
    std.logInfo(RssFormDialog.displayName, 'handleCreate', subcategory);
    const { user, category } = this.props;
    if(this.isValidate() && this.isChanged()) {
      NoteAction.createCategory(user, { category, subcategory })
        .then(()    => this.setState({ isSuccess: true }))
        .catch(err  => {
          std.logError(RssFormDialog.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
        })
      ;
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleDelete(id) {
    std.logInfo(RssFormDialog.displayName, 'handleDelete', id);
    const { user } = this.props;
    if(window.confirm('Are you sure ?')) {
      NoteAction.deleteCategory(user, [id])
        .then(()    => this.setState({ isSuccess: true }))
        .catch(err  => {
          std.logError(RssFormDialog.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
        })
      ;
    }
  }

  handleUpdate(id, subcategoryId, subcategory) {
    std.logInfo(RssFormDialog.displayName, 'handleUpdate', id);
    const { user, category } = this.props;
    if(this.isValidate() && this.isChanged()) {
      NoteAction.updateCategory(user, id
        , { category, subcategory, subcategoryId })
        .then(()    => this.setState({ isSuccess: true }))
        .catch(err  => {
          std.logError(RssFormDialog.displayName, err.name, err.message);
          this.setState({ isNotValid: true });
        })
      ;
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleChangeText(name, event) {
    std.logInfo(RssFormDialog.displayName, 'handleChangeText', name);
    this.setState({ [name]: event.target.value });
  }

  handleChangeToggle(name, id) {
    std.logInfo(RssFormDialog.displayName, 'handleChangeToggle', name);
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

  handleSubmitDialog() {
    if(this.isValidate() && this.isChanged()) {
      const { noteTitle, checked } = this.state;
      const { selectedNoteId } = this.props;
      this.props.onSubmit(selectedNoteId, noteTitle, checked);
      this.props.onClose();
    } else {
      this.setState({ isNotValid: true });
    }
  }

  isValidate() {
    const { noteTitle } = this.state;
    return noteTitle !== '';
  }

  isChanged() {
    return true;
  }

  render() {
    //std.logInfo(RssFormDialog.displayName, 'Props', this.props);
    //std.logInfo(RssFormDialog.displayName, 'State', this.state);
    const { classes, open, user, category, categorys, title } = this.props;
    const { isNotValid, isSuccess, checked, openAdd, openUpd } = this.state;
    const paperClass = { paper: classes.dialog };
    const isCategory = obj => obj._id !== '9999' && obj._id !== '9998';
    return <LoginFormDialog
        open={open}
        title={'ノート編集'}
        onClose={this.handleCloseDialog.bind(this)}
        onSubmit={this.handleSubmitDialog.bind(this)}
        isSubmit classes={paperClass}
        className={classes.fieldset}>
        <FormControl component="fieldset" className={classes.column}>
          <TextField autoFocus margin="dense"
            value={this.state.noteTitle}
            onChange={this.handleChangeText.bind(this, 'noteTitle')}
            label={title + 'タイトル'} type="text" fullWidth />
        </FormControl>
        <FormControl component="fieldset" className={classes.column}>
          <FormLabel component="legend">{title}カテゴリー</FormLabel>
          <RssButton color="success"
            onClick={this.handleClickButton.bind(this, 'openAdd')}
            classes={classes.button}>新規追加</RssButton>
          <RssNewDialog
            title={title}
            open={openAdd}
            user={user}
            category={category}
            name={'Untitled'}
            onClose={this.handleClose.bind(this, 'openAdd')}
            onSubmit={this.handleCreate.bind(this)}
          />
          <List dense>
          {categorys.filter(isCategory).map(obj => (
            <ListItem key={obj._id} dense button
              onClick={this.handleChangeToggle
                .bind(this, 'checked', obj._id)}
            >
              <RssCheckbox color="secondary"
                checked={checked.indexOf(obj._id) !== -1}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText primary={obj.subcategory}/>
              <ListItemSecondaryAction>
                <IconButton
                  onClick={this.handleChangeToggle
                    .bind(this, 'openUpd', obj._id)}
                >
                  <ContentPaste className={classes.editIcon}/>
                </IconButton>
                <RssNewDialog
                  title={title}
                  open={openUpd.indexOf(obj._id) !== -1}
                  user={user}
                  category={category}
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
            該当するカテゴリーを追加・選択することが出来ます。
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
};
const styles = theme => ({
  fieldset:   { display: 'flex', flexDirection: 'column' }
, dialog:     { width: 512 }
, column:     { flex: 1, width: '100%', marginTop: theme.spacing.unit *2 }
, button:     { margin: theme.spacing.unit * 2 }
, clearIcon:  { fontSize: 16, color: '#FA404B' }
, editIcon:   { fontSize: 16, color: '#FEA634' }
});
RssFormDialog.displayName = 'RssFormDialog';
RssFormDialog.defaultProps = { 
  open:         false
};
RssFormDialog.propTypes = {
  classes:      PropTypes.object.isRequired
, onClose:      PropTypes.func.isRequired
, open:         PropTypes.bool.isRequired
};
export default withStyles(styles)(RssFormDialog);
