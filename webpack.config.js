const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
//  "?" quantifier of reqExp means bundle all .js file extensions followed by 0 or 1 "x"

// build browser bundles
// app.bundle.js which contains browser-rendering implementation
// vendor.bundle.js which contains node_modules dependencies
const browserConfig = {
  // make the context independent of CWD (Current Working directory) where node is instantiated
  // it's fixed to the absolute path of where "webpack.config.pjs" resides
  // take care that, when this configuration object is imported during runtime
  //   as in uiserver.js file
  // context will be resolved into the output directory of the bundled file "dist" in our case
  // so, in any file that imports this configuration object,
  //   context should be adjusted according to needs in that file
  context: __dirname,
  mode: 'development',
  target: 'web',
  entry: {
    app: ['./browser/App.jsx',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].bundle.js',
    publicPath: '/',
  },
  module: {
    // match these rules with the request modules
    // change how modules are treated by using loaders or parser
    rules: [
      {
        // the module should be with extension 'js' or 'jsx'
        // exclude any file from 'node-modules' directory from being parsed by "babel-loader"
        // Attention: files from "node_modules" will be bundled in output bundle
        //  but will ot be processed by "babel-loader"
        // in case of excluding files from being bundled, use top-level webpack property "externals"
        resource: {
          test: /\.jsx?$/,
          exclude: /node_modules/,
        },
        // use "babel" to compile matched files
        // configure babel to compile code to be compatible with the provided list
        //  of browser versions
        // also, compile React code to JS
        use: [
          {
            // loader: string
            loader: 'babel-loader',
            // options: string | object    (optional)
            options: {
              // presets: [presetEntry]
              presets: [
                // presetEntry = string | []
                ['@babel/preset-env', {
                  targets: {
                    ie: '11',
                    edge: '15',
                    safari: '10',
                    firefox: '50',
                    chrome: '49',
                  },
                  // use that when using core-js for polyfills and useBuiltins property
                  // useBuiltins: 'entry',
                  // corejs: '3.8.3'
                }],
                '@babel/preset-react',
              ],
            },
          },
        ],
      },
    ],
  },
  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks: 'all',
    },
  },
  // generate source-map for the code for debugging compiled bundle
  //   in original code format and modules in browser
  devtool: 'source-map',
  // clear the output directory of the previous build
  // define a global variable with default value true
  // this global variable is used in graphQLFetch
  plugins: [
    // new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new webpack.DefinePlugin({
      __isBrowser__: true,
    }),
  ],
};

// build server bundle for server-side rendering
const serverConfig = {
  // make the context independent of CWD (Current Working directory) where node is instantiated
  // it's fixed to the absolute path of where "webpack.config.pjs" resides
  // this configuration object is imported in webpack.serverHMR.js file
  // so, __dirname will be resolved to the location of that file not "webpack.config..js" file
  context: __dirname,
  mode: 'development',
  target: 'node',
  node: {
    // instruct webpack no to touch __dirname variable value and keep its native behavior
    // use __dirname to be the absolute path of the OUTPUT directory
    //  (dist) on server-side and (public) on client-side
    __dirname: false,
  },
  // exclude node_modules from being bundled in ui server backend code
  //  because the required "dependencies" of the Node app to function will be available at run time
  //  the "dependencies" are available at runtime by downloading listed dependencies in package.json
  // so WE DON'T NEED THEM TO BE IN THE BUNDLE AS THEY WILL BE DUPLICATED
  externals: [nodeExternals()],
  entry: { server: ['./server/uiserver.js'] },
  output: {
    // path property must be absolute path
    // create a directory called "dist" at the same level of "webpack.config.js" file
    // __dirname is considered the absolute path to attach "dist" to it
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        resource: {
          test: /\.jsx?$/,
        },
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  node: '10',
                },
              }],
              '@babel/preset-react',
            ],
          },
        },
      },
    ],
  },
  // generate source-map for the code for debugging compiled bundle
  //   in original code format and modules in browser
  devtool: 'source-map',
  // clear the output directory of the previous build
  // define a global variable with "false" as the default value
  // it is used in graphQLFetch.s to determine choosing the api endpoint for fetch request
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new webpack.DefinePlugin({
      __isBrowser__: false,
    }),
  ],
};

module.exports = [browserConfig, serverConfig];
