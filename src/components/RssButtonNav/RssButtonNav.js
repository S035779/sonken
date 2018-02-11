import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import { Button } from 'material-ui';
import orange from 'material-ui/colors/orange';
import green from 'material-ui/colors/green';
import blue from 'material-ui/colors/blue';
import yellow from 'material-ui/colors/yellow';

class RssButtonNav extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <MuiThemeProvider theme={thm}>
      <MuiThemeProvider theme={thm1}>
        <Button component={Link} to="/">商品RSS</Button>
      </MuiThemeProvider>
      <MuiThemeProvider theme={thm2}>
        <Button component={Link} to="/sellers">出品者RSS</Button>
      </MuiThemeProvider>
      <MuiThemeProvider theme={thm3}>
        <Button component={Link} to="/bids">入札リスト</Button>
      </MuiThemeProvider>
      <MuiThemeProvider theme={thm4}>
        <Button component={Link} to="/trade">取引チェック</Button>
      </MuiThemeProvider>
      <Button component={Link} to="/faq">FAQ</Button>
      <Button component={Link} to="/inquiry">お問い合わせ</Button>
    </MuiThemeProvider>;
  }
};

const thm = createMuiTheme({ overrides: { MuiButton: {
  root: {
    background: blue[500]
    , margin: '0 8px', height: 40
    , boxShadow: '0 1px 2px 0 rgba(0, 0, 0, .35)'
  }
}}});

const thm1 = outerThm => ({ ...outerThm, overrides: { MuiButton: {
  root: {
    background: blue[300], width: 138, color: 'white'
    , margin: '0 8px'
    , boxShadow: '0 1px 2px 0 rgba(0, 0, 0, .35)'
  }
}}});
const thm2 = outerThm => ({ ...outerThm, overrides: { MuiButton: {
  root: {
    background: orange[500], width: 138,  color: 'white'
    , margin: '0 8px'
    , boxShadow: '0 1px 2px 0 rgba(0, 0, 0, .35)'
  }
}}});
const thm3 = outerThm => ({ ...outerThm, overrides: { MuiButton: {
  root: {
    background: green[500], width: 138,  color: 'white'
    , margin: '0 8px'
    , boxShadow: '0 1px 2px 0 rgba(0, 0, 0, .35)'
  }
}}});
const thm4 = outerThm => ({ ...outerThm, overrides: { MuiButton: {
  root: {
    background: yellow[600], width: 138,  color: 'white'
    , margin: '0 8px'
    , boxShadow: '0 1px 2px 0 rgba(0, 0, 0, .35)'
  }
}}});

export default RssButtonNav;
