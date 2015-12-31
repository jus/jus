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
    var _path = {
      full: filepath,
      relative: filepath.replace(baseDir, ''),
      processRelative: path.relative(process.cwd(), filepath)
    }

    Object.assign(_path, path.parse(_path.relative))

    var target = {
      ext: File.extensions()[this.type]
    }

    if (target.ext) {
      target.full = path.join(_path.dir, [_path.name, target.ext].join(''))
      target.relative = target.full.replace(baseDir, '')
      Object.assign(_path, {target: target})
    }

    this.path = _path
  }

  setStats() {
    this.stats = fs.statSync(this.path.full)
  }

  static extensions() {
    return {
      page: '.html',
      stylesheet: '.css',
      script: '.js',
    }
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

}
