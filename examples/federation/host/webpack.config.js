const ModuleFederationPlugin = require('webpack').container
  .ModuleFederationPlugin
const path = require('path')

module.exports = {
  entry: './src/bootstrap',
  mode: 'development',
  devServer: {
    contentBase: [path.join(__dirname, 'public'), path.join(__dirname, 'dist')],
    port: 3001,
  },
  output: {
    publicPath: 'auto',
    library: {
      type: 'umd',
      name: 'bootstrap',
      export: 'default',
    },
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-typescript'],
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
    }),
  ],
}
