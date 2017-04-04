'use strict'

const path            = require('upath')

module.exports = {
  // ********
  // plugin
  // ********
  // Every attribute is optional except `check:`
  // ... all other attributs have failover defaults

  // Defines "check(filename, ...)"s relative order
  // (lower means, least priority) only relevant when loading plugins array
  priority: 10,

  filetype: 'datafile',

  // calls back with a boolean indicating whether this class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.json', '.yml', '.yaml']

    return callback(null, allowedExtensions.indexOf(extension) > -1)
  },
/*
  // default to `newExt = oldExt`, if function absent
  toExt: (oldExt) => {
    var newExt = oldExt
    return newExt
  },
*/
  parse: (file, callback) => {
    var output = null

    function isJSON () {
      return file.path.ext.toLowerCase() === '.json'
    }

    function isYML () {
      var ext = file.path.ext.toLowerCase()
      return ext === '.yml' || ext === '.yaml'
    }

    if (isJSON()) {
      // if not the first time, delete cache
      if (file.data) delete require.cache[require.resolve(file.path.full)]
      output = require(file.path.full)
    }
    if (isYML()) output = yaml.safeLoad(fs.readFileSync(file.path.full, 'utf8'))
    return callback(null, output)
  }
/*
  transform: (file, callback) => {
    return callback(null, result)
  },

  mine: (file, callback) => {
    return callback(null, result)
  },

  branch: (file, callback) => {
    return callback(null, result)
  },

  render: (file, callback) => {
    return callback(null, result)
  },

  translate: (file, callback) => {
    return callback(null, result)
  }
*/
}
