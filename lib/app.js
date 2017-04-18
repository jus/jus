'use strict'

const ee              = require('event-emitter')
const files           = require('require-dir')('./files')
const fs              = require('fs')
const ignored         = require('./ignored')
const path            = require('upath')
const plugins         = require('require-dir')('./plugins/use')
const tmp             = require('tmp')
const Contexter       = require('contexter')

process.env.CTXR_BASEDIR = process.env.CTXR_BASEDIR || '/'

module.exports = function app (sourceDir, targetDir) {
  sourceDir = sourceDir || path.normalize(process.cwd())
  targetDir = targetDir || path.normalize(tmp.dirSync().name)
  const emitter = ee()
  const configs = {
    pluginConfig: {'targetDir': targetDir}
  }
  const ctxr = new Contexter(configs)

  // ".extend()" the basic Contexter file type(s) with app's file types
  Object.keys(files).forEach(type => {
    // `.extend(name-of-type, file-type-object)`
    ctxr.extend(type, files[type])
  })

  // Set ".use()" plugins in `priority` order
  Object.keys(plugins).sort((a, b) => {
    return plugins[a].priority || 0 - plugins[b].priority || 0
  }).forEach(plugin => ctxr.use(plugins[plugin]))

  // All of the above have to be synchronous
  // ... we do not want watcher to start without all file type handlers loaded
  ctxr.watcher(sourceDir, {'ignored': ignored(sourceDir, targetDir)})
    // TODO: Avoid forcing just one `all` event. Could use other native events
    .on('all', (context, eventName, payload) => {
      switch (eventName) {
        case 'adding':
          emitter.emit('file-add', payload) // payload is a file
          break;
        case 'updating':
        emitter.emit('file-update', payload) // payload is a file
          break;
        case 'deleting':
        emitter.emit('file-delete', payload) // payload is a file
          break;
        case 'contexting':
        emitter.emit('squeezing', payload) // payload are files (all/remaining)
          break;
        default:
        emitter.emit('squeezed', context)
      }
    })

  process.nextTick(function() {
    emitter.emit('started')
  })

  return emitter
}
