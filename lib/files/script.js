'use strict'

const fs              = require('fs')
const path            = require('path')
const browserify      = require('browserify')
const concat          = require('concat-stream')
const patterns        = require('../patterns')
const File            = require('../file')

module.exports = class Script extends File {

  constructor(filepath, baseDir) {
    super(filepath, baseDir)
  }

  squeeze() {
    this.readInputFile()
    this.babelify()
  }

  babelify() {
    var self = this
    browserify(this.path.processRelative)
      .transform('babelify', {presets: ['es2015', 'react']})
      .bundle()
      .pipe(concat(function(buffer){
        self.output = buffer.toString()
        self.squeezed = true
      }))
  }

}
