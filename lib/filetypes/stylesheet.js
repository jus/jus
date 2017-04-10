'use strict'

const path            = require('upath')
const File            = require('../file')

module.exports = class Stylesheet extends File {

  constructor(filepath, sourceDir, targetDir, plugin) {
    super(filepath, sourceDir, targetDir, plugin)
  }

  // TODO: Consider moving these helpers to the `stylesheet` default plugin
  get isLess() {
    return this.path.ext.toLowerCase() === '.less'
  }

  get isSass() {
    return this.path.ext.toLowerCase() === '.sass'
  }

  get isSCSS() {
    return this.path.ext.toLowerCase() === '.scss'
  }

  get isStylus() {
    return this.path.ext.toLowerCase() === '.styl'
  }

  get isCSS() {
    return this.path.ext.toLowerCase() === '.css'
  }

}
