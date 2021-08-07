const HtmlWebpackPlugin = require('html-webpack-plugin')
const ModuleFederationPlugin = require('webpack').container
  .ModuleFederationPlugin
const path = require('path')

const dependencies = require('./package.json').dependencies

module.exports = {
  entry: './src/index',
  mode: 'development',
  devServer: {
    contentBase: [path.join(__dirname, 'dist')],
    port: 3002,
  },
  output: {
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
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
          presets: ['@babel/preset-react', '@babel/preset-typescript'],
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@portals/react': path.resolve(__dirname, '../../../packages/react/src'),
      '@portals/provider': path.resolve(
        __dirname,
        '../../../packages/provider/src',
      ),
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'useCaseOne',
      filename: 'remoteEntry.js',
      exposes: {
        './entry': './src/entry',
      },
      shared: {
        ...dependencies,
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
}
