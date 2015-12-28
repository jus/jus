'use strict'

const fs              = require('fs')
const path            = require('path')
const assert          = require('assert')
const walkdir         = require('walkdir')
const watchr          = require('watchr')
const ee              = require('event-emitter')
const patterns        = require('./patterns')
const contextualize   = require('./contextualize')
const fileTypes      = require('require-dir')('./files')

module.exports = function jus (baseDir) {
  assert(baseDir.length, '`dir` must be specified')
  const emitter = ee()
  const interval = setInterval(allFilesSqueezed, 100)
  const filenames = walkdir.sync(baseDir)
  emitter.emit('started', filenames)

  var files = []

  function emitSqueezeEvent() {
    // Cobble the files array into a more handlebars-friendly structure
    var context = contextualize(files)

    // All files have been squeezed
    emitter.emit('squeezed', context)
  }

  function createFile(filename) {
    if (filename.match(patterns.blacklist)) return

    Object.keys(fileTypes).forEach(type => {
      if (path.basename(filename).match(patterns[type])) {
        var file = new fileTypes[type](filename, baseDir)
        emitter.emit(`${file.path.relative} created`)
        files.push(file)
      }
    })
  }

  function updateFile(filename) {
    var file = files.find(f => f.path.full === filename)
    file.reSqueeze()
    emitter.emit(`${file.path.relative} updated`)
  }

  function deleteFile(filename) {
    var file = files.find(f => f.path.full === filename)
    files = files.filter(f => f.path.full !== filename)
    emitter.emit(`${file.path.relative} deleted`)
  }

  function watchForChanges() {
    watchr.watch({
      path: baseDir,
      listener: function(changeType, filename, currentStat, previousStat) {
        switch(changeType) {
          case 'create':
            createFile(filename)
            break
          case 'update':
            updateFile(filename)
            break
          case 'delete':
            deleteFile(filename)
            break
        }
        emitSqueezeEvent()
      }
    })
  }

  function allFilesSqueezed() {
    if (files.every(file => file.squeezed)) {
      clearInterval(interval)
      emitSqueezeEvent()
      watchForChanges()
    }
  }

  // Array of filenames from the intial walk
  filenames.forEach(filename => createFile(filename))

  return emitter
}
