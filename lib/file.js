'use strict'

const fs              = require('fs')
const path            = require('path')
const patterns        = require('./patterns')

module.exports = class File  {
  constructor(filepath, baseDir, cache) {
    this.kind = null
    this.href = null
    this.parent = null

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
    this.parent = this.getParent()

    if (this.isPlainText) {
      this.content = {
        original: fs.readFileSync(this.path.full, 'utf8'),
        processed: null
      }
    }

  }

  getHref() {
    if (this.isIndex) return this.path.dir
    if (this.kind === 'page') return path.join(this.path.dir, this.path.name)
    return path.join(this.path.relative)
  }

  getParent() {
    if (this.isTopLevel) return '/'
    if (this.isIndex) return path.dirname(this.path.dir)
    return this.path.dir
  }

  getKind() {
    if (this.path.ext.match(patterns.page)) return 'page'
    if (this.path.ext.match(patterns.image)) return 'image'
    if (this.path.ext.match(patterns.dataFile)) return 'dataFile'
    if (this.path.ext.match(patterns.script)) return 'script'
    if (this.path.ext.match(patterns.stylesheet)) return 'stylesheet'
  }

  get isPlainText() {
    return (!this.isBinary)
  }

  get isTopLevel() {
    return this.path.dir === '/'
  }

  get isIndex() {
    return this.path.name === 'index'
  }

  get isBinary() {
    return this.kind === 'image'
  }

}
