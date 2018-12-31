import * as R             from 'ramda';
import path               from 'path';
import dotenv             from 'dotenv';
import React              from 'react';
import PropTypes          from 'prop-types';
import { renderToString } from 'react-dom/server';
import { SheetsRegistry } from 'react-jss';
import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server';
import app                from 'Utilities/apputils';

import Static             from 'Pages/Static/Static';

const config = dotenv.config();
if(config.error) throw new Error(config.error);

const APP_NAME = process.env.APP_NAME;
const devMode  = process.env.NODE_ENV === 'development';
const isAsync  = process.env.LOADABLE === 'async';
const manifest_of_bundle_file       = path.resolve(__dirname, '..', '..', 'dist', 'manifest.bundle.json');
const loadable_stats_of_bundle_file = path.resolve(__dirname, '..', '..', 'dist', 'loadable-stats.json');

class Html extends React.Component {
  renderStatic() {
    const { initialData, location } = this.props;
    const sheets        = new SheetsRegistry();
    const content       = renderToString(<Static location={location} sheets={sheets}/>);
    const initialAssets = app.manifest(manifest_of_bundle_file);
    const mapIndexed    = R.addIndex(R.map);
    const getValues     = R.map(key => initialAssets[key]);
    const assetKeys     = R.keys(initialAssets);
    const isScript      = R.test(/\.js$/);
    const hasScripts    = R.filter(isScript);
    const setScript     = (key, val) => <script key={key} src={val}></script>;
    const setScripts    = mapIndexed((val, idx) => setScript(idx, val));
    const isStyle       = R.test(/\.css$/);
    const hasStyles     = R.filter(isStyle);
    const setStyle      = (key, val) => devMode ? null : <link key={key} rel="stylesheet" href={val}/>;
    const setStyles     = mapIndexed((val, idx) => setStyle(idx, val));
    const initialStyles = sheets.toString();
    const bundleStyles  = R.compose(setStyles, getValues, hasStyles)(assetKeys);
    const bundleScripts = R.compose(setScripts, getValues, hasScripts)(assetKeys);
    return <html>
      <head>
      <meta charSet="utf-8" />
      <title>{APP_NAME}</title>
      <link rel="shortcut icon" href={'/favicon.ico'} />
      {bundleStyles}
      </head>
      <body>
      <div id="app" dangerouslySetInnerHTML={{ __html: content }}></div>
      <style id="jss-server-side">{initialStyles}</style>
      <script id="initial-data" type="text/plain" data-init={initialData}></script>
      {bundleScripts}
      </body>
      </html>;
  }

  renderAsync() {
    const { initialData, location } = this.props;
    const extractor     = new ChunkExtractor({ statsFile: loadable_stats_of_bundle_file, entrypoints: 'app' });
    const sheets        = new SheetsRegistry();
    const content       = renderToString(
      <ChunkExtractorManager extractor={extractor}>
        <Static location={location} sheets={sheets}/>
      </ChunkExtractorManager>
    );
    const initialStyles = sheets.toString();
    const initialLinks  = extractor.getLinkElements();
    const bundleStyles  = extractor.getStyleElements();
    const bundleScripts = extractor.getScriptElements();
    return <html>
      <head>
      <meta charSet="utf-8" />
      <title>{APP_NAME}</title>
      <link rel="shortcut icon" href={'/favicon.ico'} />
      {initialLinks}
      {bundleStyles}
      </head>
      <body>
      <div id="app" dangerouslySetInnerHTML={{ __html: content }}></div>
      <style id="jss-server-side">{initialStyles}</style>
      <script id="initial-data" type="text/plain" data-init={initialData}></script>
      {bundleScripts}
      </body>
      </html>;
  }

  render() {
    return isAsync ? this.renderAsync() : this.renderStatic();
  }
}
Html.displayName = 'Html';
Html.defaultProps = {};
Html.propTypes = {
  initialData: PropTypes.string.isRequired
, location: PropTypes.string.isRequired
};
export default Html;
