'use strict'

const fs              = require('fs')
const path            = require('path')
const patterns        = require('./patterns')

module.exports = class File  {

  constructor(filepath, baseDir) {
    this.setType()
    this.setPath(filepath, baseDir)
    this.setHref()
    this.setStats()
    this.squeeze()
  }

  squeeze() {
    // no-op, overridden by each type
  }

  render() {
    return this.output
  }

  setType() {
    this.type = this.constructor.name.toLowerCase()
  }

  setPath(filepath, baseDir) {
    this.path = {
      full: filepath,
      relative: filepath.replace(baseDir, ''),
      processRelative: path.relative(process.cwd(), filepath)
    }

    Object.assign(this.path, path.parse(this.path.relative))

    this.path.target = {
      full: this.targetFilename,
      relative: this.targetFilename.replace(baseDir, ''),
      ext: path.parse(this.targetFilename).ext
    }
  }

  setStats() {
    this.stats = fs.statSync(this.path.full)
  }

  setHref() {
    this.href = this.path.relative
  }

  readInputFile() {
    this.input = fs.readFileSync(this.path.full, 'utf8')
    this.output = this.input
  }

  get isIndex() {
    return this.path.name === 'index'
  }

  get targetFilename() {
    return this.path.full
  }

}
