module.exports = {
  publicPath: '',
  configureWebpack: {
    target: 'electron-renderer',
    entry: './src/renderer/main.js'
  }
}