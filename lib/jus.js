'use strict'

const fs              = require('fs')
const path            = require('path')
const assert          = require('assert')
const walkdir         = require('walkdir')
const ee              = require('event-emitter')
const patterns        = require('./patterns')
const contextualize   = require('./contextualize')
const fileTypes      = require('require-dir')('./files')

module.exports = function jus (dir) {
  assert(dir.length, '`dir` must be specified')
  const filenames = walkdir.sync(dir)
  var interval
  var emitter = ee()
  var files = []
  var context = {}

  function allFilesSqueezed() {
    if (files.every(file => file.squeezed)) {
      clearInterval(interval)
      context = contextualize(files)
      files.forEach(file => file.finish(context))
      emitter.emit('squeezed', files, context)
    }
  }

  filenames.forEach(filename => {
    if (filename.match(patterns.blacklist)) return

    Object.keys(fileTypes).forEach(type => {
      if (path.basename(filename).match(patterns[type])) {
        var file = new fileTypes[type](filename, dir)
        emitter.emit('file', file)
        files.push(file)
      }
    })
  })

  interval = setInterval(allFilesSqueezed, 10)

  return emitter
}
