'use strict'

const fs              = require('fs-extra')
const path            = require('upath')
const pluralize       = require('inflection').pluralize

module.exports = class BaseFile  {

  constructor(filepath, sourceDir) {
    this.setType()
  }

  squeeze() {
    // no-op, overridden by each type
  }

  contextualize (ctx) {
    // Add file to context in two places - files array and "types" array
    ctx.files.push(this)
    ctx[this.typePlural].push(this)
    // Create named key for easy access in two places also
    ctx.files[this.keyName] = this
    ctx[this.typePlural][this.keyName] = this
    // specific contextualize per particular file type
    this.distinctContextualize(ctx)
  }

  deContextualize (ctx) {
    // specific decontextualize per particular file type
    this.distinctDecontextualize(ctx)
    // Remove named keys in both places
    delete ctx[this.typePlural][this.keyName]
    delete ctx.files[this.keyName]
    // Remove file from context in both places
    ctx[this.typePlural] = ctx[this.typePlural].filter(f => f.path.full !== this.path.full)
    ctx.files = ctx.files.filter(f => f.path.full !== this.path.full)
  }

  distinctContextualize (ctx) {
    // no-op, could be overridden by each type as needed
  }

  distinctDecontextualize (ctx) {
    // no-op, could be overridden by each type as needed
  }

  setType() {
    this.type = this.constructor.name.toLowerCase()
    this.typePlural = pluralize(this.type)
  }

  read() {
    this.input = fs.readFileSync(this.path.full, 'utf8')
    // this.output = this.input
  }

  get keyName() {
    return this.path.relative
  }
}
