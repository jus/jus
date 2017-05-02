'use strict'

const postcssCssnext  = require("postcss-cssnext")
const path            = require('upath')

module.exports = {

  // Not used, is just like a comment
  // name: "what-ever-text works",

  // Check precedence: higher first to lower last
  priority: 50,

  filetype: 'stylesheet',

  // calls back with a result indicating whether file class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.css']
    return callback(null, allowedExtensions.indexOf(extension) > -1)
  },

  // called indirectly by `express` server in response for `GET` request
  render: (context, callback) => {
    const file = this

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
