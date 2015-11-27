const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const patterns = require('../patterns')

module.exports = function parseDataFile(filepath, baseDir) {

  var dataFile = {
    name: null,
    href: null,
    fullPath: filepath,
    filename: path.basename(filepath),
    extension: path.extname(filepath),
    relativePath: filepath.replace(baseDir, ''),
    parent: path.dirname(filepath.replace(baseDir, ''))
  }

  dataFile.href = dataFile.relativePath
  dataFile.name = path.basename(dataFile.href).replace(patterns.dataFile, '')

  if (dataFile.extension.match(patterns.json)) {
    dataFile.data = require(filepath)
  }

  if (dataFile.extension.match(patterns.yml)) {
    dataFile.data = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'))
  }

  return dataFile
}
