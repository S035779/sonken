import React from 'react';
import PropTypes from 'prop-types';
import NoteAction from 'Actions/NoteAction';

import { withStyles } from 'material-ui/styles';
//import RssForms from 'Components/RssForms/RssForms';
//import RssItemView from 'Components/RssItemView/RssItemView';
//import RssItemList from 'Components/RssItemList/RssItemList';

const monorate = 'http://mnrate/item/aid/';
const amazon = 'http://www.amazon.co.jp/exec/obidos/ASIN/';
const keepa = 'https://keepa.com/#!product/5-';
const photo = 'http://images-jp.amazon.com/images/P/';
const imgfile = '.09.LZZZZZZZ.jpg';

class MarchantEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state={ note: props.note };
  }

  componentWillReceiveProps(props) {
    this.setState({ note: props.note });
  }

  handleSave() {
    const { id, asin, price, bids, body } = this.state.note;
    NoteAction.update(id, { asin, price, bids, body });
  }

  handleChangeText(name, event) {
    const { note } = this.state;
    const value = event.target.value;
    let newItem = {};
    switch (name) {
      case 'asin':  newItem = { asin:   value };
        break;
      case 'price': newItem = { price:  value };
        break;
      case 'bids':  newItem = { bids:   value };
        break;
      case 'body':  newItem = { body:   value };
        break;
    }
    const newNote = Object.assign({}, note, newItem);
    this.setState({ note: newNote });
  }

  render() {
    if(!note || !note.id) return null;
    const { classes, note } = this.props
    const { title, asin, name, price, bids, body } = this.state.note;
    const isChanged = note.asin !== asin || note.price !== price
                   || note.bids !== bids || note.body  !== body;
    return <div className={classes.noteEdit}>
      <div className={classes.forms}>
        <RssForms changed={isChanged} value={title}
          onSave={this.handleSave.bind(this)}>
          <div className={classes.view}>
            <RssBody body={nextBody} />
          </div>
        </RssForms>
      </div>
      <div className={classes.list}>
        <RssItemList />
      </div>
    </div>;
  }
};

const barHeightSmDown   = 104;
const barHeightSmUp     = 112;
const searchHeight      = 62;
const titleHeight       = 62;
const formsHeight       = 62;
const editHeightSmDown  =
  `calc(100vh - ${barHeightSmDown}px - ${searchHeight}px)`;
const editHeightSmUp    =
  `calc(100vh - ${barHeightSmUp  }px - ${searchHeight}px)`;
const styles = theme => ({
  noteEdit: { display: 'flex', flexDirection: 'column'
            , height: editHeightSmDown
            , [theme.breakpoints.up('sm')]: { height: editHeightSmUp }}
, forms:    { borderBottom: '1px solid #CCC' }
, view:     { flex: '1 1 auto', overflow: 'auto'
            , position: 'relative'
            , padding: '20px 10px 10px 10px'
            , '&:before': {
              content: '"Preview"', display: 'inline-block'
              , position: 'absolute', top: 0, left: 0
              , backgroundColor: '#F5F5F5'
              , padding: '5px 10px', fontSize: '12px'
              , borderRight: '1px solid #CCC'
              , borderBottom: '1px solid #CCC' }}
, list:     {}
});

MarchantEdit.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(MarchantEdit);
