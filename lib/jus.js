'use strict'

const fs              = require('fs')
const path            = require('upath')
const chokidar        = require('chokidar')
const context         = require('./context')
const tmp             = require('tmp')
const ee              = require('event-emitter')
const extensions      = require('./extensions')
const ignored         = require('./ignored')
const contextualize   = require('./contextualize')
const fileTypes       = require('require-dir')('./files')

process.env.JUS_BASEDIR = process.env.JUS_BASEDIR || '/'

module.exports = function jus (sourceDir, targetDir) {
  sourceDir = sourceDir || path.normalize(process.cwd())
  targetDir = targetDir || path.normalize(tmp.dirSync().name)
  const emitter = ee()
  var tryToFinishInterval
  var files = []

  function createFile(filename) {
    var file
    var ext = path.extname(filename).toLowerCase().slice(1)
    var type = extensions[ext]
    if (fileTypes.layout.test(filename)) type = 'layout'
    if (fileTypes.partial.test(filename)) type = 'partial'
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
    // Still some unsqueezed files? then abort and wait for next interval
    if (files.some(file => !file.squeezed)) return
    var ini = new context
    emitter.emit('squeezed', contextualize(ini, files))
    clearInterval(tryToFinishInterval)
  }

  // Add prefixed 404 page. Name choosen to avoid 404 routing namespace conflict
  // (ex.: conflict with other 404.html file)
  const filename = 'hard-to-guess-404-filename.html'
  const libDir = path.relative(process.cwd(), __dirname)
  var fixturesDir = path.resolve(libDir, 'fixtures')
  fixturesDir = path.normalize(fixturesDir)
  if (!fs.existsSync(path.resolve(sourceDir, filename))) {
    var file = new fileTypes['page'](
      path.resolve(fixturesDir, filename), fixturesDir, targetDir)
    files.push(file)
  }

  chokidar.watch(sourceDir, {ignored: ignored(sourceDir, targetDir)})
    .on('add', (filename) => createFile(path.normalize(filename)))
    .on('change', (filename) => updateFile(path.normalize(filename)))
    .on('unlink', (filename) => deleteFile(path.normalize(filename)))
    .on('ready', () => {
      emitter.emit('squeezing', files)
      tryToFinishInterval = setInterval(tryToFinish, 500)
    })

  process.nextTick(function() {
    emitter.emit('started')
  })

  return emitter
}
