'use strict'

const fs              = require('fs')
const path            = require('upath')
const File            = require('./file')

module.exports = class Unknown extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  squeeze() {
    this.squeezed = true
  }

}
