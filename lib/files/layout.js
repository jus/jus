'use strict'

const fs              = require('fs')
const path            = require('upath')
const frontmatter     = require('html-frontmatter')
const File            = require('../file')

module.exports = class Layout extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  squeeze() {
    this.squeezed = false
    this.setName()
    this.read()
    this.getFrontmatter()
    this.squeezed = true
  }

  wrap(content) {
    return this.input.replace(/{{{body}}}/g, content)
  }

  setName() {
    if (this.path.name === 'layout') {
      this.name = 'default'
      return
    }

    this.name = this.path.name
      .replace(/layout/i, '')
      .replace(/^(-|_)+/, '')
      .replace(/(-|_)+$/, '')
  }

  getFrontmatter() {
    Object.assign(this, frontmatter(this.input))
  }

  static test(filename) {
    return !!filename.match(/\/layout.*\.(html|hbs|handlebars|markdown|md|mdown)$/i)
  }

}
