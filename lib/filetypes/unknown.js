'use strict'

const path            = require('upath')
const File            = require('../file')

module.exports = class Unknown extends File {

  constructor(filepath, sourceDir, targetDir, plugin) {
    super(filepath, sourceDir, targetDir, plugin)

    // Avoid reading with `this.read()` (to save memory and time)
    this.isReadable = false
  }

  read () {
    // No-op. `Unknown` class does not read files at all.
    // This function placeholder needs to be here to override `File` class read ()
  }


}
