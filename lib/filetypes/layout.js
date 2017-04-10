'use strict'

const frontmatter     = require('html-frontmatter')
const path            = require('upath')
const File            = require('../file')

module.exports = class Layout extends File {

  constructor(filepath, sourceDir, targetDir, plugin) {
    super(filepath, sourceDir, targetDir, plugin)

    // Means that this file will not be written in targetDir
    this.isRemovable = true
  }

  // Overrides `File` class default `parseCallback` method. No output needed
  parseCallback (err) {
    if (err) throw err
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

  distinctContextualize (ctx) {
    // Create ctx.layouts.default, ctx.layouts.foo, etc
    ctx[this.typePlural][this.name] = this
  }

  distinctDecontextualize (ctx) {
    // Remove ctx.layouts.default, ctx.layouts.foo, etc
    delete ctx[this.typePlural][this.name]
  }

}
