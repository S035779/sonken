import React            from 'react';
import PropTypes        from 'prop-types';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { List, IconButton, TextField }
                        from 'material-ui';
import { FormLabel, FormControl, FormHelperText }
                        from 'material-ui/Form';
import { ListItem, ListItemSecondaryAction, ListItemText }
                        from 'material-ui/List'
import { Clear, ContentPaste }
                        from 'material-ui-icons';
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
    , openDel:    []
    , checked:    []
    , title:      props.title
    };
  }

  handleClose(name, event) {
    this.setState({ [name]: false });
  }

  handleClickButton(name) {
    std.logInfo(RssFormDialog.displayName, 'handleClickButton', name);
    this.setState({ [name]: true });
  }

  handleChangeText(name, event) {
    std.logInfo(RssFormDialog.displayName, 'handleChangeText', name);
    this.setState({ [name]: event.target.value });
  }

  handleChangeToggle(name, value) {
    std.logInfo(RssFormDialog.displayName, 'handleChangeToggle', name);
    const checked = this.state[name];
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if(currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    this.setState({ [name]: newChecked });
  }

  handleCloseDialog() {
    this.props.onClose();
  }

  handleSubmitDialog() {
    if(this.isValidate() && this.isChanged()) {
      const { title } = this.state;
      const { selectedNoteId } = this.props;
      this.props.onSubmit(selectedNoteId, title);
      this.props.onClose();
    } else {
      this.setState({ isNotValid: true });
    }
  }

  isValidate() {
    return true;
  }

  isChanged() {
    return true;
  }

  render() {
    //std.logInfo(RssFormDialog.displayName, 'Props', this.props);
    //std.logInfo(RssFormDialog.displayName, 'State', this.state);
    const { classes, open, category, title } = this.props;
    const { isNotValid, isSuccess, checked, openAdd, openUpd }
      = this.state;
    const name = category === 'marchant'
      ? '商品RSS' : category === 'sellers' ? '出品者RSS' : null;
    return <LoginFormDialog
        open={open}
        title={'ノート編集'}
        onClose={this.handleCloseDialog.bind(this)}
        onSubmit={this.handleSubmitDialog.bind(this)}
        className={classes.fieldset}>
        <FormControl component="fieldset" className={classes.column}>
          <TextField autoFocus margin="dense"
            value={this.state.title}
            onChange={this.handleChangeText.bind(this, 'title')}
            label={name + 'タイトル'} type="text" fullWidth />
        </FormControl>
        <FormControl component="fieldset" className={classes.column}>
          <FormLabel component="legend">{name}カテゴリー</FormLabel>
          <RssButton color="success"
            onClick={this.handleClickButton.bind(this, 'openAdd')}
            classes={classes.button}>新規追加</RssButton>
          <RssNewDialog
            open={openAdd}
            category={category}
            onClose={this.handleClose.bind(this, 'openAdd')}
          />
          <List dense>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
            <ListItem key={value} dense button onClick={
              this.handleChangeToggle.bind(this, 'checked', value)
            }>
              <RssCheckbox color="secondary"
                checked={checked.indexOf(value) !== -1}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText primary={`Line item ${value + 1}`}/>
              <ListItemSecondaryAction>
                <IconButton onClick={
                  this.handleChangeToggle.bind(this, 'openUpd', value)
                }>
                  <ContentPaste className={classes.editIcon}/>
                </IconButton>
                <RssNewDialog
                  open={openUpd.indexOf(value) !== -1}
                  category={category}
                  title={`Line item ${value +1}`}
                  onClose={
                    this.handleChangeToggle.bind(this, 'openUpd', value)
                  }
                />
                <IconButton onClick={
                  this.handleChangeToggle.bind(this, 'openDel', value)
                }>
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
, column:     { flex: 1, width: '100%', marginTop: theme.spacing.unit *2 }
, button:     { margin: theme.spacing.unit * 2 }
, clearIcon:  { fontSize: 16, color: '#FA404B' }
, editIcon:   { fontSize: 16, color: '#FEA634' }
});
RssFormDialog.displayName = 'RssFormDialog';
RssFormDialog.defaultProps = { 
  open: false
};
RssFormDialog.propTypes = {
  classes:  PropTypes.object.isRequired
, onClose:  PropTypes.func.isRequired
, open:     PropTypes.bool.isRequired
};
export default withStyles(styles)(RssFormDialog);
