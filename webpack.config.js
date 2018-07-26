const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { resolve } = require("path");
const webpackMerge = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const modeConfig = env => require(`./build-utils/webpack.${env}`)(env);

module.exports = ({ mode } = { mode: "production" }) => {
  return webpackMerge(
    {
      mode,
      entry: { "price-graph": "./src/index.js" },
      output: {
        publicPath: ".",
        path: resolve(__dirname, "dist/"),
        filename: "[name].js",
        libraryTarget: "umd"
      },
      // output: { filename: "bundle.js" },
      plugins: [
        new CopyWebpackPlugin([
          {
            from: "src/manifest.json",
            transform: function(content, path) {
              // generates the manifest file using the package.json informations
              return Buffer.from(
                JSON.stringify({
                  description: process.env.npm_package_description,
                  version: process.env.npm_package_version,
                  ...JSON.parse(content.toString())
                })
              );
            }
          }
        ])
      ]
    },
    modeConfig(mode)
  );
};
