import React            from 'react';
import PropTypes        from 'prop-types';
import FaqAction        from 'Actions/FaqAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from '@material-ui/core/styles';
import { Select, Typography, FormControl, MenuItem, InputLabel } from '@material-ui/core';

class FaqSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage:    props.faqNumber
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(FaqSearch.displayName, 'Props', nextProps);
    const { faqPage } = nextProps;
    this.setState({ perPage: faqPage.perPage });
  }

  handleChangeSelect(name, event) {
    const { admin, faqNumber } = this.props;
    const value = event.target.value;
    std.logInfo(FaqSearch.displayName, 'handleChangeSelect', value);
    switch(name) {
      case 'page':
        FaqAction.pagenation(admin, {
          maxNumber: Math.ceil(faqNumber / value)
          , number: 1, perPage: value
        });
        this.setState({ perPage: value });
        break;
    }
  }

  render() {
    const { classes, faqNumber } = this.props;
    const { perPage } = this.state;
    return <div className={classes.faqSearchs}>
      <div className={classes.results}>
        <Typography className={classes.title}>
          全{faqNumber}件中{
            perPage > faqNumber ? faqNumber : perPage
          }件表示
        </Typography>
      </div>
      <FormControl className={classes.inputSelect}>
        <InputLabel htmlFor="results">表示件数</InputLabel>
        <Select value={perPage}
          onChange={this.handleChangeSelect.bind(this, 'page')}>
          <MenuItem value={9999}><em>All</em></MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={300}>300</MenuItem>
        </Select>
      </FormControl>
      <div className={classes.inputText} />
      <div className={classes.buttons}>
        <div className={classes.button} />
        <div className={classes.space} />
        <div classes={classes.button} />
        <div classes={classes.button} />
      </div>
    </div>;
  }
}
FaqSearch.displayName = 'FaqSearch';
FaqSearch.defaultProps = {};
FaqSearch.propTypes = {
  classes: PropTypes.object.isRequired
, faqNumber: PropTypes.number.isRequired
, faqPage: PropTypes.object.isRequired
, admin: PropTypes.string.isRequired
};

const titleHeight = 62;
const minWidth = 125;
const buttonWidth = 88;
const styles = theme => ({
  faqSearchs:{ display: 'flex', flexDirection: 'row'
              , alignItems: 'stretch'
              , height: titleHeight, minHeight: titleHeight
              , boxSizing: 'border-box'
              , padding: '5px'
              , overflow: 'hidden' }
, inputSelect:{ margin: theme.spacing.unit / 3 + 1, minWidth }
, inputText:  { flex: 2, minWidth: minWidth * 2 }
, buttons:    { flex: 0, display: 'flex', flexDirection: 'row' }
, button:     { flex: 1, width: buttonWidth
              , margin: theme.spacing.unit /2
              , wordBreak: 'keep-all', padding: 4 }
, results:    { flex: 1, minWidth
              , display: 'flex'
              , justifyContent: 'center', alignItems: 'flex-end' }
, title:      { wordBreak: 'keep-all' }
, space:      { flex: 0, margin: theme.spacing.unit }
});
export default withStyles(styles)(FaqSearch);
