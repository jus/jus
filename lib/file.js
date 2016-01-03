'use strict'

const fs              = require('fs-extra')
const path            = require('path')
const patterns        = require('./patterns')

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

    var targetExt = this.path.ext
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
    this.href = this.path.target.relative
  }

  setStats() {
    this.stats = fs.statSync(this.path.full)
  }

  read() {
    this.input = fs.readFileSync(this.path.full, 'utf8')
    this.output = this.input
  }

  render(context) {
    return this.output
  }

  get isSqueezable() {
    return ['page', 'script', 'stylesheet'].indexOf(this.type) > -1
  }

  write(context){
    fs.mkdirsSync(path.dirname(this.path.target.full))

    switch(this.type) {
      case 'page':
      case 'script':
      case 'stylesheet':
        fs.writeFileSync(this.path.target.full, this.render(context))
        break
      case 'layout':
        // no-op
        break
      case 'datafile':
      case 'image':
      case 'layout':
      default:
        fs.copySync(this.path.target.full, this.render(context))
        break
    }
  }
}
