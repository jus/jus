'use strict'

const fs              = require('fs')
const path            = require('upath')
const File            = require('./file')

module.exports = class Unknown extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir)
    this.setTargetPathsAndHref(sourceDir, targetDir)
  }

  // calls back with a boolean indicating whether this class should process the given file.
  static check (filename, callback) {
    return callback(null, true)
  }

  setTargetPathsAndHref(sourceDir, targetDir) {
    var targetExt = this.path.ext.toLowerCase()
    var targetFull = this.path.full
      .replace(sourceDir, targetDir)
      .replace(this.path.ext, targetExt)

    this.path.target = {
      full: targetFull,
      relative: targetFull.replace(targetDir, '')
    }

    Object.assign(this.path.target, path.parse(this.path.target.relative))
    this.href = path.join(process.env.JUS_BASEDIR, this.path.target.relative)
  }

  squeeze() {
    this.squeezed = true
  }

}
