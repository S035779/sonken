import React from 'react';
import PropTypes from 'prop-types';
import NoteAction from 'Actions/NoteAction';

import { withStyles } from 'material-ui/styles';
import { Input, Button, Typography, TextField } from 'material-ui';
import { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';

const mon = 'http://mnrate/item/aid/';
const amz = 'http://www.amazon.co.jp/exec/obidos/ASIN/';
const kpa = 'https://keepa.com/#!product/5-';
const img = 'http://images-jp.amazon.com/images/P/';
const imgfile = '.09.LZZZZZZZ.jpg';
const fba = 'https://sellercentral.amazon.co.jp/hz/fba/profitabilitycalculator/index?lang=ja_JP';

class RssForms extends React.Component {
  constructor(props) {
    super(props);
    this.state = { note: props.note };
  }

  componentWillReceiveProps(props) {
    this.logInfo('props', props);
    this.setState({ note: props.note });
  }

  handleSave() {
    const {id, asin, price, bidsprice, body} = this.state.note;
    NoteAction.update(id, {asin, price, bidsprice, body});
  }

  handleChangeInput(name, event) {
    const { note } = this.state;
    const value = event.target.value;
    let newItem = {};
    switch (name) {
      case 'asin':  newItem = { asin:   value };
        break;
      case 'price': newItem = { price:  value };
        break;
      case 'bidsprice':  newItem = { bidsprice:   value };
        break;
      case 'body':  newItem = { body:   value };
        break;
    }
    const newNote = Object.assign({}, note, newItem);
    this.setState({ note: newNote });
  }

  logInfo(name, info) {
    console.info('>>> Info:', name, info);
  }

  render() {
    this.logInfo('render', this.state);
    const { classes, note } = this.props;
    const { asin, price, bidsprice, body } = this.state.note;
    const isChanged = note.asin !== asin || note.price !== price
                   || note.bidsprice !== bidsprice || note.body  !== body;
    const link_mon = mon + asin;
    const link_fba = fba;
    const link_amz = amz + asin;
    const link_img = img + asin + imgfile;
    const link_kpa = kpa + asin;
    return <div className={classes.forms}>
      <div className={classes.header}>
        <Typography variant="title" noWrap
          className={classes.title}>{note.title}</Typography>
      </div>
      <div className={classes.edit}>
        <FormControl className={classes.text}>
          <InputLabel htmlFor="asin">ASIN</InputLabel>
          <Input id="asin" value={asin}
            onChange={this.handleChangeInput.bind(this, 'asin')}/>
        </FormControl>
        <div className={classes.buttons}>
          <Button variant="raised" size="medium"
            className={classes.button}
            onClick={this.handleSave.bind(this)}>
          {isChanged ? '*' : ''}登録</Button>
        </div>
        <div className={classes.buttons}>
          <Button color="primary" size="large" className={classes.link}
            href={link_mon}>
            モノレート</Button>
          <Button color="primary" size="large" className={classes.link}
            href={link_fba}>
            FBA料金シュミレーター</Button>
        </div>
      </div>
      <div className={classes.edit}>
        <Typography variant="subheading" noWrap
          className={classes.title}>Amazon商品名</Typography>
        <div className={classes.buttons}>
          <Button color="primary" size="large" className={classes.link}
            href={link_amz}>
            {note.name}</Button>
        </div>
      </div>
      {this.props.children}
      <div className={classes.memo}>
        <div className={classes.texts}>
          <div className={classes.edit}>
            <FormControl className={classes.text}>
              <InputLabel htmlFor="price">想定売値</InputLabel>
              <Input id="price" value={price}
                onChange={this.handleChangeInput.bind(this, 'price')}/>
            </FormControl>
          </div>
          <div className={classes.edit}>
            <FormControl className={classes.text}>
              <InputLabel htmlFor="bidsprice">最高入札額</InputLabel>
              <Input id="bidsprice" value={bidsprice}
                onChange={this.handleChangeInput.bind(this,'bidsprice')}/>
            </FormControl>
          </div>
        </div>
        <div className={classes.texts}>
          <TextField id="body" label="自由入力欄" multiline rows="4"
            className={classes.textarea} margin="normal" value={body}
            onChange={this.handleChangeInput.bind(this, 'body')}/>
        </div>
      </div>
    </div>;
  }
};

const columnHeight = 62;
const styles = theme => ({
  forms:      { display: 'flex', flexDirection: 'column' }
, header:     { height: columnHeight, minHeight: columnHeight
              , boxSizing: 'border-box'
              , padding: '5px', borderBottom: '1px solid #CCC' }
, title:      { margin: theme.spacing.unit * 1.75 }
, edit:       { display: 'flex', flexDirection: 'row'
              , alignItems: 'stretch'
              , height: columnHeight, minHeight: columnHeight
              , boxSizing: 'border-box'
              , padding: '5px', borderBottom: '1px solid #CCC' }
, buttons:    { flex: 0, display: 'flex', flexDirection: 'row' }
, button:     { flex: 1, margin: theme.spacing.unit
              , wordBreak: 'keep-all' }
, link:       { flex: 1, margin: theme.spacing.unit /2
              , wordBreak: 'keep-all' }
, text:       { marginLeft: theme.spacing.unit * 1.75 }
, memo:       { display: 'flex', flexDirection: 'row'
              , alignItems: 'stretch'
              , height: columnHeight * 2, minHeight: columnHeight * 2
              , boxSizing: 'border-box'
              , borderBottom: '1px solid #CCC' }
, texts:      { display: 'flex', flexDirection: 'column' }
, textarea:   { width: 360, marginLeft: theme.spacing.unit }
});
RssForms.displayName = 'RssForms';
RssForms.defaultProps = { note: null };
RssForms.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssForms);
