'use strict'

const fs              = require('fs')
const path            = require('upath')
const frontmatter     = require('html-frontmatter')
const File            = require('../file')

module.exports = class Layout extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir)
  }

  // calls back with a boolean indicating whether this class should process the given file.
  static check (filename, callback) {
    return callback(null,
      !!filename.match(/\/layout.*\.(html|hbs|handlebars|markdown|md|mdown)$/i)
    )
  }

  squeeze() {
    this.squeezed = false
    this.isRemovable = true // means, will not be written in targetDir
    this.setName()
    this.read()
    this.getFrontmatter()
    this.squeezed = true
  }

  distinctContextualize (ctx) {
    // Create ctx.layouts.default, ctx.layouts.foo, etc
    ctx[this.typePlural][this.name] = this
  }

  distinctDecontextualize (ctx) {
    // Remove ctx.layouts.default, ctx.layouts.foo, etc
    delete ctx[this.typePlural][this.name]
  }

  wrap(content) {
    return this.input.replace('{{{body}}}', content)
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
