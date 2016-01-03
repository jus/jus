'use strict'

const fs              = require('fs-extra')
const path            = require('path')
const patterns        = require('./patterns')

module.exports = class File  {

  constructor(filepath, sourceDir, targetDir) {
    this.filepath = filepath
    this.sourceDir = sourceDir
    this.targetDir = targetDir
    this.setType()
    this.setPath()
    this.setHref()
    this.setStats()
    this.squeeze()
  }

  squeeze() {
    // no-op, overridden by each type
  }

  render(context) {
    return this.output
  }

  setType() {
    this.type = this.constructor.name.toLowerCase()
  }

  setPath() {
    this.path = {
      full: this.filepath,
      relative: this.filepath.replace(this.sourceDir, ''),
      processRelative: path.relative(process.cwd(), this.filepath)
    }

    Object.assign(this.path, path.parse(this.path.relative))

    this.path.target = {
      full: this.targetFilename,
      relative: this.targetFilename.replace(this.targetDir, ''),
      ext: this.targetExt
    }
  }

  setStats() {
    this.stats = fs.statSync(this.path.full)
  }

  setHref() {
    this.href = this.path.relative
  }

  read() {
    this.input = fs.readFileSync(this.path.full, 'utf8')
    this.output = this.input
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

  get targetExt() {
    return this.path.ext
  }

  get targetFilename() {
    return this.path.full
      .replace(this.sourceDir, this.targetDir)
      .replace(this.path.ext, this.targetExt)
  }

}
