module.exports = {
  page: /\.(md|markdown|handlebars|hbs|html)$/i,
  image: /\.(gif|jpg|png|svg)$/i,
  dataFile: /\.(json)$/i,
  markdown: /\.(md|markdown)$/i,
  bitmap: /\.(gif|jpg|png)$/i,
  jpg: /\.(jpg)$/i,
  nested: /\/\w+\//,
  protocolRelativeUrl: /^\/\//,
  absoluteUrl: /https?:\/\//,
  index: /\/index$/,
  blacklist: /node_modules/,
}
