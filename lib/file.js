'use strict'

const fs              = require('fs')
const path            = require('path')
const patterns        = require('./patterns')

module.exports = class File  {

  constructor(filepath, baseDir, cache) {
    this.type = this.constructor.name.toLowerCase()
    this.path = this.getPath(filepath, baseDir)
    this.href = this.getHref()
    this.stats = fs.statSync(this.path.full)

    var cached = cache.get(this)
    if (cached) {
      Object.assign(this, {isCached: true}, cached)
    } else {
      this.squeeze()
    }
  }

  // no-ops
  squeeze() {}
  finish() {}

  getPath(filepath, baseDir) {
    var p = {
      full: filepath,
      relative: filepath.replace(baseDir, ''),
      processRelative: path.relative(process.cwd(), filepath)
    }
    Object.assign(p, path.parse(p.relative))
    return p
  }

  getHref() {
    return path.join(this.path.relative)
  }

  readInputFile() {
    this.input = fs.readFileSync(this.path.full, 'utf8')
    this.output = this.input
  }

  get isIndex() {
    return this.path.name === 'index'
  }

}
