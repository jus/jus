'use strict'

const fs              = require('fs-extra')
const path            = require('upath')

module.exports = class File  {
  constructor(filepath, sourceDir) {
    this.setSourcePaths(filepath, sourceDir)
  }

  setSourcePaths(filepath, sourceDir) {
    this.path = {
      full: filepath,
      relative: filepath.replace(sourceDir, ''),
      processRelative: path.relative(process.cwd(), filepath)
    }

    Object.assign(this.path, path.parse(this.path.relative))
  }

  initialize () {
    this.setTargetPaths(this.obtainTargetExt)
    this.setHref()
    this.squeeze()
}

  setTargetPaths(targetExt) {
    var targetFull = this.path.full
      .replace(this.sourceDir, this.targetDir)
      .replace(this.path.ext, targetExt)

    this.path.target = {
      full: targetFull,
      relative: targetFull.replace(this.targetDir, '')
    }

    Object.assign(this.path.target, path.parse(this.path.target.relative))
  }

  setHref() {
    this.href = path.join(process.env.JUS_BASEDIR, this.path.target.relative)
  }

  read() {
    this.input = fs.readFileSync(this.path.full, 'utf8')
  }

  setStats() {
  this.stats = fs.statSync(this.path.full)
  }

  contextualize (ctx) {
    // Add file to context in two places - files array and "types" array
    ctx.files.push(this)
    ctx[this.typePlural].push(this)
    // Create named key for easy access in two places also
    ctx.files[this.keyName] = this
    ctx[this.typePlural][this.keyName] = this
    // call children specific contextualize operation, if any needed by the...
    // ... child type
    this.distinctContextualize(ctx)
  }

  // IMPORTANT! inverse order of inverse contextualize operation to remove...
  // ... instance cleanly. This means, whatever you DO in `contextualize(ctx)`
  // ... you should UNDO in opposite order in `deContextualize (ctx)`
  deContextualize (ctx) {
    // call children specific decontextualize operation, if any needed by the...
    // ... child type
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
    if (!this.functions.toExt) return this.path.ext.toLowerCase()
    return this.functions.toExt(this.path.ext.toLowerCase(), (err, newExt) => {
      if (err) throw err
      return newExt
    })
  }
}
