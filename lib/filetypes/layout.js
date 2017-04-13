'use strict'

const frontmatter     = require('html-frontmatter')
const path            = require('upath')

module.exports = {
  // Means that this file will not be written in targetDir
  isRemovable: true,

  filetypeSteps () {
    // Define the contextualize DO step (and UNDO step)
    this.history.push({
      ctxDO (ctx) {

        // Create ctx.layouts.default, ctx.layouts.foo, etc
        ctx[this.typePlural][this.name] = this

      },

      ctxUNDO (ctx) {

        // Remove ctx.layouts.default, ctx.layouts.foo, etc
        delete ctx[this.typePlural][this.name]

      }

    })
  },

  // Overrides `File` class default `parseCallback` method. No output needed
  parseCallback (err) {
    if (err) throw err
  },

  wrap (content) {
    return this.input.replace('{{{body}}}', content)
  },

  setName () {
    if (this.path.name === 'layout') {
      this.name = 'default'
      return
    }

    this.name = this.path.name
      .replace(/layout/i, '')
      .replace(/^(-|_)+/, '')
      .replace(/(-|_)+$/, '')
  },

  getFrontmatter () {
    Object.assign(this, frontmatter(this.input))
  },

}
