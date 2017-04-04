'use strict'

module.exports = {
  // ********
  // plugin
  // ********
  // Every attribute is optional except `check:`
  // ... all other attributs have failover defaults

  // Defines "check(filename, ...)"s relative order
  // (lower means, least priority) only relevant when loading plugins array
  priority: 0,

  filetype: 'unknown',

  // calls back with a boolean indicating whether this class should process the given file.
  check: (filename, callback) => {
    return callback(null, true) // catch all
  }
/*
  // default to `newExt = oldExt`, if function absent
  toExt: (oldExt) => {
    var newExt = oldExt
    return newExt
  },
*/
}
