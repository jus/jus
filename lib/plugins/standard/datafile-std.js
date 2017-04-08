'use strict'

const fs              = require('fs-extra')
const path            = require('upath')
const yaml            = require('js-yaml')

module.exports = {

   // Used as the last failover to deduct file type class, just edit and uncomment
   // name: "what-ever-text including the filetype class works",

  // Check precedence: higher first to lower last
  priority: 10,

  // Optional because filetype could be assigned by filename or name attribute above
  filetype: 'datafile',

  // calls back with a boolean indicating whether this class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.json', '.yml', '.yaml']

    return callback(null, allowedExtensions.indexOf(extension) > -1)
  },

  parse: (file, callback) => {
    var data = null

    function isJSON () {
      return file.path.ext.toLowerCase() === '.json'
    }

    function isYML () {
      var ext = file.path.ext.toLowerCase()
      return ext === '.yml' || ext === '.yaml'
    }

    if (isJSON()) {
      // if not the first time, delete cache
      if (file.data) delete require.cache[require.resolve(file.path.full)]
      data = require(file.path.full)
    }

    if (isYML()) data = yaml.safeLoad(fs.readFileSync(file.path.full, 'utf8'))

    return callback(null, data)
  }
}
