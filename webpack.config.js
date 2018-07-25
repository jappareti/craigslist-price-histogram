const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpackMerge = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const modeConfig = env => require(`./build-utils/webpack.${env}`)(env);

module.exports = ({ mode } = { mode: "production" }) => {
  return webpackMerge(
    {
      mode,
      output: { filename: "bundle.js" },
      plugins: [
        new HtmlWebpackPlugin({
          template: "./src/index.html",
          filename: "index.html",
          inject: "body"
        }),
        new CopyWebpackPlugin([{ from: "data" }])
      ]
    },
    modeConfig(mode)
  );
};
