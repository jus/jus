'use strict'

const fs              = require('fs')
const path            = require('upath')
const tmp             = require('tmp')
const ee              = require('event-emitter')
const ignored         = require('./ignored')
const plugins         = require('require-dir')('./plugins/use')
const Contextualizer  = require('./contextualizer')

process.env.JUS_BASEDIR = process.env.JUS_BASEDIR || '/'

module.exports = function jus (sourceDir, targetDir) {
  sourceDir = sourceDir || path.normalize(process.cwd())
  targetDir = targetDir || path.normalize(tmp.dirSync().name)
  const emitter = ee()

  const sentinel = new Contextualizer({'targetDir': targetDir}) // {opts}

  // Set ".use()" plugins in `priority` order, if any
  Object.keys(plugins).sort((a, b) => {
    return plugins[a].priority || 0 - plugins[b].priority || 0
  }).forEach(pluginFilename => {
    // Second argument is optional. It is one way to hint the `plugin` vs `filetypes`
    sentinel.use(plugins[pluginFilename], pluginFilename)
  })

  // All of the above have to be synchronous
  // ... we do not want watcher to start without all file type handlers loaded
  sentinel.watcher(sourceDir, {'ignored': ignored(sourceDir, targetDir)})
// Comment or uncomment individual adding, updating, deleting or contexting reporting
    .on('adding', (file) => {emitter.emit('file-add', file)}) // optional, may comment
    .on('updating', (file) => {emitter.emit('file-update', file)}) // optional, may comment
    .on('deleting', (file) => {emitter.emit('file-delete', file)}) // optional, may comment
    .on('contexting', (files) => {emitter.emit('squeezing', files)}) // optional, may comment
    .on('contexted', (ctx) => {emitter.emit('squeezed', ctx)}) // mandatory do not comment

  process.nextTick(function() {
    emitter.emit('started')
  })

  return emitter
}
