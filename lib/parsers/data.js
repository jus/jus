const fs = require('fs')
const path = require('path')

const patterns = require('../patterns')

module.exports = function parseDataFile(filepath, baseDir) {

  var dataFile = {
    name: null,
    href: null,
    fullPath: filepath,
    relativePath: filepath.replace(baseDir, ''),
    parent: path.dirname(filepath.replace(baseDir, '')),
    data: require(filepath)
  }

  dataFile.href = dataFile.relativePath
  dataFile.name = path.basename(dataFile.href).replace(patterns.dataFile, '')

  return dataFile
}
