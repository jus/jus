'use strict'

module.exports = {

   // Used as the last failover to deduct file type class, just edit and uncomment
   // name: "what-ever-text including the filetype class works",

  // Check precedence: higher first to lower last
  priority: 0,

  // Optional because filetype could be assigned by filename or name attribute above
  filetype: 'unknown',

  // calls back with a boolean indicating whether this class should process the given file.
  check: (filename, callback) => {
    return callback(null, true) // catch all
  }

}
