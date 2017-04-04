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
  priority: 30,

  filetype: 'layout',

  // calls back with a boolean indicating whether this class should process the given file.
  check: (filename, callback) => {
    return callback(null,
      !!filename.match(/\/layout.*\.(html|hbs|handlebars|markdown|md|mdown)$/i)
    )
  }

/*
  transform: (file, callback) => {
    return callback(null, result)
  },

*/
}
