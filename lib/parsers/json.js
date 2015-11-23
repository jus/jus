const fs = require('fs')
const path = require('path')

const patterns = require('../patterns')

module.exports = function parseJSON(filepath, baseDir) {

  var json = {
    name: null,
    href: null,
    fullPath: filepath,
    relativePath: filepath.replace(baseDir, ''),
    relativeDirName: path.dirname(filepath.replace(baseDir, '')),
    data: require(filepath)
  }

  json.href = json.relativePath

  // name is the filename without JSON on the end
  json.name = path.basename(json.href).replace(patterns.json, '')

  return json
}
