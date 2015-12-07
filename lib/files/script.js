'use strict'

const fs              = require('fs')
const path            = require('path')
const browserify      = require('browserify')
const concat          = require('concat-stream')
const patterns        = require('../patterns')
const File            = require('../file')

module.exports = class Script extends File {

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
    var foo = browserify(this.path.processRelative)
      .transform('babelify', {presets: ['es2015', 'react']})
      .bundle()
      .pipe(concat(function(buffer){
        self.content.processed = buffer.toString()
        self.isDone = true
      }))
  }

}
