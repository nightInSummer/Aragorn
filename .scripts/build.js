const webpack = require('webpack')
const path = require('path')
const glob = require('glob')
const WebpackDevServer = require('webpack-dev-server')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CheckerPlugin } = require('awesome-typescript-loader')
const debug = process.env.NODE_ENV !== 'production'
// >>>> utils
const getEntry = (globPath, pathDir) => {
    let files = glob.sync(globPath);
    let entries = {},
        entry, dirname, basename, pathname, extname;
    for (let i = 0; i < files.length; i++) {
        entry = files[i];
        dirname = path.dirname(entry);
        extname = path.extname(entry);
        basename = path.basename(entry, extname);
        pathname = path.join(dirname, basename);
        pathname = pathname.replace(/\\/g, '/');
        pathname = pathDir ? pathname.replace(new RegExp('^' + pathDir), '') : pathname;
        entries[pathname] = ['./' + entry];
    }
    return entries;
};
// >>>> host & port
const host = 'http://localhost'
const port = 8000
// >>>> config
const entries = getEntry('src/ts/page/**/index.*', 'src/ts/page/')
const chunks = Object.keys(entries)
const config = {
  entry: entries,
  output: {
    path: path.join(__dirname, '../public'),
    publicPath: '/',
    filename: 'scripts/[name].js',
    chunkFilename: 'scripts/[id].chunk.js?[chunkhash]'
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        include: path.join(__dirname, '../src/ts')        
      }, {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract([ 'style-loader', 'css-loader' ]),
        include: path.join(__dirname, '../src')
      }, {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract([ 'css-loader', 'less-loader' ]),
        include: path.join(__dirname, '../src')
      }, {
        test: /\.html$/,
        loader: "html-loader?-minimize",
        include: path.join(__dirname, '../src/view')
      }, {
        test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader?name=fonts/[name].[ext]',
        include: path.join(__dirname, '../src/img')
      }, {
        test: /\.(png|jpe?g|gif)$/,
        loader: 'url-loader?limit=8192&name=imgs/[name]-[hash].[ext]',
        include: path.join(__dirname, '../src/img')
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      JSX: 'snabbdom-jsx'
    }),
    new CheckerPlugin(),
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('../manifest.json'),
      name: 'dll'
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendors',
        chunks: chunks,
        minChunks: chunks.length
    }),
    new ExtractTextPlugin('styles/[name].css'),
    debug
    ? function() {}
    : new UglifyJsPlugin({
        compress: {
            warnings: false
        },
        except: ['exports', 'require']
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.SourceMapDevToolPlugin(
      {
        include: chunks.map(name => 'scripts/' + name + '.js'),
        exclude: 'vendors',
        columns: false,
        module: true
      }
    ),
    new ProgressBarPlugin()
  ]
}
// >>>> html
const pages = Object.keys(getEntry('src/view/**/*.html', 'src/view/'));
pages.forEach(function(pathname) {
    let conf = {
        filename: pathname + '.html',
        template: 'src/view/' + pathname + '.html',
        inject: false
    };
    if (pathname in config.entry) {
        conf.favicon = 'src/img/favicon.ico';
        conf.inject = 'body';
        conf.chunks = ['vendors', pathname];
        conf.hash = true;
    }
    config.plugins.push(new HtmlWebpackPlugin(conf));
});

module.exports = config;
