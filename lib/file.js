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

  squeeze() {
    // no-op
  }

  finish() {
    // no-op
  }

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
    if (this.isIndex) return this.path.dir

    switch (this.type) {
      case 'layout':
      case 'page':
        return path.join(this.path.dir, this.path.name)
        break
      case 'stylesheet':
        return this.path.relative.replace(patterns.stylesheet, '.css')
        break
      default:
        return path.join(this.path.relative)
    }
  }

  get isIndex() {
    return this.path.name === 'index'
  }

}
