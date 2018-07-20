import React            from 'react';
import PropTypes        from 'prop-types';
import NoteAction       from 'Actions/NoteAction';
import std              from 'Utilities/stdutils';
import Spinner          from 'Utilities/Spinner';

import { withStyles }   from '@material-ui/core/styles';
import { Input, Button, Typography, TextField, FormControl, InputLabel } from '@material-ui/core';
import RssButton        from 'Components/RssButton/RssButton';
import RssDialog        from 'Components/RssDialog/RssDialog';
import RssItemList      from 'Components/RssItemList/RssItemList';

const isAlpha = process.env.NODE_ENV !== 'production';
const mon = '//www.mnrate.com/item/aid/';
const fba = '//sellercentral.amazon.co.jp/hz/fba/profitabilitycalculator/index?lang=ja_JP';

class RssForms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      note:       props.note
    , asin:       props.note.asin
    , price:      props.note.price
    , bidsprice:  props.note.bidsprice
    , body:       props.note.body
    , isSuccess:  false
    , isNotValid: false
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(RssForms.displayName, 'Props', nextProps);
    const { note } = nextProps;
    this.setState({ note });
  }

  downloadFile(blob) {
    std.logInfo(RssForms.dislpayName, 'downloadFile', blob);
    const anchor = document.createElement('a');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const fileReader = new FileReader();
    fileReader.onload = function() {
      anchor.href = URL.createObjectURL(new Blob([bom, this.result], { type: 'text/csv' }));
      anchor.target = '_blank';
      anchor.download = 'download.csv';
      anchor.click();
    }
    fileReader.readAsArrayBuffer(blob);
  }

  handleSave() {
    const { user } = this.props;
    const { note } = this.state;
    if(this.isValidate() && this.isChanged()) {
      NoteAction.update(user, note._id, note)
        .then(() => this.setState({ isSuccess: true }))
        .catch(err => this.setState({ isNotValid: true }));
    } else {
      this.setState({ isNotValid: true });
    }
  }

  handleAutoSave() {
    const { user } = this.props;
    const { note } = this.state;
    if(this.isValidate() && this.isChanged()) {
      NoteAction.update(user, note._id, note);
    }
  }

  handleChangeInput(name, event) {
    const { note } = this.state;
    const value = event.target.value
    switch (name) {
      case 'asin':
        this.setState({
          note: Object.assign({}, note, { asin: value })
        , asin: value
        });
        break;
      case 'price':
        this.setState({
          note: Object.assign({}, note, { price: Number(value) })
        , price: Number(value)
        });
        break;
      case 'bidsprice':
        this.setState({
          note: Object.assign({}, note, { bidsprice: Number(value) })
        , bidsprice: Number(value) 
        });
        break;
      case 'body':
        this.setState({
          note: Object.assign({}, note, { body: value })
        , body: value
        });
        break;
    }
  }

  handleCloseDialog(name) {
    this.setState({ [name]: false });
  }

  handleDownload(event) {
    const { user, note } = this.props;
    std.logInfo(RssForms.displayName, 'handleDownload', user);
    const spn = Spinner.of('app');
    spn.start();
    NoteAction.downloadItems(user, note._id)
      .then(() => this.setState({ isSuccess: true }))
      .then(() => this.downloadFile(this.props.file))
      .then(() => spn.stop())
      .catch(err => {
        std.logError(RssForms.displayName, err.name, err.message);
        this.setState({ isNotValid: true });
        spn.stop();
      })
    ;
  }

  isValidate() {
    const { asin, price, bidsprice, body } = this.state.note;
    return (asin !== ''
      && std.regexNumber(price) && std.regexNumber(bidsprice)
    );
  }

  isChanged() {
    const { asin, price, bidsprice, body } = this.state.note;
    const { note } = this.props;
    return (note.asin !== asin  || note.price !== price
      || note.bidsprice !== bidsprice  || note.body !== body);
  }

  getColor(category) {
    switch(category) {
      case 'marchant':
        return 'skyblue';
      case 'sellers':
        return 'orange';
      case 'closedmarchant':
        return 'green';
      case 'closedsellers':
        return 'yellow';
    }
  }

  render() {
    //std.logInfo(RssForms.displayName, 'State', this.state);
    const { classes, user, note, category } = this.props;
    const { isNotValid, isSuccess } = this.state;
    const { asin, price, bidsprice, body} = this.state.note;
    const isChanged = this.isChanged();
    const link_mon = mon + asin;
    const link_fba = fba;
    const link_amz = note.AmazonUrl;
    const name = note.name;
    const items = note.items ? note.items : [];
    const color = this.getColor(category);
    return <div className={classes.forms}>
      <div className={classes.header}>
        <Typography variant="title" noWrap
          className={classes.title}>{note.title}</Typography>
        <div className={classes.buttons}>
      { isAlpha
        ? (<RssButton color={color}
            onClick={this.handleDownload.bind(this)}
            classes={classes.button}>ダウンロード</RssButton>)
        : null
      }
        </div>
      </div>
      <div className={classes.edit}>
        <FormControl className={classes.text}>
          <InputLabel htmlFor="asin">ASIN</InputLabel>
          <Input id="asin"
            value={asin}
            onChange={this.handleChangeInput.bind(this, 'asin')}/>
        </FormControl>
        <div className={classes.buttons}>
          <Button variant="raised" size="medium"
            onClick={this.handleSave.bind(this)}
            className={classes.button}>{isChanged ? '*' : ''}登録</Button>
          <RssDialog open={isNotValid} title={'送信エラー'}
            onClose={this.handleCloseDialog.bind(this, 'isNotValid')}>
          内容に不備があります。もう一度確認してください。
          </RssDialog>
          <RssDialog open={isSuccess} title={'送信完了'}
            onClose={this.handleCloseDialog.bind(this, 'isSuccess')}>
          要求を受け付けました。
          </RssDialog>
        </div>
        <div className={classes.buttons}>
          <Button color="primary" size="large"
            href={link_mon} target="_blank"
            className={classes.link}>モノレート</Button>
          <Button color="primary" size="large" 
            href={link_fba} target="_blank"
            className={classes.link}>FBA料金シュミレーター</Button>
        </div>
      </div>
      <div className={classes.edit}>
        <Typography variant="subheading" noWrap
          className={classes.label}>Amazon商品名：</Typography>
        <Button color="primary" size="large" fullWidth
          href={link_amz} target="_blank"
          className={classes.name}>{name}</Button>
      </div>
      {this.props.children}
      <div className={classes.memo}>
        <div className={classes.texts}>
          <div className={classes.edit}>
            <TextField
              id="number"
              label="想定売値"
              value={price}
              onChange={this.handleChangeInput.bind(this, 'price')}
              onBlur={this.handleAutoSave.bind(this)}
              type="number"
              className={classes.text}
              InputLabelProps={{
                shrink: true
              }}
              margin="none" />
          </div>
          <div className={classes.edit}>
            <TextField
              id="number"
              label="最高入札額"
              value={bidsprice}
              onChange={this.handleChangeInput.bind(this, 'bidsprice')}
              onBlur={this.handleAutoSave.bind(this)}
              type="number"
              className={classes.text}
              InputLabelProps={{
                shrink: true
              }}
              margin="none" />
          </div>
        </div>
        <div className={classes.textarea}>
        <TextField id="body" label="自由入力欄" multiline
          rows="4" fullWidth margin="none"
          value={body}
          onChange={this.handleChangeInput.bind(this, 'body')}
          onBlur={this.handleAutoSave.bind(this)}
          className={classes.field}/>
        </div>
      </div>
      <div className={classes.noteList}>
        <RssItemList
          user={user}
          items={items} />
      </div>
    </div>;
  }
};

