'use strict'

const fs              = require('fs')
const path            = require('upath')
const chokidar        = require('chokidar')
const tmp             = require('tmp')
const ee              = require('event-emitter')
const extensions      = require('./extensions')
const ignored         = require('./ignored')
const contextualize   = require('./contextualize')
const fileTypes       = require('require-dir')('./files')
// const Observable      = require('./observable')
const PreSqueezer      = require('./preSqueezer')

process.env.JUS_BASEDIR = process.env.JUS_BASEDIR || '/'

module.exports = function jus (sourceDir, targetDir) {
  sourceDir = sourceDir || path.normalize(process.cwd())
  targetDir = targetDir || path.normalize(tmp.dirSync().name)
  const emitter = ee()
  var tryToFinishInterval
  var files = []

  const preSqueezer = new PreSqueezer(emitter, files, sourceDir, targetDir)

  function tryToFinish() {
    if (files.some(file => !file.squeezed)) return
    // After initial file squeeze, the 'squeezed' flag should be set false
    // to avoid any race condition at file updates
    files.forEach(file => file.squeezed = false)
    emitter.emit('squeezed', contextualize(files))
    clearInterval(tryToFinishInterval)
  }

  chokidar.watch(sourceDir, {ignored: ignored(sourceDir, targetDir)})
//    .on('add', (filename) => createFile(path.normalize(filename)))
    .on('add', (filename) => preSqueezer.next({cmd:'add', filename: path.normalize(filename)}))
    .on('change', (filename) => preSqueezer.next({cmd:'update', filename: path.normalize(filename)}))
    .on('unlink', (filename) => preSqueezer.next({cmd:'delete', filename: path.normalize(filename)}))
    .on('ready', () => {
      emitter.emit('squeezing', files)
      tryToFinishInterval = setInterval(tryToFinish, 100)
    })

  process.nextTick(function() {
    emitter.emit('started')
  })

  return emitter
}
