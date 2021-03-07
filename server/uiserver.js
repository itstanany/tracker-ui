// use this in passing absolute path to express.static middleware and any function that
//  needed path other than "import/require"
import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import sourceMapSupport from 'source-map-support';
import proxy from 'http-proxy-middleware';
import render from './render.jsx';

// the "path" of env file is either
//  relative to root of node instance
// we start node server from root of project "ui"
// dotenv.config({ path: './sample.env' });
//  or absolute, and because we use webpack and __dirname
//   is the "output(dist)" directory, we pass the absolute path according to "dist" directory
// dotenv.config({ path: path.join(__dirname, '..', 'sample.env') });
dotenv.config({ path: './sample.env' });

sourceMapSupport.install();


const { PORT } = process.env;

if (!process.env.UI_API_ENDPOINT) {
  process.env.UI_API_ENDPOINT = 'https://issue-tracker-api-ahmedalima.herokuapp.com/graphql';
}

if (!process.env.UI_SERVER_API_ENDPOINT) {
  process.env.UI_SERVER_API_ENDPOINT = process.env.UI_API_ENDPOINT || 'https://issue-tracker-api-ahmedalima.herokuapp.com/graphql';
}

if (!process.env.UI_AUTH_ENDPOINT) {
  process.env.UI_AUTH_ENDPOINT = 'https://issue-tracker-api-ahmedalima.herokuapp.com/auth';
}

if (!process.env.GOOGLE_CLIENT_ID) {
  process.env.GOOGLE_CLIENT_ID = '1013320688463-u2u4vqrogofsjdoho6q918g9q9t9b8n2.apps.googleusercontent.com';
}

// create express app to handle request
const app = express();

// apply proxy if proxy target is defined in the environment
const apiProxyTarget = process.env.API_PROXY_TARGET;
if (apiProxyTarget) {
  app.use('/graphql', proxy({ target: apiProxyTarget, changeOrigin: true }));
  app.use('/auth', proxy({ target: apiProxyTarget, changeOrigin: true }));
}


// HMR for browser rendering = During development only
const enableHMR = (process.env.ENABLE_HMR || 'true') === 'true';
if (enableHMR && process.env.NODE_ENV !== 'production') {
  console.log('Adding Dev Middleware and HMR Middleware');
  /* eslint-disable global-require */
  /* eslint-disable import/no-extraneous-dependencies */
  const webpack = require('webpack');
  const devMiddleware = require('webpack-dev-middleware');
  const hotMiddleware = require('webpack-hot-middleware');
  // browser configuration
  const config = require('../webpack.config.js')[0];
  // change the context to be the root directory of the project out of the "dist" directory
  //   where this file bundled and __dirname refers to in the original configuration object
  config.context = path.join(__dirname, '..');
  // make HMR an entry point to the output bundle
  config.entry.app.push('webpack-hot-middleware/client');
  // add HMR plugin to the configuration object
  config.plugins = config.plugins || [];
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  // generate webpack Compiler object instance required for webpack devmiddleware and HMR
  const compiler = webpack(config);
  // dev server middleware to serve static bundles
  app.use(devMiddleware(compiler));
  // middleware to emit HMR increments to the browser
  app.use(hotMiddleware(compiler));
}

app.get('/env.js', (req, res) => {
  /**
   * pass environment variables values from backend to client as global variable on window object
   */
  const env = {
    UI_API_ENDPOINT: process.env.UI_API_ENDPOINT,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    UI_AUTH_ENDPOINT: process.env.UI_AUTH_ENDPOINT,
  };
  res.send(`window.ENV=${JSON.stringify(env)}`);
});

// serve static files
// here the path is resolved during runtime and this file directory will be "dist"
// So, we pass to express.static an absolute path to "public" director where static assets resides
app.use(express.static(path.join(__dirname, '..', 'public')));


// we used use app.get because we want respond with the server-side-rendered HTML
//  when receiving GET request
// also, in render function, we make use "req.url" property and this property
//  is changed by "app.use",
//  see file MERN Notes https://docs.google.com/document/d/1x0XTxT6hpftKklniJQvB3QIaD7eTtMpnDCOb2DCzHc0/
// "*" wildcard path pattern in express matches with any depth of paths "level1/level2/level3/ ..."
// and "req.url" will contains all route paths and query string as
//  it is inherited from req.url of http node module
app.get('*', (req, res, next) => {
  render(req, res, next);
});

app.listen(PORT, () => {
  console.log(`UI Server started Listening at PORT ${PORT}`);
});

if (module.hot) {
  module.hot.accept('./render.jsx', () => {
    console.log('Accepted Update for "render.jsx".');
  });
}
