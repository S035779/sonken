import React            from 'react';
import marked           from 'marked';
import PropTypes        from 'prop-types';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import noImg            from 'Main/noimage';

const kpa = '//dyn.keepa.com/pricehistory.png?cAmazon=0f5702&cNew=77ce43&cUsed=f26e3c&cFont=31393d&cBackground=ffffff&amazon=1&new=1&used=1&range=90&salesrank=1&domain=co.jp&width=1000&height=200&asin=';

class RssView extends React.Component {
  render() {
    //std.logInfo(RssView.displayName, 'Props', this.props);
    const {classes, note} = this.props;
    const link_img = note.AmazonImg === '' || !note.AmazonImg
      ? `data:image/png;base64,${noImg}`
      : note.AmazonImg;
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
, image:    { width: '15%', border: '1px solid #CCC' }
, graph:    { width: '80%', height: '100%', border: '1px solid #CCC' }
});
RssView.displayName = 'RssView';
RssView.defaultProps = { note: null };
RssView.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(RssView);
