'use strict'

const fs              = require('fs')
const path            = require('path')
const browserify      = require('browserify')
const concat          = require('concat-stream')
const File            = require('../file')

module.exports = class Script extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  squeeze() {
    this.squeezed = false
    this.read()
    this.squeezed = true
  }

  render(context, done) {
    return browserify(this.path.processRelative)
      .transform('babelify', {presets: ['es2015', 'react']})
      .bundle()
      .pipe(concat(function(buffer){
        return done(null, buffer.toString())
      }))
  }

}
