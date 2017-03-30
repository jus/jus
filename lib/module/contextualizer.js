'use strict'

const path            = require('upath')
const chokidar        = require('chokidar')
const ee              = require('event-emitter')
const Context         = require('./context')

var ctx
var targetDir

module.exports = class Contextualizer {
  constructor (opts) {
    if (opts && opts.targetDir) targetDir = opts.targetDir
    ctx = new Context()
  }

  use (fileHandlerPath) {
    ctx.setHandler(fileHandlerPath)
  }

  watcher (sourceDir, options) {
    const emitter = ee()

    function createFile(filename) {
      var file = ctx.newFile(filename, sourceDir, targetDir)
      file.contextualize(ctx)
      emitter.emit('adding', file)
    }

    function updateFile(filename) {
      var file = ctx.files.find(f => f.path.full === filename)
      file.squeeze()
      emitter.emit('updating', file)
    }

    function deleteFile(filename) {
      var file = ctx.files.find(f => f.path.full === filename)
      file.deContextualize(ctx)
      emitter.emit('deleting', file)
    }

    chokidar.watch(sourceDir, options)
      .on('add', (filename) => createFile(path.normalize(filename)))
      .on('change', (filename) => updateFile(path.normalize(filename)))
      .on('unlink', (filename) => deleteFile(path.normalize(filename)))
      .on('ready', () => {
        var tryToFinishInterval

        function tryToFinish() {
          if (ctx.files.some(file => !file.squeezed)) return
          // After initial file squeeze, the 'squeezed' flag should be set false
          // to avoid any race condition at file updates
          ctx.files.forEach(file => file.squeezed = false)
          emitter.emit('contexted', ctx)
          clearInterval(tryToFinishInterval)
        }

        emitter.emit('contexting', ctx.files)
        tryToFinishInterval = setInterval(tryToFinish, 100)
      })

    process.nextTick(function() {
      emitter.emit('started', ctx)
    })

    return emitter
  }
}
