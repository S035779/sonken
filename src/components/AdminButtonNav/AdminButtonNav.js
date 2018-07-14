import React      from 'react';
import { Link }   from 'react-router-dom';
import PropTypes  from 'prop-types';

import { MuiThemeProvider, createMuiTheme } 
                  from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import orange     from '@material-ui/core/colors/orange';
import green      from '@material-ui/core/colors/green';
import blue       from '@material-ui/core/colors/blue';
import yellow     from '@material-ui/core/colors/yellow';

class AdminButtonNav extends React.Component {
  render() {
    return <MuiThemeProvider theme={thm}>
      <MuiThemeProvider theme={thm1}>
        <Button component={Link} to="/admin/users">ユーザ管理</Button>
      </MuiThemeProvider>
      <MuiThemeProvider theme={thm2}>
        <Button component={Link} to="/admin/approval">ユーザ承認</Button>
      </MuiThemeProvider>
      <MuiThemeProvider theme={thm3}>
        <Button component={Link} to="/admin/faq">FAQ作成</Button>
      </MuiThemeProvider>
      <MuiThemeProvider theme={thm4}>
        <Button component={Link} to="/admin/mail">メール作成</Button>
      </MuiThemeProvider>
      <Button component={Link} to="/faqs">FAQ</Button>
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
    , '&:hover':  { color: 'black' }
  }
}}});
const thm2 = outerThm => ({ ...outerThm, overrides: { MuiButton: {
  root: {
    background: orange[500], width: 138,  color: 'white'
    , margin: '0 8px'
    , boxShadow: '0 1px 2px 0 rgba(0, 0, 0, .35)'
    , '&:hover':  { color: 'black' }
  }
}}});
const thm3 = outerThm => ({ ...outerThm, overrides: { MuiButton: {
  root: {
    background: green[500], width: 138,  color: 'white'
    , margin: '0 8px'
    , boxShadow: '0 1px 2px 0 rgba(0, 0, 0, .35)'
    , '&:hover':  { color: 'black' }
  }
}}});
const thm4 = outerThm => ({ ...outerThm, overrides: { MuiButton: {
  root: {
    background: yellow[600], width: 138,  color: 'white'
    , margin: '0 8px'
    , boxShadow: '0 1px 2px 0 rgba(0, 0, 0, .35)'
    , '&:hover':  { color: 'black' }
  }
}}});

export default AdminButtonNav;
