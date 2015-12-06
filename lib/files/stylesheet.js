'use strict'

const fs              = require('fs')
const path            = require('path')
const sass            = require('node-sass')
const patterns        = require('../patterns')
const File            = require('../file')

module.exports = class Stylesheet extends File {

  constructor(filepath, baseDir, cache) {
    super(filepath, baseDir, cache)
  }

  squeeze() {
    this.setContent()
    this.render()
    this.isDone = true
  }

  setContent() {
    this.content = {
      original: fs.readFileSync(this.path.full, 'utf8')
    }
  }

  render() {
    if (this.isSass)
      this.content.processed = sass.renderSync({data: this.content.original, indentedSyntax: true}).css.toString('utf8')

    if (this.isSCSS)
      this.content.processed = sass.renderSync({data: this.content.original}).css.toString('utf8')
  }

  get isSass() {
    return !!this.path.ext.match(patterns.sass)
  }

  get isSCSS() {
    return !!this.path.ext.match(patterns.scss)
  }

  get isStylus() {
    return !!this.path.ext.match(patterns.stylus)
  }
}
