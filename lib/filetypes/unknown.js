'use strict'

const path            = require('upath')
const pluralize       = require('inflection').pluralize
const File            = require('../file')

module.exports = class Unknown extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir)
    this.filepath = filepath
    this.sourceDir = sourceDir
    this.targetDir = targetDir
    this.type = this.constructor.name.toLowerCase()
    this.typePlural = pluralize(this.type)
  }

  squeeze () {
    this.squeezed = false
    this.setStats()
    this.squeezed = true
  }
/*
  initialize () {
    // No-op. Layouts do not need target but this function placeholder needs to be here
  }
*/
}
