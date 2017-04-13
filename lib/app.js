'use strict'

const fs              = require('fs')
const path            = require('upath')
const tmp             = require('tmp')
const ee              = require('event-emitter')
const ignored         = require('./ignored')
const filetypes       = require('require-dir')('./filetypes')
const plugins         = require('require-dir')('./plugins/use')
const Contexter       = require('./contexter/index')

process.env.CTXR_BASEDIR = process.env.CTXR_BASEDIR || '/'

module.exports = function app (sourceDir, targetDir) {
  sourceDir = sourceDir || path.normalize(process.cwd())
  targetDir = targetDir || path.normalize(tmp.dirSync().name)
  const emitter = ee()
  const ctxr = new Contexter({'targetDir': targetDir}) // {opts}

  // ".extend()" the basic Contexter file type(s) with app's file types, if any
  Object.keys(filetypes).forEach(filetype => {
    // `.extend(name-of-filetype, file-type-object)`
    ctxr.extend(filetype, filetypes[filetype])
  })

  // Set ".use()" plugins in `priority` order, if any
  Object.keys(plugins).sort((a, b) => {
    return plugins[a].priority || 0 - plugins[b].priority || 0
  }).forEach(plugin => ctxr.use(plugins[plugin]))

  // All of the above have to be synchronous
  // ... we do not want watcher to start without all file type handlers loaded
  ctxr.watcher(sourceDir, {'ignored': ignored(sourceDir, targetDir)})
    .on('context', (context, eventName, payload) => {
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
        emitter.emit('squeezing', payload) // payload are files (all or remaining)
          break;
        default:
        emitter.emit('squeezed', context)
      }
    }) // mandatory do not comment

  process.nextTick(function() {
    emitter.emit('started')
  })

  return emitter
}
