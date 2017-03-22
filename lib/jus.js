'use strict'

const fs              = require('fs')
const path            = require('upath')
const chokidar        = require('chokidar')
const tmp             = require('tmp')
const ee              = require('event-emitter')
const extensions      = require('./extensions')
const ignored         = require('./ignored')
const Context         = require('./context')
const fileTypes       = require('require-dir')('./files')

process.env.JUS_BASEDIR = process.env.JUS_BASEDIR || '/'

module.exports = function jus (sourceDir, targetDir) {
  sourceDir = sourceDir || path.normalize(process.cwd())
  targetDir = targetDir || path.normalize(tmp.dirSync().name)
  const emitter = ee()
  var tryToFinishInterval
  var ctx = new Context

  function createFile(filename) {
    var file
    var ext = path.extname(filename).toLowerCase().slice(1)
    var type = extensions[ext]
    if (fileTypes.layout.test(filename)) type = 'layout'
    if (filename.endsWith('.min.js')) type = 'unknown'
    if (ext === 'svg') {
      if (fs.readFileSync(filename, 'utf8').includes('</font>')) type = 'unknown'
    }
    if (!type) type = 'unknown'

    file = new fileTypes[type](filename, sourceDir, targetDir)
    file.contextualize(ctx)
    emitter.emit('file-add', file)
  }

  function updateFile(filename) {
    var file = ctx.files.find(f => f.path.full === filename)
    file.squeeze()
    emitter.emit('file-update', file)
  }

  function deleteFile(filename) {
    var file = ctx.files.find(f => f.path.full === filename)
    file.deContextualize(ctx)
    emitter.emit('file-delete', file)
  }

  function tryToFinish() {
    if (ctx.files.some(file => !file.squeezed)) return
    // After initial file squeeze, the 'squeezed' flag should be set false
    // to avoid any race condition at file updates
    ctx.files.forEach(file => file.squeezed = false)
    emitter.emit('squeezed', ctx)
    clearInterval(tryToFinishInterval)
  }

  chokidar.watch(sourceDir, {ignored: ignored(sourceDir, targetDir)})
    .on('add', (filename) => createFile(path.normalize(filename)))
    .on('change', (filename) => updateFile(path.normalize(filename)))
    .on('unlink', (filename) => deleteFile(path.normalize(filename)))
    .on('ready', () => {
      emitter.emit('squeezing', ctx.files)
      tryToFinishInterval = setInterval(tryToFinish, 100)
    })

  process.nextTick(function() {
    emitter.emit('started')
  })

  return emitter
}
