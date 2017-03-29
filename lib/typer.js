const fs              = require('fs')
const path            = require('upath')
const extensions      = require('./extensions')

module.exports = function typer (filename) {
  //TODO: Consider removing static method test in layout class (not used anywhere else)
  function test(filename) {
    return !!filename.match(/\/layout.*\.(html|hbs|handlebars|markdown|md|mdown)$/i)
  }

  var ext = path.extname(filename).toLowerCase().slice(1)
  var type = extensions[ext]
  if (test(filename)) type = 'layout'
  if (filename.endsWith('.min.js')) type = 'unknown'
  if (ext === 'svg') {
    if (fs.readFileSync(filename, 'utf8').indexOf('</font>') > -1) type = 'unknown'
  }
  if (!type) type = 'unknown'
  return type
}
