'use strict'

const fs              = require('fs-extra')
const path            = require('upath')
const pluralize       = require('inflection').pluralize

module.exports =  {
  initialize (plugin, targetDir, targetExt) {
    this.type = plugin.filetype
    this.typePlural = pluralize(this.type)
    this.targetDir = targetDir
    //TODO: Consider removing `toLowerCase()` already in `index.js:createFile()`
    this.targetExt = targetExt.toLowerCase()

    // Inject plugin methods
    this.functions = {}
    Object.assign(this.functions, plugin)

    // Default to synchronous. Plugin could override. Affects `this.squeezed` flag
    this.isPluginAsynchronous = false

    // Set up the contextualize "recipe" steps in `this.history`
    this.addHistorySteps()

    // `file` object ready!
    // ... do first content extraction to populate it
    this.setTargetPath()
    this.setHref()
    this.squeeze()
  },

  setTargetPath () {
    let targetFull = this.path.full
      .replace(this.sourceDir, this.targetDir)
      .replace(this.path.ext, this.targetExt)

    this.path.target = {
      full: targetFull,
      relative: targetFull.replace(this.targetDir, '')
    }

    Object.assign(this.path.target, path.parse(this.path.target.relative))
  },

  setHref () {
    this.href = path.join(process.env.CTXR_BASEDIR, this.path.target.relative)
  },

  coreFileSteps () {
    // Define the contextualize first DO step (and last UNDO step)
    this.history.push({
      ctxDO (ctx) {
        // Add file to context in two places - files array and "types" array
        ctx.files.push(this)
        ctx[this.typePlural].push(this)
        // Create named key for easy access in two places also
        ctx.files[this.keyName()] = this
        ctx[this.typePlural][this.keyName()] = this

      },

      ctxUNDO (ctx) {

        // Remove named keys in both places
        delete ctx[this.typePlural][this.keyName()]
        delete ctx.files[this.keyName()]
        // Remove file from context in both places
        ctx[this.typePlural] = ctx[this.typePlural].filter(f => f.path.full !== this.path.full)
        ctx.files = ctx.files.filter(f => f.path.full !== this.path.full)

      }

    })
  },

  squeeze () {
    this.squeezed = false
    this.setStats()
    this.getContent()

    // We are done squeezeing unless plugin is Asynchrounous and it takes ...
    // ... care of the flag
    if (!this.isPluginAsynchronous) this.squeezed = true
  },

  setStats () {
    this.stats = fs.statSync(this.path.full)
  },

  getContent () {

    // Read the file to fill `this.input` to have something to parse except ...
    // ... for cases where no read() is desirable like "images" and ...
    // ... "unknowns" or cases where the read() is better performed inside ...
    ///... the plugin like  "datafiles" and "scripts"
    this.read()

    // Execute plugin parse, if any
    if (this.functions.parse)
        this.functions.parse(this, this.parseCallback.bind(this))

    // Set `this.isRenderable` when plugin has `render()`. Means, then file ...
    // ... needs rendering to be shown or written
    if (this.functions.render) this.isRenderable = true

  },

  read () {
    // Method overriden in `datafile`, `image` and `unknown` child classes
    this.input = fs.readFileSync(this.path.full, 'utf8')
  },

  parseCallback (err, output) {
    // Method overriden in `datafile`, `image` and `page` child classes
    if (err) throw err

    this.output = output
  },

  render (context, callback) {
    // Only called by file types with `this.isRenderable` set to `true`
    return this.functions.render.call(this, context, callback)
  },

  keyName () {
    return this.path.relative
  }

}