const barHeightSmUp     = 64;//112;
const barHeightSmDown   = 56;//104;
const searchHeight      = 62;
const filterHeight      = 62 * 9;
const listHeightSmDown  = `calc(100vh - ${barHeightSmDown}px  - ${filterHeight}px - ${searchHeight}px)`;
const listHeightSmUp    = `calc(100vh - ${barHeightSmUp}px - ${filterHeight}px - ${searchHeight}px)`;
const columnHeight = 62;
const styles = theme => ({
  forms:        { display: 'flex', flexDirection: 'column'
                , overflow: 'scroll' }
, noteList:     { width: '100%'
                , height: listHeightSmDown
                , [theme.breakpoints.up('sm')]: {
                  height: listHeightSmUp }}
, header:       { display: 'flex', flexDirection: 'row' 
                , alignItems: 'stretch', justifyContent: 'space-between'
                , height: columnHeight, minHeight: columnHeight
                , boxSizing: 'border-box', padding: '5px' }
, title:        { flex: 2, margin: theme.spacing.unit * 1.75 }
, label:        { margin: theme.spacing.unit * 1.75 }
, edit:         { display: 'flex', flexDirection: 'row'
                , alignItems: 'stretch'
                , height: columnHeight, minHeight: columnHeight
                , boxSizing: 'border-box'
                , padding: '5px' }
, buttons:      { display: 'flex', flexDirection: 'row' }
, button:       { flex: 1, margin: theme.spacing.unit
                , wordBreak: 'keep-all' }
, link:         { flex: 1, margin: theme.spacing.unit /2
                , wordBreak: 'keep-all' }
, name:         { flex: 1, margin: theme.spacing.unit /2
                , border: '1px solid #CCC'
                , wordBreak: 'keep-all' }
, text:         { marginLeft: theme.spacing.unit * 1.75 }
, memo:         { display: 'flex', flexDirection: 'row'
                , alignItems: 'stretch'
                , height: columnHeight * 2, minHeight: columnHeight * 2
                , boxSizing: 'border-box' }
, field:        { paddingTop: 5 }
, textarea:     { width: '100%', padding: 5 }
});
RssForms.displayName = 'RssForms';
RssForms.defaultProps = { note: null };
RssForms.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssForms);
