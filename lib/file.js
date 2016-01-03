'use strict'

const fs              = require('fs')
const path            = require('path')
const mkdirp          = require('mkdirp').sync
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
    mkdirp(path.dirname(this.path.target.full))
    fs.writeFileSync(this.path.target.full, this.render(context))
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
