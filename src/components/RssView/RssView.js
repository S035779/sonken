import React from 'react';
import marked from 'marked';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';

const kpa = '//dyn.keepa.com/pricehistory.png?domain=co.jp&asin=';
//const img = 'http://images-jp.amazon.com/images/P/';
//const imgfile = '.09.LZZZZZZZ.jpg';

class RssView extends React.Component {
  render() {
    const {classes, note} = this.props;
    const link_img = note.AmazonImg;//img + note.asin + imgfile;
    const link_kpa = kpa + note.asin;
    return <div className={classes.noteView}>
      <img className={classes.image} src={link_img} />
      <img className={classes.graph} src={link_kpa} />
    </div>;
  }
};

const rowHeight = 62;
const styles = theme => ({
  noteView: { display: 'flex', flexDirection: 'row'
            , alignItems: 'center', height: rowHeight * 4 - 30
            , justifyContent: 'space-around' }
, image:    { height: 100, border: '1px solid #CCC' }
, graph:    { height: 200, width: 500, border: '1px solid #CCC' }
});
RssView.displayName = 'RssView';
RssView.defaultProps = { note: null };
RssView.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssView);
