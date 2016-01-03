'use strict'

const fs              = require('fs')
const path            = require('path')
const sass            = require('node-sass')
const stylus          = require('stylus')
const patterns        = require('../patterns')
const File            = require('../file')

module.exports = class Stylesheet extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  squeeze() {
    this.squeezed = false
    this.read()
    this.preprocess()
  }

  setHref() {
    this.href = this.path.relative.replace(patterns.stylesheet, '.css')
  }

  preprocess() {
    var self = this

    if (this.isStylus) {
      return stylus(this.input)
        .set('filename', this.path.full)
        .set('paths', [path.dirname(this.path.full)])
        .render(function(err, css){
          if (err) throw err
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

  get targetExt() {
    return '.css'
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
