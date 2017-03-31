'use strict'

const fs              = require('fs')
const path            = require('upath')
const sass            = require('node-sass')
const File            = require('./file')

module.exports = class StylesheetSASS extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir)
    this.setTargetPathsAndHref(sourceDir, targetDir, '.css') // force target extension
    this.isRenderable = true // means, will be render before written in targetDir
  }

  // calls back with a boolean indicating whether this class should process the given file.
  static check (filename, callback) {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.sass']
    return callback(null, allowedExtensions.indexOf(extension) > -1)
  }

  squeeze() {
    this.squeezed = false
    this.read()
    this.squeezed = true
  }

  render(context, done) {
    let output

    if (this.isSass) {
      output = sass
        .renderSync({data: this.input, indentedSyntax: true})
        .css
        .toString('utf8')
      return done(null, output)
    }

    return done(null, this.input)
  }

  get isSass() {
    return this.path.ext.toLowerCase() === '.sass'
  }

}
