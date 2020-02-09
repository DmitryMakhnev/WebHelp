const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');

const NODE_ENV = process.env.NODE_ENV || 'development';

const isEnvDevelopment = NODE_ENV === 'development';
const isEnvProduction = NODE_ENV === 'production';

const prodOrDev = (prod, dev) => (isEnvProduction ? prod : dev);

const plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    WEB_HELP_API_ROOT_URL: JSON.stringify('/api'),
    WEB_HELP_OUTSIDE_API: '(window.JB_WEB_HELP_API || (window.JB_WEB_HELP_API = {}))',
  }),
  new CleanWebpackPlugin(),
  new HtmlWebpackPlugin({
    template: './src/index.html',
    minify: prodOrDev(
      {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      false,
    ),
  }),
  new MiniCssExtractPlugin({
    filename: prodOrDev(
      'static/styles/[name].[contenthash:8].css',
      '[name].css',
    ),
    chunkFilename: prodOrDev(
      'static/styles/[name].[contenthash:8].css',
      '[id].css',
    ),
    ignoreOrder: false,
  }),
];

if (isEnvDevelopment) {
  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
  );
}

module.exports = {

  entry: './src/app/main.tsx',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: prodOrDev(
      'static/js/[name].[contenthash:8].js',
      'static/js/[name].bundle.js',
    ),
    chunkFilename: prodOrDev(
      'static/js/[name].[contenthash:8].chunk.js',
      'static/js/[name].chunk.js',
    ),
    futureEmitAssets: true,
  },

  mode: NODE_ENV,

  devtool: prodOrDev(
    false,
    'cheap-module-source-map',
  ),
  devServer: {
    publicPath: '/',
    hot: isEnvDevelopment,
    port: 3001,
    proxy: {
      '/api': 'http://localhost:3002',
    },
  },

  optimization: {
    minimize: isEnvProduction,
    minimizer: [
      // It's settings from
      // https://github.com/facebook/create-react-app/blob/v3.3.0/packages/react-scripts/config/webpack.config.js#L217
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          parser: safePostCssParser,
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      name: false,
    },
  },

  plugins,

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  module: {
    rules: [

      {
        test: /\.scss$/i,
        use: [
          // I know that repo with loader is archived
          // but MiniCssExtractPlugin and extract-css-chunks-webpack-plugin
          // had problems with hmr for css-modules.
          // I'd like to invest more time for finding better solution
          // after main tasks well be ready
          // I think tht scooped css classes names during all modes are important
          'css-hot-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: {
                localIdentName: prodOrDev(
                  '[hash:base64]',
                  '[name]__[local]--[hash:base64:5]',
                ),
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                autoprefixer(),
              ],
            },
          },
          'sass-loader',
        ],
      },

      // TODO [dmitry.makhnev]: https://github.com/formatjs/react-intl/blob/master/docs/Getting-Started.md#esm-build
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },

      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        loader: 'file-loader',
        options: {
          name: prodOrDev(
            'static/media/[contenthash].[ext]',
            'static/media/[name].[hash:8].[ext]',
          ),
        },
      },
    ],
  },
};
