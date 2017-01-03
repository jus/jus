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

  // Silently add fixed 404 page
  const filename = 'hard-to-guess-404-filename-seen-only-in-development.html'
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
      tryToFinishInterval = setInterval(tryToFinish, 100)
    })

  process.nextTick(function() {
    emitter.emit('started')
  })

  return emitter
}
