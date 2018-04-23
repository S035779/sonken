import React            from 'react';
import PropTypes        from 'prop-types'
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { List, IconButton, TextField }
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

class RssAddDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSuccess:  false
    , isNotValid: false
    , title:      ''
    , checked:    []
    };
  }

  handleClose(name, event) {
    this.setState({ [name]: false });
  }

  handleClickButton(name, event) {
    std.logInfo(RssAddDialog.displayName, 'handleClickButton', name);
  }

  handleChangeText(name, event) {
    std.logInfo(RssAddDialog.displayName, 'handleChangeText', name);
  }

  handleChangeToggle(value) {
    std.logInfo(RssAddDialog.displayName, 'handleChangeToggle', name);
    const { checked } = this.state;
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if(currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    this.setState({ checked: newChecked });
  }

  handleCloseDialog(name, event) {
    this.props.onClose(name, event);
  }

  handleSubmitDialog(name, event) {
    std.logInfo(RssAddDialog.displayName, 'handleSubmitDialog', name);
    switch(name) {
      case 'isAddNote':
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
    std.logInfo(RssAddDialog.displayName, 'Props', this.props);
    std.logInfo(RssAddDialog.displayName, 'State', this.state);
    const { classes, open, category } = this.props;
    const { isNotValid, isSuccess, title, checked } = this.state;
    const name = category === 'marchant'
      ? '商品RSS' : category === 'sellers' ? '出品者RSS' : null;
    return <LoginFormDialog 
        open={open} 
        title={'新規登録'}
        onClose={this.handleCloseDialog.bind(this, 'isAddNote')}
        onSubmit={this.handleSubmitDialog.bind(this, 'isAddNote')}
        className={classes.fieldset}>
        <FormControl component="fieldset" className={classes.column}>
          <FormLabel component="legend">{name}タイトル</FormLabel>
          <TextField autoFocus margin="dense"
            value={title}
            onChange={this.handleChangeText.bind(this, 'title')}
            label="タイトル" type="text" fullWidth />
        </FormControl>
        <FormControl component="fieldset" className={classes.column}>
          <FormLabel component="legend">{name}カテゴリー</FormLabel>
          <RssButton color="success"
            onClick={this.handleClickButton.bind(this, 'category')}
            classes={classes.button}>新規追加</RssButton>
          <List dense>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
            <ListItem key={value} dense button
              onClick={this.handleChangeToggle.bind(this, value)}
            >
              <RssCheckbox color="secondary"
                checked={checked.indexOf(value) !== -1}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText primary={`Line item ${value + 1}`}/>
              <ListItemSecondaryAction>
                <IconButton>
                  <ContentPaste className={classes.editIcon}/>
                </IconButton>
                <IconButton>
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
RssAddDialog.displayName = 'RssAddDialog';
RssAddDialog.defaultProps = {
  open: false
};
RssAddDialog.propTypes = {
  classes:            PropTypes.object.isRequired
, onClose:            PropTypes.func.isRequired
, open:               PropTypes.bool.isRequired
};
export default withStyles(styles)(RssAddDialog);
