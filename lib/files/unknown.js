'use strict'

const fs              = require('fs')
const path            = require('upath')
const File            = require('./file')

module.exports = class Unknown extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  // calls back with a boolean indicating whether this class should process the given file.
  static check (filename, callback) {
    return callback(null, true)
  }

  squeeze() {
    this.squeezed = true
  }

}
