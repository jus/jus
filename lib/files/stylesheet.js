'use strict'

const fs              = require('fs')
const path            = require('path')
const sass            = require('node-sass')
const stylus          = require('stylus')
const patterns        = require('../patterns')
const File            = require('../file')

module.exports = class Stylesheet extends File {

  constructor(filepath, baseDir, cache) {
    super(filepath, baseDir, cache)
  }

  squeeze() {
    this.setContent()
    this.render()
  }

  setContent() {
    this.content = {
      original: fs.readFileSync(this.path.full, 'utf8')
    }
  }

  render() {
    var self = this

    if (this.isStylus) {
      return stylus(this.content.original)
        .set('filename', this.path.relative)
        .render(function(err, css){
          self.content.processed = css
          self.isDone = true
        })
    }

    if (this.isSass) {
      this.content.processed = sass.renderSync({data: this.content.original, indentedSyntax: true}).css.toString('utf8')
    }

    if (this.isSCSS) {
      this.content.processed = sass.renderSync({data: this.content.original}).css.toString('utf8')
    }

    this.isDone = true
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
