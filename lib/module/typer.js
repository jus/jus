const fs              = require('fs')
const path            = require('upath')
const extensions      = require('./extensions')

module.exports = function typer (filename) {
  var ext = path.extname(filename).toLowerCase().slice(1)
  var type = extensions[ext]
  if (!type) type = 'unknown'
  return type
}
