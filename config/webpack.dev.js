const webpack = require("webpack");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const paths = require("./paths");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = merge(common, {
  target: "web",
  devtool: "inline-source-map",

  devServer: {
    contentBase: paths.build,
    https: false,
    host: "0.0.0.0",
    port: "8888",
    hot: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },

  module: {
    rules: [
      // Styles: Inject CSS into the head with source maps
      {
        test: /\.(scss|css)$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              importLoaders: 1,
              modules: false,
              url: false,
            },
          },
          { loader: "postcss-loader", options: { sourceMap: true } },
          { loader: "sass-loader", options: { sourceMap: true } },
        ],
      },
    ],
  },

  plugins: [
    // Only update what has changed on hot reload
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: "styles/[name].[contenthash].css",
      chunkFilename: "[id].css",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.public,
          to: "",
          globOptions: {
            ignore: ["*.DS_Store"],
          },
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
});
