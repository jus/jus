'use strict'

module.exports = {
  // Check precedence: higher first to lower last
  priority: 0,

  // Optional because filetype could be assigned by filename or name attribute above
  filetype: 'unknown',

  // calls back with a result indicating whether this class should process the given file.
  check (filename, callback) {
    return callback(null, true) // catch all
  }

}
