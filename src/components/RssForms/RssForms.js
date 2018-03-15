import React            from 'react';
import PropTypes        from 'prop-types';
import NoteAction       from 'Actions/NoteAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { Input, Button, Typography, TextField }
                        from 'material-ui';
import { InputLabel }   from 'material-ui/Input';
import { FormControl }  from 'material-ui/Form';
import RssItemList      from 'Components/RssItemList/RssItemList';

const mon = '//www.mnrate.com/item/aid/';
//const amz = '//www.amazon.co.jp/exec/obidos/ASIN/';
const fba = '//sellercentral.amazon.co.jp/hz/fba/profitabilitycalculator/index?lang=ja_JP';

class RssForms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      note:       props.note
    , asin:       props.note.asin
    , name:       props.name
    , price:      props.note.price
    , bidsprice:  props.note.bidsprice
    , body:       props.note.body
    , AmazonUrl:  props.AmazonUrl
    };
  }

  componentWillReceiveProps(nextProps) {
    std.logInfo(RssForms.displayName, 'Props', nextProps);
    this.setState({ note: nextProps.note });
  }

  handleSave() {
    const { user } = this.props;
    const { note } = this.state;
    NoteAction.update(user, note.id, note);
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
          note: Object.assign({}, note, { price: value })
        , price: value
        });
        break;
      case 'bidsprice':
        this.setState({
          note: Object.assign({}, note, { bidsprice: value })
        , bidsprice: value 
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

  render() {
    std.logInfo(RssForms.displayName, 'State', this.state);
    const { classes, user, note } = this.props;
    const { asin, name, price, bidsprice, body, AmazonUrl }
      = this.state.note;
    const isChanged = note.asin !== asin || note.price !== price
                   || note.bidsprice !== bidsprice || note.body  !== body;
    const link_mon = mon + asin;
    const link_fba = fba;
    const link_amz = AmazonUrl; //amz + asin;
    const items = note.items ? note.items : [];
    return <div className={classes.forms}>
      <div className={classes.header}>
        <Typography variant="title" noWrap
          className={classes.title}>{note.title}</Typography>
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
        </div>
        <div className={classes.buttons}>
          <Button color="primary" size="large"
            href={link_mon}
            className={classes.link}>モノレート</Button>
          <Button color="primary" size="large" 
            href={link_fba}
            className={classes.link}>FBA料金シュミレーター</Button>
        </div>
      </div>
      <div className={classes.edit}>
        <Typography variant="subheading" noWrap
          className={classes.title}>Amazon商品名：</Typography>
        <Button color="primary" size="large" fullWidth
          href={link_amz}
          className={classes.name}>{name}</Button>
      </div>
      {this.props.children}
      <div className={classes.memo}>
        <div className={classes.texts}>
          <div className={classes.edit}>
            <FormControl className={classes.text}>
              <InputLabel htmlFor="price">想定売値</InputLabel>
              <Input id="price"
                value={price}
                onChange={this.handleChangeInput.bind(this, 'price')}/>
            </FormControl>
          </div>
          <div className={classes.edit}>
            <FormControl className={classes.text}>
              <InputLabel htmlFor="bidsprice">最高入札額</InputLabel>
              <Input id="bidsprice"
                value={bidsprice}
                onChange={this.handleChangeInput.bind(this,'bidsprice')}/>
            </FormControl>
          </div>
        </div>
        <div className={classes.textarea}>
        <TextField id="body" label="自由入力欄" multiline
          rows="4" fullWidth margin="none"
          value={body}
          onChange={this.handleChangeInput.bind(this, 'body')}
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

const barHeightSmDown   = 104;
const barHeightSmUp     = 112;
const searchHeight      = 62;
const filterHeight      = 62 * 9;
const listHeightSmDown  =
  `calc(100vh - ${barHeightSmDown}px - ${filterHeight}px - ${searchHeight}px)`;
const listHeightSmUp    =
  `calc(100vh - ${barHeightSmUp}px - ${filterHeight}px - ${searchHeight}px)`;
const listWidth = 400;
const columnHeight = 62;
const editWidth = `calc(100% - ${listWidth}px)`;
const styles = theme => ({
  forms:        { display: 'flex', flexDirection: 'column' }
, noteList:     { width: '100%'
                , height: listHeightSmDown
                , [theme.breakpoints.up('sm')]: {
                  height: listHeightSmUp }}
, header:       { height: columnHeight, minHeight: columnHeight
                , boxSizing: 'border-box'
                , padding: '5px' }
, title:        { margin: theme.spacing.unit * 1.75 }
, edit:         { display: 'flex', flexDirection: 'row'
                , alignItems: 'stretch'
                , height: columnHeight, minHeight: columnHeight
                , boxSizing: 'border-box'
                , padding: '5px' }
, buttons:      { display: 0, display: 'flex', flexDirection: 'row' }
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
