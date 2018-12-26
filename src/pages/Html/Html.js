import dotenv             from 'dotenv';
import fs                 from 'fs';
import path               from 'path';
import url                from 'url';
import React              from 'react';
import PropTypes          from 'prop-types';
import ReactDOMServer     from 'react-dom/server';
import { SheetsRegistry } from 'react-jss';
import log                from 'Utilities/logutils';

import Static             from 'Pages/Static/Static';
import Icon               from 'Assets/image/favicon.ico';

const config = dotenv.config();
if(config.error) throw new Error(config.error);

const APP_NAME                = process.env.APP_NAME;
const ASSET_PATH              = process.env.ASSET_PATH;
const devMode                 = process.env.NODE_ENV === 'development';
const manifest_of_bundle_file = path.resolve(__dirname, '..', '..', 'dist', 'manifest.bundle.json');

class Html extends React.Component {
  setManifest(filepath) {
    log.info(Html.displayName, 'SSR manifest file:', filepath);
    try {
      return fs.readFileSync(filepath, 'utf8');
    } catch {
      const err = { name: 'NotFound', message: 'SSR manifest file not found.' };
      log.error(Html.displayName, err.name, err.message);
      throw new Error(err);
    }
  }

  render() {
    const { initialData, location } = this.props;
    const sheets        = new SheetsRegistry();
    const content       = ReactDOMServer.renderToString(<Static location={location} sheets={sheets}/>);
    const initialStyles = sheets.toString();
    const initialAssets = JSON.parse(this.setManifest(manifest_of_bundle_file));
    return <html>
      <head>
      <meta charSet="utf-8" />
      <title>{APP_NAME}</title>
      <link rel="shortcut icon" href={ Icon } />
      {devMode ? null : <link rel="stylesheet"    href={ url.resolve(ASSET_PATH, initialAssets['app.css']) }/>}
      </head>
      <body>
      <div id="app" dangerouslySetInnerHTML={{ __html: content }}></div>
      <style id="jss-server-side">{initialStyles}</style>
      <script id="initial-data" type="text/plain" data-init={initialData}></script>
      <script src={ url.resolve(ASSET_PATH, initialAssets['icon.js']) }></script>
      <script src={ url.resolve(ASSET_PATH, initialAssets['view.js']) }></script>
      <script src={ url.resolve(ASSET_PATH, initialAssets['app.js' ]) }></script>
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
