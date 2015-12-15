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
    this.readInputFile()
    this.render()
  }

  getHref() {
    return this.path.relative.replace(patterns.stylesheet, '.css')
  }

  render() {
    var self = this

    if (this.isStylus) {
      return stylus(this.input)
        .set('filename', this.path.relative)
        .render(function(err, css){
          self.output = css
          self.squeezed = true
        })
    }

    if (this.isSass) {
      this.output = sass.renderSync({data: this.input, indentedSyntax: true}).css.toString('utf8')
    }

    if (this.isSCSS) {
      this.output = sass.renderSync({data: this.input}).css.toString('utf8')
    }

    this.squeezed = true
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
