const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const SOURCE_VERSION = process.env.SOURCE_VERSION || process.env.npm_package_gitHead || 'dev';

module.exports = (env) => {

  let outputPath = __dirname + '/public';
  if (env.production) {

    // We expect the Visual debugger project in the same folder as this project.
    outputPath = __dirname + '/../../../VisualDebugger/src/main/resources/ui';
  }
  return {
    entry: {
      bundle: [ './app/app.js' ],
    },
    output: {
      path: outputPath,
      filename: 'app.js',
    },
    module: {
      rules: [
        {
          test: /\.xml$/,
          use: 'raw-loader',
        },
        {
          test: /\.css$/i,
          use: [ 'style-loader', 'css-loader' ],
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          use: [ 'file-loader' ],
        },
        {
          test: /\.less$/i,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'less-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        }
      ],
    },
    plugins: [
      new CopyWebpackPlugin({ patterns: [ { from: '**/*.{html,css,woff,ttf,eot,svg,woff2,ico}', context: 'app/' } ] }),
      new webpack.DefinePlugin({
        'process.env.SOURCE_VERSION': JSON.stringify(SOURCE_VERSION || null)
      }),
    ],
    mode: 'development',
    devtool: 'source-map',
  };
};