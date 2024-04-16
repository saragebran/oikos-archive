const {merge} = require("webpack-merge");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",

  output: {
    filename: "[name].[fullhash:5].js",
    chunkFilename: "[id].[fullhash:5].css",
    path: path.resolve(__dirname, "dist")
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          sourceMap: true,
        },
        exclude: /\/node_modules\//,
      }),
      // Remove or comment out the CssMinimizerPlugin to disable CSS minification
      // new CssMinimizerPlugin(),
    ]
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader"
        ]
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[fullhash:5].css",
      chunkFilename: "[id].[fullhash:5].css"
    })
  ]
});
