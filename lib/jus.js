'use strict'

const fs              = require('fs')
const path            = require('path')
const chokidar        = require('chokidar')
const tmp             = require('tmp')
const ee              = require('event-emitter')
const extensions      = require('./extensions')
const ignored         = require('./ignored')
const contextualize   = require('./contextualize')
const fileTypes       = require('require-dir')('./files')

process.env.JUS_BASEDIR = process.env.JUS_BASEDIR || '/'

module.exports = function jus (sourceDir, targetDir) {
  sourceDir = sourceDir || process.cwd()
  targetDir = targetDir || tmp.dirSync().name
  const emitter = ee()
  var tryToFinishInterval
  var files = []

  function createFile(filename) {
    var file
    var ext = path.extname(filename).toLowerCase().slice(1)
    var type = extensions[ext]
    if (fileTypes.layout.test(filename)) type = 'layout'
    if (!type) type = 'unknown'

    file = new fileTypes[type](filename, sourceDir, targetDir)
    emitter.emit('file-add', file)
    files.push(file)
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

  function tryToFinish() {
    if (files.some(file => !file.squeezed)) return
    emitter.emit('squeezed', contextualize(files))
    clearInterval(tryToFinishInterval)
  }

  chokidar.watch(sourceDir, {ignored: ignored(sourceDir, targetDir)})
    .on('add', (filename) => createFile(filename))
    .on('change', (filename) => updateFile(filename))
    .on('unlink', (filename) => deleteFile(filename))
    .on('ready', () => {
      emitter.emit('squeezing', files)
      tryToFinishInterval = setInterval(tryToFinish, 100)
    })

  process.nextTick(function() {
    emitter.emit('started')
  })

  return emitter
}
