var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var ProgressBarPlugin = require('progress-bar-webpack-plugin')
var config = require('./build');

const host = 'http://localhost'
const port = 8000
const target = process.argv[2]

const hostMap = {
  xuncheng: 'http://gzns-waimai-dcloud30.gzns.iwm.name:8155'
}

for (var i in config.entry) {
    config.entry[i].unshift('webpack-dev-server/client?' + host + ':' + port, "webpack/hot/dev-server")
}


const compiler = webpack(config)
compiler.plugin('done', () => {
  console.log(`App is running at ${host}:${port}`)
})
const server = new WebpackDevServer(compiler, {
  historyApiFallback: true,
  hot: true,
  stats: {
      hash: true,
      version: true,
      timings: true,
      assets: true,
      color: true,
      chunks: false
  },
  proxy: [
      {
        context: ['/wlmine/**', '/logistics/**'],
        target: hostMap[target] || 'http://gzns-waimai-dcloud30.gzns.iwm.name:8155',
        changeOrigin: true,
        secure: false
      }
  ]
})
server.listen(port)