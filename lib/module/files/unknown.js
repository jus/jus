'use strict'

const File            = require('../basefile')

module.exports = class Unknown extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir)
  }

  // calls back with a boolean indicating whether this class should process the given file.
  static check (filename, callback) {
    return callback(null, true)
  }

  squeeze() {
    this.squeezed = true
  }

}
