module.exports = {
  blacklist: /node_modules/,
  page: /\.(md|markdown|handlebars|hbs|html)$/i,
  image: /\.(gif|jpg|png|svg)$/i,
  bitmap: /\.(gif|jpg|png)$/i,
  jpg: /\.(jpg)$/i,
  dataFile: /\.(json)$/i,
  nested: /\/\w+\//,
  protocolRelativeUrl: /^\/\//,
  absoluteUrl: /https?:\/\//,
  index: /\/index$/
}
