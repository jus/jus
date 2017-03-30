'use strict'

const path            = require('upath')
const findKey         = require('lodash').findKey
const pluralize       = require('inflection').pluralize

// default file type handlers inside module
var fileTypes         = require('require-dir')('./files')

module.exports = class Context {
  //
  //  Create an empty holding structure like:
  //
  //   {
  //      files: [],
  //      datafiles: [],
  //      unknowns: []
  //  }
  //
  //  ...from the plural of all the filenames on directory provided
  //
  constructor () {
    this.files =  [] // start with files array empty

    // TODO: Remove pluralize to remove this unnecesary renaming
    var types = Object.keys(fileTypes)
    types.forEach((type) => {
      var typePlural = pluralize(type).toLowerCase()
      Object.defineProperty(fileTypes, typePlural,
          Object.getOwnPropertyDescriptor(fileTypes, type));
      delete fileTypes[type];
    })
  }

  setHandler (fileHandlerPath) {
    // TODO: Remove pluralize and `toLowerCase()`
    var type = path.basename(fileHandlerPath, '.js').toLowerCase()
    var typePlural = pluralize(type)
    fileTypes[typePlural] = require(fileHandlerPath)
    this[typePlural] = this[typePlural] || []
  }

  newFile (filename, sourceDir, targetDir) {
    var type = findKey(fileTypes, (fileType, key) => {
      if (key === 'unknowns') return false
      var result = fileType.check(filename, (err, found) => {
        if (err) throw err
        return found
      })
      return result
    })
    if (!type) type = 'unknown'
    var typePlural = pluralize(type)
    return new fileTypes[typePlural](filename, sourceDir, targetDir)
  }
}
