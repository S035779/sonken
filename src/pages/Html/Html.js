import path               from 'path';
import dotenv             from 'dotenv';
import React              from 'react';
import PropTypes          from 'prop-types';
import ReactDOMServer     from 'react-dom/server';
import { SheetsRegistry } from 'react-jss';
import app                from 'Utilities/apputils';

import Static             from 'Pages/Static/Static';

const config = dotenv.config();
if(config.error) throw new Error(config.error);

const APP_NAME                = process.env.APP_NAME;
const devMode                 = process.env.NODE_ENV === 'development';
const manifest_of_bundle_file = path.resolve(__dirname, '..', '..', 'dist', 'manifest.bundle.json');

class Html extends React.Component {
  render() {
    const { initialData, location } = this.props;
    const sheets        = new SheetsRegistry();
    const content       = ReactDOMServer.renderToString(<Static location={location} sheets={sheets}/>);
    const initialStyles = sheets.toString();
    const initialAssets = app.manifest(manifest_of_bundle_file);
    return <html>
      <head>
      <meta charSet="utf-8" />
      <title>{APP_NAME}</title>
      <link rel="shortcut icon" href={ '/favicon.ico' } />
      {devMode ? null : <link rel="stylesheet"    href={ initialAssets['app.css'] }/>}
      </head>
      <body>
      <div id="app" dangerouslySetInnerHTML={{ __html: content }}></div>
      <style id="jss-server-side">{initialStyles}</style>
      <script id="initial-data" type="text/plain" data-init={initialData}></script>
      <script src={ initialAssets['icon.js'] }></script>
      <script src={ initialAssets['view.js'] }></script>
      <script src={ initialAssets['app.js' ] }></script>
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
export default Html;
