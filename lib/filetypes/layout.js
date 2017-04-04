'use strict'

const frontmatter     = require('html-frontmatter')
const path            = require('upath')
const pluralize       = require('inflection').pluralize
const File            = require('../file')

module.exports = class Layout extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir)
    this.filepath = filepath
    this.sourceDir = sourceDir
    this.targetDir = targetDir
    this.type = this.constructor.name.toLowerCase()
    this.typePlural = pluralize(this.type)
    this.isRemovable = true // means, will not be written in targetDir
  }

  squeeze () {
    this.squeezed = false
    this.setStats()
    this.setName()
    this.read()
    this.getFrontmatter()
//    this.transform() // To apply "transforms/filters"
    this.squeezed = true
  }
/*
  transform () {
    this.functions.transform(file, (err, result) => {
      if (err) throw err
      return = result
    })
  }
  initialize () {
    // No-op. Layouts do not need target but this function placeholder needs to be here
  }
*/
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
