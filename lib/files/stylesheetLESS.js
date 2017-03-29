'use strict'

const fs              = require('fs')
const path            = require('upath')
const less            = require('less')
const File            = require('./file')

module.exports = class StylesheetLESS extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  // calls back with a boolean indicating whether this class should process the given file.
  static check (filename, callback) {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.less']
    return callback(null, allowedExtensions.indexOf(extension) > -1)
  }

  squeeze() {
    this.squeezed = false
    this.read()
    this.squeezed = true
  }

  render(context, done) {
    let output

    if (this.isLess) {
      return less.render(this.input, {filename: this.path.full}, function(err, output){
        if (err) throw err
        return done(null, output.css)
      })
    }
    return done(null, this.input)
  }

  get isLess() {
    return this.path.ext.toLowerCase() === '.less'
  }

}
