'use strict'

const pluralize       = require('inflection').pluralize
// const primitives      = require('require-dir')('../files')
var fileTypes      = require('require-dir')('./files')

module.exports = class Context {
  //
  //  Create an empty holding structure like:
  //
  //   {
  //      files: [],
  //      datafiles: [],
  //      images: [],
  //      layouts: [],
  //      scripts: [],
  //      stylesheets: [],
  //      unknowns: []
  //  }
  //
  //  ...from the plural of all the filenames on directory provided
  //
  constructor (_customFilesDir) {
    var fileTypes

    if (_customFilesDir) {
      fileTypes = require('require-dir')(_customFilesDir)
      if (fileTypes.file) delete fileTypes.file
    }

    this.files =  [] // start with files array empty
    Object.keys(fileTypes).forEach(type => {
      const t = pluralize(type)
      this[t] = [] // add primitive keys and initialize to an empty array
    })
    this.fileTypes = fileTypes
  }
}
