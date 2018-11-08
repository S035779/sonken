import dotenv             from 'dotenv';
import React              from 'react';
import PropTypes          from 'prop-types';
import ReactDOMServer     from 'react-dom/server';
import { SheetsRegistry } from 'react-jss';

import Static             from 'Pages/Static/Static';
import Icon               from 'Assets/image/favicon.ico';

const config = dotenv.config();
if(config.error) throw config.error;
const app_name    = process.env.APP_NAME;
const env         = process.env.NODE_ENV;
const host        = process.env.TOP_URL;
const assets      = process.env.ASSET_PATH;
let path_to_js;
let path_to_img;
let path_to_css;
if (env === 'development') {
  path_to_css = '/';
  path_to_js = '/'; 
  path_to_img = '/';
} else if (env === 'staging' || env === 'production') {
  path_to_css = host + assets + '/css/';
  path_to_js  = host + assets + '/js/';
  path_to_img = host + assets + '/image/';
}

const roboto_font = path_to_css + 'app.bundle.css';
//const roboto_font = 'https://fonts.googleapis.com/css?family=Roboto:300,400,500';
//const noto_font   = 'https://fonts.googleapis.com/earlyaccess/notosansjp.css';

class Html extends React.Component {
  render() {
    const { initialData, location } = this.props;
    const sheets = new SheetsRegistry();
    const content = ReactDOMServer.renderToString(<Static location={location} sheets={sheets}/>);
    const initialStyles = sheets.toString();
    return <html>
      <head>
      <meta charSet="utf-8" />
      <title>{app_name}</title>
      <link rel="shortcut icon" href={ path_to_img + Icon}/>
      <link rel="stylesheet"    href={ roboto_font }/>
      </head>
      <body style={styles}>
      <div id="app" dangerouslySetInnerHTML={{ __html: content }}></div>
      <style id="jss-server-side">{initialStyles}</style>
      <script id="initial-data" type="text/plain" data-init={initialData}></script>
      <script src={ path_to_js + "icon.bundle.js" }></script>
      <script src={ path_to_js + "view.bundle.js" }></script>
      <script src={ path_to_js + "app.bundle.js" }></script>
      </body>
      </html>;
  }
}
Html.displayName = 'Html';
Html.defaultProps = {};
Html.propTypes = {
  initialData: PropTypes.string.isRequired
, location: PropTypes.string.isRequired
};

const styles = {
  fontFamily: 'Noto Sans JP, sans-serif'
};
export default Html;
