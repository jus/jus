'use strict'

const fs              = require('fs-extra')
const path            = require('upath')
const pluralize       = require('inflection').pluralize

module.exports = class BaseFile  {

  constructor(filepath, sourceDir, targetDir) {
    this.setType()
/*    this.setPaths(filepath, sourceDir, targetDir)
    this.setHref()
// TODO: move setStats() inside squeeze or other place because does not get called when updateFile()
    this.setStats()
    this.squeeze()
*/
  }

  squeeze() {
    // no-op, overridden by each type
  }

  contextualize (ctx) {
    // Add file to context in two places - files array and "types" array
    ctx.files.push(this)
    ctx[this.typePlural].push(this)
    // Create named key for easy access in two places also
    ctx.files[this.keyName] = this
    ctx[this.typePlural][this.keyName] = this
    // specific contextualize per particular file type
    this.distinctContextualize(ctx)
  }

  deContextualize (ctx) {
    // specific decontextualize per particular file type
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
  }

  distinctDecontextualize (ctx) {
    // no-op, could be overridden by each type as needed
  }

  setType() {
    this.type = this.constructor.name.toLowerCase()
    this.typePlural = pluralize(this.type)
  }
/*
  setPaths(filepath, sourceDir, targetDir) {
    this.path = {
      full: filepath,
      relative: filepath.replace(sourceDir, ''),
      processRelative: path.relative(process.cwd(), filepath)
    }

    Object.assign(this.path, path.parse(this.path.relative))

    var targetExt = this.path.ext.toLowerCase()
    if (this.type === 'page') targetExt = '.html'
    if (this.type === 'script') targetExt = '.js'
    if (this.type === 'stylesheet') targetExt = '.css'

    var targetFull = this.path.full
      .replace(sourceDir, targetDir)
      .replace(this.path.ext, targetExt)

    this.path.target = {
      full: targetFull,
      relative: targetFull.replace(targetDir, '')
    }

    Object.assign(this.path.target, path.parse(this.path.target.relative))
  }

  setHref() {
    this.href = path.join(process.env.JUS_BASEDIR, this.path.target.relative)
  }

  setStats() {
    this.stats = fs.statSync(this.path.full)
  }
*/
  read() {
    this.input = fs.readFileSync(this.path.full, 'utf8')
    // this.output = this.input
  }
/*
  render(context, callback) {
    return callback(null, this.output)
  }

  write(context, done){
    fs.mkdirsSync(path.dirname(this.path.target.full))

    switch(this.type) {
      case 'page':
      case 'script':
      case 'stylesheet':
        return this.render(context, (err, output) => {
          if (err) throw err
          fs.writeFileSync(this.path.target.full, output)
          return done(null)
        })
        break
      case 'layout':
        // no-op
        break
      case 'datafile':
      case 'image':
      case 'unknown':
      default:
        fs.copySync(this.path.full, this.path.target.full)
        break
    }

    return done(null)
  }
*/
  get keyName() {
    return this.path.relative
  }
/*
  get isSqueezable() {
    return ['page', 'script', 'stylesheet'].indexOf(this.type) > -1
  }
*/
}
