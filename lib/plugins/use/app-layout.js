'use strict'

const path            = require('upath')

module.exports = {

  // Not used, is just like a comment
  // name: "what-ever-text works",

  // Check precedence: higher first to lower last
  priority: 30,

  filetype: 'layout',

  // calls back with a result indicating whether this class should process the given file.
  check (filename, callback) {
    return callback(null,
      !!filename.match(/\/layout.*\.(html|hbs|handlebars|markdown|md|mdown)$/i)
    )
  },

  parse (file, callback) {
    file.setName()
    file.getFrontmatter()
    return callback(null)
  }

}
