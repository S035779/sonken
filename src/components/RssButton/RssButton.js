import React          from 'react';

import { MuiThemeProvider, createMuiTheme }
                      from '@material-ui/core/styles';
import { Button }     from '@material-ui/core';
import { fade }       from '@material-ui/core/styles/colorManipulator';
import orange         from '@material-ui/core/colors/orange';
import green          from '@material-ui/core/colors/green';
import blue           from '@material-ui/core/colors/blue';
import yellow         from '@material-ui/core/colors/yellow';

class RssButton extends React.Component {
  render() {
    const { classes, color, children, onClick, type, component, ...other } = this.props;
    return <MuiThemeProvider theme={theme[color]}>
      <Button type={type} className={classes} component={component} onClick={onClick} { ...other }>
        {children}
      </Button>
    </MuiThemeProvider>;
  }
}

const borderRadius = 4;
const margin = '0 8px';
const boxShadow = '0 1px 2px 0 rgba(0, 0, 0, .35)';
const common_white = '#FFF'
const default_color   = '#888888';
const primary_color   = '#477AF7';
const secondary_color = '#29CBEF';
const warning_color   = '#FEA634';
const success_color   = '#87CC16';
const danger_color    = '#FA404B';
const border = '1px solid';
const theme = {
  outlineDefault: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: common_white
    , color: default_color
    , border
    , borderColor: default_color
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: default_color
    , color: common_white
    }}
  , label: { textTransform: 'capitalize' }
  }
  }})
, outlinePrimary: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: common_white
    , color: primary_color
    , border
    , borderColor: primary_color
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: primary_color
    , color: common_white
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, outlineSecondary: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: common_white
    , color: secondary_color
    , border
    , borderColor: secondary_color
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: secondary_color
    , color: common_white
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, outlineWarning: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: common_white
    , color: warning_color
    , border
    , borderColor: warning_color
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: warning_color
    , color: common_white
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, outlineSuccess: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: common_white
    , color: success_color
    , border
    , borderColor: success_color
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: success_color
    , color: common_white
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, outlineDanger: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: common_white
    , color: danger_color
    , border
    , borderColor: danger_color
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: danger_color
    , color: common_white
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, flatWhite: createMuiTheme({ overrides: { MuiButton: {
    root: {
      color: common_white
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: fade(default_color, 0.12)
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, flatDefault: createMuiTheme({ overrides: { MuiButton: {
    root: {
      color: default_color
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: fade(default_color, 0.12)
    }}
  , label: { textTransform: 'capitalize' }
  }
  }})
, flatPrimary: createMuiTheme({ overrides: { MuiButton: {
    root: {
      color: primary_color
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: fade(primary_color, 0.12)
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, flatSecondary: createMuiTheme({ overrides: { MuiButton: {
    root: {
      color: secondary_color
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: fade(secondary_color, 0.12)
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, flatWarning: createMuiTheme({ overrides: { MuiButton: {
    root: {
      color: warning_color
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: fade(warning_color, 0.12)
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, flatSuccess: createMuiTheme({ overrides: { MuiButton: {
    root: {
      color: success_color
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: fade(success_color, 0.12)
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, flatDanger: createMuiTheme({ overrides: { MuiButton: {
    root: {
      color: danger_color
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: fade(danger_color, 0.12)
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, white: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: common_white
    , color: default_color
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: common_white
    , filter: 'brightness(90%)'
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, default: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: default_color
    , color: common_white
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: default_color
    , filter: 'brightness(90%)'
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, primary: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: primary_color
    , color: common_white
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: primary_color
    , filter: 'brightness(90%)'
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, secondary: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: secondary_color
    , color: common_white
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: secondary_color
    , filter: 'brightness(90%)'
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, warning: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: warning_color
    , color: common_white
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: warning_color
    , filter: 'brightness(90%)'
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, success: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: success_color
    , color: common_white
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: success_color
    , filter: 'brightness(90%)'
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, danger: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: danger_color
    , color: common_white
    , borderRadius
    , margin
    , fontWeight: 'normal'
    , '&:hover':  {
      backgroundColor: danger_color
    , filter: 'brightness(90%)'
    }}
  , label: { textTransform: 'capitalize' }
  }}})
, blue: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: blue[500]
      , margin
      , height: 40
      , boxShadow
    }}}})
, skyblue: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: blue[300]
      , margin
      , boxShadow
      , '&:hover':  { color: 'black'  }
    }}}})
, orange: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: orange[500]
      , margin
      , boxShadow
      , '&:hover':  { color: 'black' }
    }}}})
, green: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: green[500]
      , margin
      , boxShadow
      , '&:hover':  { color: 'black' }
    }}}})
, yellow: createMuiTheme({ overrides: { MuiButton: {
    root: {
      background: yellow[600]
      , margin
      , boxShadow
      , '&:hover':  { color: 'black' }
    }}}})
};
export default RssButton;
