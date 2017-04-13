'use strict'

const path            = require('upath')
const chokidar        = require('chokidar')
const ee              = require('event-emitter')
const defautlPlugins  = require('require-dir')('./ctx-plugins')
const defaultTypes    = require('require-dir')('./ctx-types')
const pluralize       = require('inflection').pluralize
const Context         = require('./context')

module.exports = class Contexter {
  constructor (opts) {
    this.targetDir = opts && opts.targetDir ? opts.targetDir : ''
    this.isSingleEmit = opts && opts.isSingleEmit ? opts.isSingleEmit : true
    this.reviewDelay = opts && opts.reviewDelay ? opts.reviewDelay : 500 // ms
    this.isReporting = opts && opts.isReporting ? opts.isReporting : false
    this.files = []

    // Add file types to extend basic file type, if any
    this.filetypes = defaultTypes

    this.plugins = []
    // Preload default plugins by precedence `check()` order
    Object.keys(defautlPlugins).sort((a, b) => {
      return defautlPlugins[a].priority || 0 - defautlPlugins[b].priority || 0
    }).forEach(key => {
      this.plugins.push(defautlPlugins[key])
    })
  }

  // Add custom file types by extending a `this.filetypes`
  // `.extend(name-of-filetype, file-type-object)`
  extend (filetypeName, filetype) {
    // TODO: Add some validation
    if (!this.filetypes[filetypeName]) this.filetypes[filetypeName] = {}
    // Override only those properties present in new "file-type-object"
    Object.assign(this.filetypes[filetypeName], filetype)
  }

  // Adds a custom plugins, an object with functions like ...
  // ... `check()`, `parse()`, `render()`,... to process a particular file type
  use (plugin) {
    // TODO: Add some validation
    this.plugins.push(plugin)
  }

  // powered by `chokidar`
  watcher (sourceDir, options) {
    const self = this
    const emitter = ee()
    const targetDir = this.targetDir
    const ctx = new Context(this.filetypes)
    const plugins = this.plugins.reverse()
    const isReporting = this.isReporting

    var checkResult // plugins `check()` results to define target extension

    // Select the appropriate plugin for this filename using `check()`
    function selectPlugin(filename) {
      return plugins.find(plugin => {
        // save check result to define target extension
        return checkResult = plugin.check(filename, (err, result) => {
          return result
        })
      })
    }

    function createFile(filename) {
      const selectedPlugin = selectPlugin(filename) // run plugins `check()`s

      // If `check()` result is a string, means it is the target extension
      let targetExt = typeof checkResult === 'string'
        ? checkResult
        : path.extname(filename).toLowerCase()

      const file
        = ctx.newFile(filename, sourceDir, targetDir, selectedPlugin, targetExt)
      file.contextualizeDO(ctx)
      self.files.push(file)
      self.isSingleEmit
        ? emitter.emit('context', ctx, 'adding', file)
        : emitter.emit('adding', file)
    }

    function updateFile(filename) {
      var file = self.files.find(f => f.path.full === filename)
      file.squeeze()
      self.isSingleEmit
        ? emitter.emit('context', ctx, 'updating', file)
        : emitter.emit('updating', file)
    }

    function deleteFile(filename) {
      var file = self.files.find(f => f.path.full === filename)
      file.contextualizeUNDO(ctx)
      self.files = self.files.filter(f => f.path.full !== filename)
      self.isSingleEmit
        ? emitter.emit('context', ctx, 'deleting', file)
        : emitter.emit('deleting', file)
    }

    chokidar.watch(sourceDir, options)
      .on('add', (filename) => createFile(path.normalize(filename)))
      .on('change', (filename) => updateFile(path.normalize(filename)))
      .on('unlink', (filename) => deleteFile(path.normalize(filename)))
      .on('ready', () => {
        var tryToFinishInterval

        function tryToFinish() {
          const remaining = self.files.filter(f => !f.squeezed)
          if (isReporting) {
            self.isSingleEmit
              ? emitter.emit('context', ctx, 'contexting', remaining)
              : emitter.emit('contexting', remaining)
          }
          if (remaining.length > 0) return
          // After initial file squeeze, the 'squeezed' flag should be set false
          // to avoid any race condition at file updates
          self.files.forEach(file => file.squeezed = false)
          emitter.emit('context', ctx, 'context')
          clearInterval(tryToFinishInterval)
        }

        // wrapper function to start interval immediatly without first wait
        function startInterval(ms, callback) {
          callback();
          return setInterval(callback, ms);
        }

        // If not reporting then report at least once before start intverval
        if (!isReporting) {
          self.isSingleEmit
            ? emitter.emit('context', ctx, 'contexting', self.files)
            : emitter.emit('contexting', self.files)
        }
        tryToFinishInterval = startInterval(self.reviewDelay, tryToFinish)
      })

    process.nextTick(function() {
      if (!self.isSingleEmit) emitter.emit('started', ctx)
    })

    return emitter
  }

}
