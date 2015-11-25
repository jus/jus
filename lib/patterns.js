module.exports = {
  blacklist: /node_modules/,
  page: /\.(md|markdown|html)$/i,
  image: /\.(gif|jpg|png|svg)$/i,
  bitmap: /\.(gif|jpg|png)$/i,
  jpg: /\.(jpg)$/i,
  json: /\.(json)$/i,
  nested: /\/\w+\//,
  protocolRelativeUrl: /^\/\//,
  absoluteUrl: /https?:\/\//,
  index: /\/index$/,
  handlebarsy: /\{\{/
}
