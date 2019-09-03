const path = require('path')
const openInEditor = require('launch-editor-middleware')
const history = require('connect-history-api-fallback')

const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

// Production
const prod = process.env.NODE_ENV === 'production'
// Version
const version = process.env.npm_package_version
// Base routere recommended use '/'
const baseRouter = `/${process.env.npm_package_name}/`

module.exports = {
  // Setting mode
  mode: prod ? 'production' : 'development',
  entry: {
    main: ['core-js/stable', 'regenerator-runtime/runtime', './src/main.js']
  },
  output: {
    // Package path
    path: path.resolve(__dirname, 'dist'),
    // Server access address
    publicPath: baseRouter,
    // Scripts file name
    filename: prod ? 'scripts/[chunkhash].js' : '[name].js?[hash:8]'
  },
  devServer: {
    host: 'localhost',
    port: 3000,
    open: true,
    publicPath: baseRouter,
    proxy: {
      '/api': {
        // Proxy target
        target: 'http://localhost:8080',
        // Needed for virtual hosted sites
        changeOrigin: true
      }
    },
    before (app) {
      // vue-devtools open .vue file
      app.use('/__open-in-editor', openInEditor())
      // Only vue-router history mode setting
      app.use(history({
        index: baseRouter + 'index.html'
      }))
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      // this will apply to both plain `.js` files
      // AND `<script>` blocks in `.vue` files
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        enforce: 'pre',
        test: /\.(js|vue)$/,
        // https://eslint.org/docs/user-guide/configuring#eslintignore
        loader: 'eslint-loader',
        options: { quiet: true }
      },
      // this will apply to both plain `.css` files
      // AND `<style>` blocks in `.vue` files
      {
        test: /\.css$/,
        use: [
          // This plugin extracts CSS into separate files
          {
            loader: prod ? MiniCssExtractPlugin.loader : 'vue-style-loader',
            options: { publicPath: '../' }
          },
          prod ? 'css-loader' : 'css-loader?sourceMap',
          prod ? 'postcss-loader' : 'postcss-loader?sourceMap'
        ]
      },
      // this will apply to both plain `.scss` files
      // AND `<style lang="scss">` blocks in `.vue` files
      {
        test: /\.scss$/,
        use: [
          {
            loader: prod ? MiniCssExtractPlugin.loader : 'vue-style-loader',
            options: { publicPath: '../' }
          },
          prod ? 'css-loader' : 'css-loader?sourceMap',
          {
            loader: prod ? 'sass-loader' : 'sass-loader?sourceMap',
            options: { implementation: require('sass') }
          },
          prod ? 'postcss-loader' : 'postcss-loader?sourceMap'
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          // limit 8Kb base64
          limit: '8192',
          name: prod ? 'images/[contenthash].[ext]' : '[name].[ext]?[hash:8]'
        }
      },
      {
        test: /\.(ttf|otf|woff|woff2|eot)$/,
        loader: 'file-loader',
        options: {
          name: prod ? 'fonts/[contenthash].[ext]' : '[name].[ext]?[hash:8]'
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      BASE_ROUTER: JSON.stringify(baseRouter)
    }),
    new MiniCssExtractPlugin({
      filename: prod ? 'styles/[contenthash].css' : '[name].css?[hash:8]'
    }),
    // clean dist
    new CleanWebpackPlugin(),
    // Plugin that simplifies creation of HTML files to serve your bundles
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      meta: { version: version }
    }),
    new CopyWebpackPlugin([{
      from: 'public',
      toType: 'dir'
    }])
  ],
  optimization: {
    // split chunks
    splitChunks: {
      chunks: 'all'
    },
    // split runtime
    runtimeChunk: {
      name: entrypoint => `runtime~${entrypoint.name}`
    }
  },
  resolve: {
    // import form ignore extension
    extensions: ['.js', '.vue', '.json'],
    alias: {
      // https://vuejs.org/v2/guide/installation.html#Explanation-of-Different-Builds
      vue$: 'vue/dist/vue.esm.js',
      // e.g. css ~@/assets/images, js @/components
      '@': path.resolve('src')
    }
  }
}
