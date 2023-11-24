const webpack = require("webpack");

const CopyWebpackPlugin = require("copy-webpack-plugin");

const SOURCE_VERSION =
  process.env.SOURCE_VERSION || process.env.npm_package_gitHead || "dev";

module.exports = (env) => {
  let outputPath = __dirname + "/public";
  let path = "src";
  let mode = "development";
  if (env.ghpages) {
    // GitHub pages expects static files here.
    outputPath = __dirname + "/../docs";
    mode = "production";
  }
  return {
    entry: {
      bundle: [`./${path}/app.js`],
    },
    output: {
      path: outputPath,
      filename: "app.js",
    },
    module: {
      rules: [
        {
          test: /\.xml$/,
          use: "raw-loader",
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          type: "asset/resource",
          generator: {
            filename: "[name][ext]",
          },
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "**/*.{html,css,woff,ttf,eot,svg,woff2,ico}",
            context: `${path}/`,
          },
        ],
      }),
      new webpack.DefinePlugin({
        "process.env.SOURCE_VERSION": JSON.stringify(SOURCE_VERSION || null),
      }),
    ],
    mode,
    devtool: "source-map",
  };
};
