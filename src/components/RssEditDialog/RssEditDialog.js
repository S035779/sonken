import React            from 'react';
import PropTypes        from 'prop-types'
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { List, IconButton }
                        from 'material-ui';
import { FormLabel, FormControl, FormHelperText }
                        from 'material-ui/Form';
import { ListItem, ListItemSecondaryAction, ListItemText }
                        from 'material-ui/List';
import { Clear, ContentPaste }
                        from 'material-ui-icons';
import RssDialog        from 'Components/RssDialog/RssDialog';
import RssCheckbox      from 'Components/RssCheckbox/RssCheckbox';
import RssButton        from 'Components/RssButton/RssButton';
import LoginFormDialog  from 'Components/LoginFormDialog/LoginFormDialog';

class RssEditDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSuccess:  false
    , isNotValid: false
    , openAdd:    false
    , openUpd:    []
    , openDel:    []
    , checked:    []
    , title:      ''
    };
  }

  handleClose(name, event) {
    this.setState({ [name]: false });
  }

  handleClickButton(name) {
    std.logInfo(RssEditDialog.displayName, 'handleClickButton', name);
    this.setState({ [name]: true });
  }

  handleChangeText(name, event) {
    std.logInfo(RssEditDialog.displayName, 'handleChangeText', name);
  }

  handleChangeToggle(name, value) {
    std.logInfo(RssEditDialog.displayName, 'handleChangeToggle', name);
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

  handleCloseDialog(name, event) {
    this.props.onClose(name, event);
  }

  handleSubmitDialog(name, event) {
    std.logInfo(RssEditDialog.displayName, 'handleSubmitDialog', name);
    switch(name) {
      case 'isEditCategory':
        if(this.isValidate() && this.isChanged()) {

        } else {
          this.setState({ isNotValid: true });
        }
        break;
    }
  }

  isValidate() {
    return true;
  }

  isChanged() {
    return true;
  }

  render() {
    std.logInfo(RssEditDialog.displayName, 'Props', this.props);
    std.logInfo(RssEditDialog.displayName, 'State', this.state);
    const { classes, open, category } = this.props;
    const { isNotValid, isSuccess, checked } = this.state;
    const title = category === 'marchant'
      ? '商品RSS' : category === 'sellers' ? '出品者RSS' : null;
    return <LoginFormDialog 
        open={open} 
        title={'カテゴリー編集'}
        onClose={this.handleCloseDialog.bind(this, 'isEditCategory')}
        onSubmit={this.handleSubmitDialog.bind(this, 'isEditCategory')}
        className={classes.fieldset}>
        <FormControl component="fieldset" className={classes.column}>
          <FormLabel component="legend">{title}カテゴリー</FormLabel>
          <RssButton color="success"
            onClick={this.handleClickButton.bind(this, 'openAdd')}
            classes={classes.button}>新規追加</RssButton>
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
, button:     { margin: theme.spacing.unit *2 }
, clearIcon:  { fontSize: 16, color: '#FA404B' }
, editIcon:   { fontSize: 16, color: '#FEA634' }
});
RssEditDialog.displayName = 'RssEditDialog';
RssEditDialog.defaultProps = {
  open: false
};
RssEditDialog.propTypes = {
  classes:            PropTypes.object.isRequired
, onClose:            PropTypes.func.isRequired
, open:               PropTypes.bool.isRequired
};
export default withStyles(styles)(RssEditDialog);
