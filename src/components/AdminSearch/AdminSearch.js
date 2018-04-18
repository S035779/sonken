import React            from 'react';
import PropTypes        from 'prop-types';
import UserAction       from 'Actions/UserAction';
import std              from 'Utilities/stdutils';

import { withStyles }   from 'material-ui/styles';
import { Select, Input, Button, Typography }
                        from 'material-ui';
import { InputLabel }   from 'material-ui/Input';
import { FormControl }  from 'material-ui/Form';
import { MenuItem }     from 'material-ui/Menu';
import RssButton        from 'Components/RssButton/RssButton';

class AdminSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage:    props.userNumber
    };
  }

  componentWillReceiveProps(nextProps) {
    //std.logInfo(AdminSearch.displayName, 'Props', nextProps);
    const { userPage } = nextProps;
    this.setState({ perPage: userPage.perPage });
  }

  handleChangeSelect(name, event) {
    const { admin, userNumber } = this.props;
    const value = event.target.value;
    std.logInfo(AdminSearch.displayName, 'handleChangeSelect', value);
    switch(name) {
      case 'page':
        UserAction.pagenation(admin, {
          maxNumber: Math.ceil(userNumber / value)
          , number: 1, perPage: value
        });
        this.setState({ perPage: value });
        break;
    }
  }

  render() {
    const { classes, userNumber, category } = this.props;
    const { url, perPage, filename } = this.state;
    const color = category === 'users' ? 'skyblue' : 'orange';
    return <div className={classes.userSearchs}>
      <div className={classes.results}>
        <Typography className={classes.title}>
          全{userNumber}件中{
            perPage > userNumber ? userNumber : perPage
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
};

const titleHeight = 62;
const minWidth = 125;
const buttonWidth = 88;
const styles = theme => ({
  userSearchs:{ display: 'flex', flexDirection: 'row'
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
AdminSearch.displayName = 'AdminSearch';
AdminSearch.defaultProps = {};
AdminSearch.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(AdminSearch);
