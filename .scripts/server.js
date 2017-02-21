var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var ProgressBarPlugin = require('progress-bar-webpack-plugin')
var config = require('./build');

const host = 'http://localhost'
const port = 8000



for (var i in config.entry) {
    config.entry[i].unshift('webpack-dev-server/client?' + host + ':' + port, "webpack/hot/dev-server")
}
config.plugins.push(new webpack.HotModuleReplacementPlugin());


const compiler = webpack(config)
compiler.plugin('done', () => {
  console.log(`App is running at ${host}:${port}`)
})
const server = new WebpackDevServer(compiler, {
  historyApiFallback: true,
  hot: true,
  stats: 'errors-only'
})
server.listen(port)