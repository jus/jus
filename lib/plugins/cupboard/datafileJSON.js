'use strict'

const path            = require('upath')

module.exports =  {

  // Not used, is just like a comment
  // name: "what-ever-text works",

  // Check precedence: higher first to lower last
  priority: 10,

  filetype: 'datafile',

  // calls back with a result indicating whether this class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.json']

    return callback(null, allowedExtensions.indexOf(extension) > -1)
  },

  parse: (file, callback) => {
    // TODO: Remove
    console.log(`Using plugin in ${__filename.replace(__dirname,'')} for file ${file.href}`)

    // if not the first time, delete cache
    if (file.data) delete require.cache[require.resolve(file.path.full)]
    let output = require(file.path.full)
    return callback(null, output)
  }

}
