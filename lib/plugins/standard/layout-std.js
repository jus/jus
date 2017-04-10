'use strict'

const path            = require('upath')

module.exports = {

   // Used as the last failover to deduct file type class, just edit and uncomment
   // name: "what-ever-text including the filetype class works",

  // Check precedence: higher first to lower last
  priority: 30,

  // Optional because filetype could be assigned by filename or name attribute above
  filetype: 'layout',

  // calls back with a boolean indicating whether this class should process the given file.
  check: (filename, callback) => {
    return callback(null,
      !!filename.match(/\/layout.*\.(html|hbs|handlebars|markdown|md|mdown)$/i)
    )
  },

  parse: (file, callback) => {
    file.setName()
    file.getFrontmatter()
    return callback(null)
  }

}
