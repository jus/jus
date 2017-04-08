'use strict'

const postcssCssnext  = require("postcss-cssnext")
const path            = require('upath')

module.exports = {

  priority: 50,

  filetype: 'stylesheet',

  // calls back with a boolean indicating whether file class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.css']
    return callback(null, allowedExtensions.indexOf(extension) > -1)
  },

  // called indirectly by `express` server in response for `GET` request
  render: (file, context, callback) => {

    // TODO: Remove
    console.log(`Using plugin in ${__filename.replace(__dirname,'')} for file ${file.href}`)

    postcssCssnext
      .process(file.input,{from: file.path.full, to: file.path.target.full})
      .then(result => {
        callback(null, result.css)
        return result
      })
  }

}
