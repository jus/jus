'use strict'

const path            = require('upath')

module.exports =  {
  // calls back with a boolean indicating whether this class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.json']

    return callback(null, allowedExtensions.indexOf(extension) > -1)
  },

  parse: (file, callback) => {
    // if not the first time, delete cache
    if (file.data) delete require.cache[require.resolve(file.path.full)]
    let output = require(file.path.full)
    return callback(null, output)
  }

}
