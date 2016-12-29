'use strict'

const fs              = require('fs')
const path            = require('upath')
const snakeCase       = require('lodash').snakeCase
const File            = require('../file')

module.exports = class Partial extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  squeeze() {
    this.squeezed = false
    this.setName()
    this.setPartialName()
    this.read()
    this.squeezed = true
  }

  wrap(content) {
    return this.input.replace('{{{body}}}', content)
  }

  setName() {
    this.name = this.path.name
      .replace(/partial/i, '')
      .replace(/^(-|_)+/, '')
      .replace(/(-|_)+$/, '')
  }

  setPartialName() {
      this.partialName = snakeCase(this.name)
  }

  static test(filename) {
    return !!filename.match(/\/partial.*\.(html|hbs|handlebars|markdown|md|mdown)$/i)
  }

}
