'use strict'

const path            = require('upath')
const chokidar        = require('chokidar')
const ee              = require('event-emitter')
const defautlPlugins  = require('require-dir')('./plugins/standard')
const Context         = require('./context')

module.exports = class Contextualizer {
  constructor (opts) {
    this.targetDir = opts && opts.targetDir ? opts.targetDir : ''
    this.reviewDelay = opts && opts.reviewDelay ? opts.reviewDelay : 500 // milliseconds
    this.isReporting = opts && opts.isReporting ? opts.isReporting : false
    this.ctx = new Context()
    this.plugins = []
    // Preload default plugins in priority order to set the applying `check()` order
    Object.keys(defautlPlugins).sort((a, b) => {
      return defautlPlugins[a].priority || 0 - defautlPlugins[b].priority || 0
    }).forEach(key => {
      this.plugins.push(defautlPlugins[key])
    })
  }

  // Adds a plugin.
  // It is an object with functions like `check()`, `parse()`, `render()`,...
  use (plugin, pluginFilename) {
    // Establish which filetype the plugin belongs to
    // (`plugin.filetype` is set to "datafiles" or "images" or "layouts", or ... )
    this.ctx.setFiletype(plugin, pluginFilename)
    this.plugins.push(plugin)
  }

  watcher (sourceDir, options) {
    const emitter = ee()
    const targetDir = this.targetDir
    const ctx = this.ctx
    const plugins = this.plugins.reverse()
    const isReporting = this.isReporting

    // Select the appropriate plugin for this particular filename using `check()`
    function selectPlugin(filename) {
      return plugins.find(plugin => {
        return plugin.check(filename, (err, found) => {
          if (err) throw `${err} filename = ${filename}`
          return found
        })
      })
    }

    function createFile(filename) {
      const selectedPlugin = selectPlugin(filename) // run plugins `check()`s
      // instantiate a new file of the appropriate type handled by the plugin
      const file = ctx.newFile(filename, sourceDir, targetDir, selectedPlugin)
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
          const remaining = ctx.files.filter(f => {return !f.squeezed})
          if (isReporting) emitter.emit('contexting', remaining)
          if (remaining.length > 0) return
          // After initial file squeeze, the 'squeezed' flag should be set false
          // to avoid any race condition at file updates
          ctx.files.forEach(file => file.squeezed = false)
          emitter.emit('contexted', ctx)
          clearInterval(tryToFinishInterval)
        }

        // wrapper function to start interval immediatly without first wait
        function startInterval(ms, callback) {
          callback();
          return setInterval(callback, ms);
        }

        if (!isReporting) emitter.emit('contexting', ctx.files)
        tryToFinishInterval = startInterval(this.reviewDelay, tryToFinish)
      })

    process.nextTick(function() {
      emitter.emit('started', ctx)
    })

    return emitter
  }

}
