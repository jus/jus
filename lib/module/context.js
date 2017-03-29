'use strict'

const pluralize       = require('inflection').pluralize
const extensions      = require('./extensions')
const typer           = require('./typer')
var fileTypes         = require('require-dir')('./files')
var opts

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
  constructor (_opts) {
    opts = _opts
    if (opts && opts.typesDir) {
      fileTypes = require('require-dir')(opts.typesDir)
      if (fileTypes.file) delete fileTypes.file
    }

    this.files =  [] // start with files array empty
    Object.keys(fileTypes).forEach(type => {
      const t = pluralize(type)
      this[t] = [] // add keys and initialize to an empty array
    })
  }

  newFile (filename, sourceDir, targetDir) {
    var type
    if (opts && opts.typer) {
      type = opts.typer(filename)
    } else {
      type = typer(filename)
    }
    return new fileTypes[type](filename, sourceDir, targetDir)
  }
}
