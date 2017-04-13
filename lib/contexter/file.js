'use strict'

const fs              = require('fs-extra')
const path            = require('upath')
const pluralize       = require('inflection').pluralize

module.exports = class File  {
  constructor(filepath, sourceDir) {
    this.filepath = filepath
    this.sourceDir = sourceDir
    // TODO: Consider exposing `this.root` as an option from application
    this.root = '/'
    this.history = []
    this.setPath()
  }

  initialize (plugin) {
    this.type = plugin.filetype
    this.typePlural = pluralize(this.type)

    // Inject plugin methods
    this.functions = {}
    Object.assign(this.functions, plugin)

    // Default to synchronous. Plugin could override. Affects `this.squeezed` flag
    this.isPluginAsynchronous = false

    // Set up the contextualize "recipe" steps in `this.history`
    this.addHistorySteps()

    // `file` object ready!
    // ... do first content extraction to populate it
    this.squeeze()
  }

  setPath() {
    this.path = {
      full: this.filepath,
      relative: this.filepath.replace(this.sourceDir, ''),
      processRelative: path.relative(process.cwd(), this.filepath)
    }

    Object.assign(this.path, path.parse(this.path.relative))
  }

  addHistorySteps () {
    // Injection to contextualize "recipe" steps happens on three levels
    // ... precedende order: Core File, Filetypes and Plugins
    //
    // Core File: Only `File class` and appication `file.js` should override
    this.coreFileSteps()
    // Filetype: Only default filetypes and custom filetypes should override
    this.filetypeSteps()
    // Plugins: Only plugins should override
    // TODO: future feature. Plugins could have it's own overrides too!
    this.pluginSteps()
  }

  coreFileSteps () {
    // Define the contextualize first DO step (and last UNDO step)
    this.history.push({
      ctxDO (ctx) {
        var current = ctx

        //TODO: Verify the need to `.replace(/\\/g, '/')`
        // split path in array of directories (linux or winOS dir separators OK)
        var pathArray = this.path.dir.replace(/\\/g, '/').split('/')

        pathArray[0] = this.root

        // initialize context nested properties if do not exist already
        pathArray.forEach(dir => {
          if (dir === '') return // ignore any empty elements caused by split
          if (!current[dir]) current[dir] = {}
          current = current[dir]
        })

        // Add it as named key with the base filename for easy acces ...
        // ... Example: context.foo.bar.baz['myfile.yml']
        current[this.path.base] = this

      },

      ctxUNDO (ctx) {
        var current = ctx

        //TODO: Verify the need to `.replace(/\\/g, '/')`
        // split path in array of directories (linux or winOS dir separators OK)
        var pathArray = this.path.dir.replace(/\\/g, '/').split('/')

        pathArray[0] = this.root

        // initialize context nested properties if do not exist already
        pathArray.forEach(dir => {
          if (dir === '') return // ignore any empty elements caused by split
          if (!current[dir]) current[dir] = {}
          current = current[dir]
        })

        // we are UNDOING so first remove named key
        delete current[this.path.base]

        // Here comes the fun part, remove recursevely upwards to 'root'
        // TODO: remove recursevely upwards to 'root'
      }

    })
  }

  filetypeSteps () {
    // no-op, could be overridden by each filetype as needed
    // this place holder exist for those types that don't need, nor include it
  }

  // TODO: future feature. Plugins could have it's own overrides too!
  pluginSteps () {
    // no-op, could be overridden by each plugin as needed
    // this place holder exist for those plugins that don't need, nor include it
  }

  squeeze () {
    this.squeezed = false
    this.setStats()
    this.getContent()

    // We are done squeezeing unless plugin is Asynchrounous and it takes ...
    // ... care of the flag
    if (!this.isPluginAsynchronous) this.squeezed = true
  }

  setStats () {
    this.stats = fs.statSync(this.path.full)
  }

  getContent () {

    // Read the file to fill `this.input` to have something to parse except ...
    // ... for cases where no read() is desirable like "images" and ...
    // ... "unknowns" or cases where the read() is better performed inside ...
    ///... the plugin like  "datafiles" and "scripts"
    this.read()

    // Execute plugin parse, if any
    if (this.functions.parse)
        this.functions.parse(this, this.parseCallback.bind(this))

  }

  read () {
    // Method overriden in `datafile`, `image` and `unknown` child classes
    this.input = fs.readFileSync(this.path.full, 'utf8')
  }

  parseCallback (err, output) {
    // Method overriden in when output should go to other place like `this.data`
    if (err) throw err

    this.output = output
  }

  contextualizeDO(ctx) {
    this.history.forEach(step => step.ctxDO.call(this, ctx))
  }

  contextualizeUNDO(ctx) {
    this.history.reverse().forEach(step => step.ctxUNDO.call(this, ctx))
  }

}
