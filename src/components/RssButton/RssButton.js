import React          from 'react';
import PropTypes      from 'prop-types';

import { MuiThemeProvider, createMuiTheme }
                      from 'material-ui/styles';
import { Button }     from 'material-ui';
import orange         from 'material-ui/colors/orange';
import green          from 'material-ui/colors/green';
import blue           from 'material-ui/colors/blue';
import yellow         from 'material-ui/colors/yellow';

class RssButton extends React.Component {
  render() {
    const { classes, color, children, onClick } = this.props;
    return <MuiThemeProvider theme={thm[color]}>
      <Button
        className={classes}
        onClick={onClick}>{children}</Button>
    </MuiThemeProvider>;
  }
};

const thm = {
  blue: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: blue[500]
      , margin: '0 8px', height: 40
      , boxShadow: '0 1px 2px 0 rgba(0, 0, 0, .35)' }}}})
, skyblue: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: blue[300]
      , margin: '0 8px'
      , boxShadow: '0 1px 2px 0 rgba(0, 0, 0, .35)'
      , '&:hover':  { color: 'black'  }}}}})
, orange: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: orange[500]
      , margin: '0 8px'
      , boxShadow: '0 1px 2px 0 rgba(0, 0, 0, .35)'
      , '&:hover':  { color: 'black' }}}}})
, green: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: green[500]
      , margin: '0 8px'
      , boxShadow: '0 1px 2px 0 rgba(0, 0, 0, .35)'
      , '&:hover':  { color: 'black' }}}}})
, yellow: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: yellow[600]
      , margin: '0 8px'
      , boxShadow: '0 1px 2px 0 rgba(0, 0, 0, .35)'
      , '&:hover':  { color: 'black' }}}}})
};

export default RssButton;
