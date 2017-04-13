'use strict'

const fs              = require('fs-extra')
const path            = require('upath')
const yaml            = require('js-yaml')

module.exports = {
  // Not used, is just like a comment
  // name: "what-ever-text works",

  // Check precedence: higher first to lower last
  priority: 10,

  filetype: 'datafile',

  // calls back with a result indicating whether this class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.yml', '.yaml']
    return callback(null, allowedExtensions.indexOf(extension) > -1)
  },

  parse: (file, callback) => {
    // TODO: Remove
    console.log(`Using plugin in ${__filename.replace(__dirname,'')} for file ${file.href}`)

    let output = yaml.safeLoad(fs.readFileSync(file.path.full, 'utf8'))

    return callback(null, output)
  }

}
