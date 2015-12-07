'use strict'

const fs              = require('fs')
const path            = require('path')
const patterns        = require('./patterns')

module.exports = class File  {
  constructor(filepath, baseDir, cache) {
    this.kind = null
    this.href = null

    this.path = {
      full: filepath,
      relative: filepath.replace(baseDir, ''),
      processRelative: path.relative(process.cwd(), filepath)
    }
    Object.assign(this.path, path.parse(this.path.relative))

    // Timestamps
    this.stats = fs.statSync(this.path.full)

    // Set these as properties so they make it into the handlebars template
    this.kind = this.getKind()
    this.href = this.getHref()

    var cached = cache.get(this)

    if (cached) {
      Object.assign(this, cached)
    } else {
      this.squeeze()
    }
  }

  getHref() {
    if (this.isIndex) return this.path.dir
    if (this.kind === 'page') return path.join(this.path.dir, this.path.name)
    if (this.kind === 'stylesheet') return this.path.relative.replace(patterns.stylesheet, '.css')
    return path.join(this.path.relative)
  }

  getKind() {
    return 'page image datafile script stylesheet'
      .split(' ')
      .find(kind => this.path.ext.match(patterns[kind]))
  }

  get isPlainText() {
    return (!this.isBinary)
  }

  get isBinary() {
    return this.kind === 'image'
  }

  get isTopLevel() {
    return this.path.dir === '/'
  }

  get isIndex() {
    return this.path.name === 'index'
  }

}
