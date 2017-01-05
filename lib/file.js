'use strict'

const fs              = require('fs-extra')
const path            = require('upath')

module.exports = class File  {

  constructor(filepath, sourceDir, targetDir) {
    this.setType()
    this.setPaths(filepath, sourceDir, targetDir)
    this.setHref()
    this.setStats()
    this.squeeze()
  }

  squeeze() {
    // no-op, overridden by each type
  }

  setType() {
    this.type = this.constructor.name.toLowerCase()
  }

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

  read() {
    this.input = fs.readFileSync(this.path.full, 'utf8')
    // this.output = this.input
  }

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
      case 'partial':
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

  get keyName() {
    return this.path.relative
  }

  get isSqueezable() {
    return ['page', 'script', 'stylesheet'].indexOf(this.type) > -1
  }
}
