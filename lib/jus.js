'use strict'

const fs              = require('fs')
const path            = require('upath')
const tmp             = require('tmp')
const ee              = require('event-emitter')
const ignored         = require('./ignored')
const Contextualizer  = require('./module/contextualizer')

process.env.JUS_BASEDIR = process.env.JUS_BASEDIR || '/'

module.exports = function jus (sourceDir, targetDir) {
  sourceDir = sourceDir || path.normalize(process.cwd())
  targetDir = targetDir || path.normalize(tmp.dirSync().name)
  const emitter = ee()

  // TODO: Add bulk file type handlers load in opts
  const sentinel = new Contextualizer({'targetDir': targetDir})

  const dir = path.relative(process.cwd(), __dirname)
  const filesDir = path.resolve(dir, 'plugins')

  // This has to be synchronous
  // ... we do not want watcher to start without all file type handlers loaded
  fs.readdirSync(filesDir).forEach((file) => {
    sentinel.use(path.resolve(filesDir, file))
  })

  sentinel.watcher(sourceDir, {'ignored': ignored(sourceDir, targetDir)})
    .on('adding', (file) => {emitter.emit('file-add', file)})
    .on('updating', (file) => {emitter.emit('file-update', file)})
    .on('deleting', (file) => {emitter.emit('file-delete', file)})
    .on('contexting', (files) => {emitter.emit('squeezing', files)})
    .on('contexted', (ctx) => {emitter.emit('squeezed', ctx)})

  process.nextTick(function() {
    emitter.emit('started')
  })

  return emitter
}
