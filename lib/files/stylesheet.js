'use strict'

const fs              = require('fs')
const path            = require('upath')
const less            = require('less')
const sass            = require('node-sass')
const stylus          = require('stylus')
const myth            = require('myth')
const File            = require('./file')

module.exports = class Stylesheet extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  // calls back with a boolean indicating whether this class should process the given file.
  static check (filename, callback) {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.css', '.less', '.sass', '.scss', '.styl']
    return callback(null, allowedExtensions.includes(extension))
  }

  squeeze() {
    this.squeezed = false
    this.read()
    this.squeezed = true
  }

  render(context, done) {
    let output

    if (this.isCSS) {
      output = myth(this.input, {source: this.path.full})
      return done(null, output)
    }

    if (this.isLess) {
      return less.render(this.input, {filename: this.path.full}, function(err, output){
        if (err) throw err
        return done(null, output.css)
      })
    }

    if (this.isStylus) {
       output = stylus(this.input)
        .set('filename', this.path.full)
        .set('paths', [path.dirname(this.path.full)])
        .render()
      return done(null, output)
    }

    if (this.isSass) {
      output = sass
        .renderSync({data: this.input, indentedSyntax: true})
        .css
        .toString('utf8')
      return done(null, output)
    }

    if (this.isSCSS) {
      output = sass
        .renderSync({data: this.input})
        .css
        .toString('utf8')
      return done(null, output)
    }

    return done(null, this.input)
  }

  get isLess() {
    return this.path.ext.toLowerCase() === '.less'
  }

  get isSass() {
    return this.path.ext.toLowerCase() === '.sass'
  }

  get isSCSS() {
    return this.path.ext.toLowerCase() === '.scss'
  }

  get isStylus() {
    return this.path.ext.toLowerCase() === '.styl'
  }

  get isCSS() {
    return this.path.ext.toLowerCase() === '.css'
  }

}
