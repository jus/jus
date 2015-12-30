'use strict'

const fs              = require('fs')
const path            = require('path')
const assert          = require('assert')
const chokidar        = require('chokidar')
const ee              = require('event-emitter')
const patterns        = require('./patterns')
const contextualize   = require('./contextualize')
const fileTypes       = require('require-dir')('./files')

module.exports = function jus (baseDir) {
  assert(baseDir.length, '`dir` must be specified')
  const emitter = ee()
  const interval = setInterval(allFilesSqueezed, 100)
  var files = []
  var types = Object.keys(fileTypes)

  function emitSqueezedEvent() {
    // Cobble the files array into a more handlebars-friendly structure
    var context = contextualize(files)

    // All files have been squeezed
    emitter.emit('squeezed', context)
  }

  function createFile(filename) {
    if (filename.match(patterns.blacklist)) return

    types.forEach(type => {
      if (path.basename(filename).match(patterns[type])) {
        var file = new fileTypes[type](filename, baseDir)
        emitter.emit('file-add', file)
        files.push(file)
      }
    })
  }

  function updateFile(filename) {
    var file = files.find(f => f.path.full === filename)
    file.squeeze()
    emitter.emit('file-update', file)
  }

  function deleteFile(filename) {
    var file = files.find(f => f.path.full === filename)
    files = files.filter(f => f.path.full !== filename)
    emitter.emit('file-delete', file)
  }

  function allFilesSqueezed() {
    if (files.every(file => file.squeezed)) {
      clearInterval(interval)
      emitSqueezedEvent()
      // watchForChanges()
    }
  }

  chokidar.watch(baseDir, {ignored: patterns.blacklist})
    .on('add', (filename) => createFile(filename))
    .on('change', (filename) => updateFile(filename))
    .on('unlink', (filename) => deleteFile(filename))

  process.nextTick(function() {
    emitter.emit('started')
  })

  return emitter
}
