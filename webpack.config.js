const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: 'development',
  devServer: {
    contentBase: path.join(__dirname, "dist/client.js"),
    compress: true,
    port: 9000,
    proxy: { 
        '/napi/*': { 
            target: 'ws://localhost:4000',
            ws: true,
        },
    },
  },
  entry: {
    client: "./src/client/index.js",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ["client"],
    }),
  ],
};
