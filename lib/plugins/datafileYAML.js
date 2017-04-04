'use strict'

const fs              = require('fs-extra')
const path            = require('upath')
const yaml            = require('js-yaml')

module.exports = {
  // calls back with a boolean indicating whether this class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.yml', '.yaml']
    return callback(null, allowedExtensions.indexOf(extension) > -1)
  },

  parse: (file, callback) => {
    let output = yaml.safeLoad(fs.readFileSync(file.path.full, 'utf8'))

    return callback(null, output)
  }

}
