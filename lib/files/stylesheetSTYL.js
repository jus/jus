'use strict'

const fs              = require('fs')
const path            = require('upath')
const stylus          = require('stylus')
const File            = require('./file')

module.exports = class StylesheetSTYL extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  // calls back with a boolean indicating whether this class should process the given file.
  static check (filename, callback) {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.styl']
    return callback(null, allowedExtensions.indexOf(extension) > -1)
  }

  squeeze() {
    this.squeezed = false
    this.read()
    this.squeezed = true
  }

  render(context, done) {
    let output

    if (this.isStylus) {
       output = stylus(this.input)
        .set('filename', this.path.full)
        .set('paths', [path.dirname(this.path.full)])
        .render()
      return done(null, output)
    }

    return done(null, this.input)
  }

  get isStylus() {
    return this.path.ext.toLowerCase() === '.styl'
  }

}
