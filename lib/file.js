'use strict'

const fs              = require('fs-extra')
const path            = require('upath')
const pluralize       = require('inflection').pluralize

module.exports = class File  {
  constructor(filepath, sourceDir, targetDir, plugin) {
    this.filepath = filepath
    this.sourceDir = sourceDir
    this.targetDir = targetDir
    this.type = this.constructor.name.toLowerCase()
    this.typePlural = pluralize(this.type)

    // By default all file are "readable" but we do not want them in two cases
    // 1) Do not read images so they are not kept in memory
    // 2) The `Unknown` child class does not need to read files
    this.isReadable = true

    // Inject plugin methods
    this.functions = {}
    Object.assign(this.functions, plugin)

    // Default to synchronous. Plugin could override. Affects `this.squeezed` flag
    this.isPluginAsynchronous = false

    // We are set, initialize paths, href and do first squeeze
    this.setPaths()
    this.setHref()
    this.squeeze()
  }

  setPaths() {
    this.path = {
      full: this.filepath,
      relative: this.filepath.replace(this.sourceDir, ''),
      processRelative: path.relative(process.cwd(), this.filepath)
    }

    Object.assign(this.path, path.parse(this.path.relative))

    let targetFull = this.path.full
      .replace(this.sourceDir, this.targetDir)
      .replace(this.path.ext, this.obtainTargetExt)

    this.path.target = {
      full: targetFull,
      relative: targetFull.replace(this.targetDir, '')
    }

    Object.assign(this.path.target, path.parse(this.path.target.relative))
  }

  setHref() {
    this.href = path.join(process.env.JUS_BASEDIR, this.path.target.relative)
  }

  squeeze () {
    this.squeezed = false
    this.setStats()
    this.getContent()

    // We are done squeezeing unless plugin is Asynchrounous and it takes ...
    // ... care of the flag
    if (!this.isPluginAsynchronous) this.squeezed = true
  }

  setStats() {
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

    // Set `this.isRenderable` when plugin has `render()`. Means, then file ...
    // ... needs rendering to be shown or written
    if (this.functions.render) this.isRenderable = true

  }

  read() {
    // Method overriden in `datafile`, `image` and `unknown` child classes
    this.input = fs.readFileSync(this.path.full, 'utf8')
  }

  parseCallback (err, output) {
    // Method overriden in `datafile`, `image` and `page` child classes
    if (err) throw err

    this.output = output
  }

  render (context, callback) {
    // Only called by file types with `this.isRenderable` set to `true`
    return this.functions.render(this, context, callback)
  }

  contextualize (ctx) {
    // Add file to context in two places - files array and "types" array
    ctx.files.push(this)
    ctx[this.typePlural].push(this)
    // Create named key for easy access in two places also
    ctx.files[this.keyName] = this
    ctx[this.typePlural][this.keyName] = this
    // call children specific contextualize operation, if any defined
    this.distinctContextualize(ctx)
  }

  // IMPORTANT! inverse order of inverse contextualize operation to remove...
  // ... instance cleanly. This means, whatever you DO in `contextualize(ctx)`
  // ... you should UNDO in opposite order in `deContextualize (ctx)`
  deContextualize (ctx) {
    // call children specific decontextualize operation, if any defined
    this.distinctDecontextualize(ctx)
    // Remove named keys in both places
    delete ctx[this.typePlural][this.keyName]
    delete ctx.files[this.keyName]
    // Remove file from context in both places
    ctx[this.typePlural] = ctx[this.typePlural].filter(f => f.path.full !== this.path.full)
    ctx.files = ctx.files.filter(f => f.path.full !== this.path.full)
  }

  distinctContextualize (ctx) {
    // no-op, could be overridden by each type as needed
    // this place holder exist for those types that do not need distinct...
    // ... operations like "layouts"
  }

  distinctDecontextualize (ctx) {
    // no-op, could be overridden by each type as needed
    // IMPORTANT! allways code inverse distinctContextualize operations in ...
    // ... inverse appearance order
  }

  get keyName() {
    return this.path.relative
  }

  get obtainTargetExt () {
    // Default to keep the same file extension, unless there is a ...
    // ... plugin function that could change it
    if (!this.functions.toExtension) return this.path.ext.toLowerCase()
    return this.functions.toExtension(this.path.ext.toLowerCase(), (err, newExt) => {
      if (err) throw err
      return newExt
    })
  }
}
