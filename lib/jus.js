'use strict'

const path            = require('upath')
const tmp             = require('tmp')
const ee              = require('event-emitter')
const ignored         = require('./ignored')
const contextualizer  = require('./module/contextualizer')

process.env.JUS_BASEDIR = process.env.JUS_BASEDIR || '/'

module.exports = function jus (sourceDir, targetDir) {
  sourceDir = sourceDir || path.normalize(process.cwd())
  targetDir = targetDir || path.normalize(tmp.dirSync().name)
  const emitter = ee()

  var options = {}
  options.typesDir = path.resolve(__dirname, './files')
//  options.typer = require('./typer')
  options.ignored = ignored(sourceDir, targetDir)

  // TODO: Evaluate targetDir API
  // Is targetDir relevant to contextualizer or is it an advanced option to write files?
  contextualizer(sourceDir, targetDir, options)
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
